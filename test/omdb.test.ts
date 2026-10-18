import { describe, expect, it } from 'vitest';
import { Amodb, AmodbError } from '../src/index';
import { omdbSearch, omdbSeries } from './fixtures';
import { KEY, json, mockFetch } from './helpers';

const fightClub = {
  Title: 'Fight Club',
  Year: '1999',
  Rated: 'R',
  Released: '15 Oct 1999',
  Runtime: '139 min',
  Genre: 'Drama',
  Director: 'David Fincher',
  Writer: 'Chuck Palahniuk',
  Actors: 'Brad Pitt, Edward Norton',
  Plot: 'An insomniac office worker forms an underground club.',
  Language: 'English',
  Country: 'United States',
  Awards: 'Nominated for 1 Oscar.',
  Poster: 'https://img.amodb.dev/t/p/w300/abc.jpg',
  Ratings: [{ Source: 'Internet Movie Database', Value: '8.8/10' }],
  Metascore: '67',
  imdbRating: '8.8',
  imdbVotes: '2,300,000',
  imdbID: 'tt0137523',
  Type: 'movie',
  Response: 'True',
};

function setup(reply = json(fightClub)) {
  const m = mockFetch(reply);
  const client = new Amodb({ apiKey: KEY, fetch: m.fetch, language: 'ru-RU' });
  return { client, ...m };
}

describe('omdb', () => {
  it('byId sends apikey and i, and returns the body', async () => {
    const { client, calls } = setup();
    const title = await client.omdb.byId('tt0137523', { plot: 'full', type: 'movie', year: 1999 });
    const q = calls[0]!.u.searchParams;
    expect(calls[0]!.u.origin + calls[0]!.u.pathname).toBe('https://api.amodb.dev/omdb/');
    expect(q.get('apikey')).toBe(KEY);
    expect(q.get('i')).toBe('tt0137523');
    expect(q.get('plot')).toBe('full');
    expect(q.get('type')).toBe('movie');
    expect(q.get('y')).toBe('1999');
    expect(title.Title).toBe('Fight Club');
    expect(title.imdbID).toBe('tt0137523');
  });

  it('keeps the key in the query and sends no Authorization header', async () => {
    const { client, calls } = setup();
    await client.omdb.byId('tt0137523');
    expect(calls[0]?.headers.Authorization).toBeUndefined();
    expect(calls[0]?.u.searchParams.get('apikey')).toBe(KEY);
  });

  it('does not send the default language', async () => {
    const { client, calls } = setup();
    await client.omdb.byId('tt0137523');
    expect(calls[0]?.u.searchParams.has('language')).toBe(false);
  });

  it('byTitle sends t, y, type and plot', async () => {
    const { client, calls } = setup();
    await client.omdb.byTitle('Fight Club', { type: 'movie', year: '1999', plot: 'short' });
    const q = calls[0]!.u.searchParams;
    expect(q.get('t')).toBe('Fight Club');
    expect(q.get('y')).toBe('1999');
    expect(q.get('type')).toBe('movie');
    expect(q.get('plot')).toBe('short');
    expect(q.has('i')).toBe(false);
  });

  it('search sends s, type, y and page', async () => {
    const body = {
      Search: [{ Title: 'Fight Club', Year: '1999', imdbID: 'tt0137523', Type: 'movie', Poster: 'N/A' }],
      totalResults: '1',
      Response: 'True',
    };
    const { client, calls } = setup(json(body));
    const result = await client.omdb.search('fight', { type: 'movie', year: 1999, page: 2 });
    const q = calls[0]!.u.searchParams;
    expect(q.get('s')).toBe('fight');
    expect(q.get('type')).toBe('movie');
    expect(q.get('y')).toBe('1999');
    expect(q.get('page')).toBe('2');
    expect(result.Search[0]?.imdbID).toBe('tt0137523');
    expect(result.totalResults).toBe('1');
  });

  it('reads a series with totalSeasons and none of the movie only fields', async () => {
    const { client, calls } = setup(json(omdbSeries));
    const series = await client.omdb.byId('tt0903747');
    expect(calls[0]?.u.searchParams.get('i')).toBe('tt0903747');
    expect(series.Type).toBe('series');
    expect(series.totalSeasons).toBe('5');
    expect(series).not.toHaveProperty('DVD');
    expect(series).not.toHaveProperty('BoxOffice');
    expect(series.Ratings[0]?.Source).toBe('Internet Movie Database');
  });

  it('reads search hits with a string totalResults', async () => {
    const { client } = setup(json(omdbSearch));
    const found = await client.omdb.search('matrix', { type: 'movie' });
    expect(found.Search).toHaveLength(2);
    expect(found.Search[0]).toMatchObject({ Title: 'The Matrix', Year: '1999', imdbID: 'tt0133093', Type: 'movie' });
    expect(found.totalResults).toBe('23');
  });

  it('rejects the episode type at compile time', () => {
    const { client } = setup();
    // @ts-expect-error episodes are not offered; checked by `npm run typecheck`
    void client.omdb.byTitle('x', { type: 'episode' });
    expect(true).toBe(true);
  });

  it('passes extra params and never lets them replace the key', async () => {
    const { client, calls } = setup();
    await client.omdb.byId('tt0944947', { params: { r: 'json', apikey: 'other' } });
    const q = calls[0]!.u.searchParams;
    expect(q.get('r')).toBe('json');
    expect(q.get('apikey')).toBe(KEY);
  });

  it('accepts an omdbUrl without a trailing slash', async () => {
    const m = mockFetch(json(fightClub));
    const client = new Amodb({ apiKey: KEY, fetch: m.fetch, omdbUrl: 'https://example.test/omdb' });
    await client.omdb.byId('tt0137523');
    expect(m.calls[0]?.url.startsWith('https://example.test/omdb?apikey=')).toBe(true);
  });

  it('raises AmodbError when Response is False', async () => {
    const body = { Response: 'False', Error: 'Movie not found!' };
    const { client } = setup(json(body));
    const error = (await client.omdb.byTitle('nope').catch((e: unknown) => e)) as AmodbError;
    expect(error).toBeInstanceOf(AmodbError);
    expect(error.status).toBe(200);
    expect(error.statusCode).toBeNull();
    expect(error.statusMessage).toBe('Movie not found!');
    expect(error.body).toEqual(body);
  });

  it('raises AmodbError for search with Response False', async () => {
    const { client } = setup(json({ Response: 'False', Error: 'Too many results.' }));
    await expect(client.omdb.search('a')).rejects.toMatchObject({ status: 200, statusMessage: 'Too many results.' });
  });

  it('maps an HTTP failure with an OMDb style body', async () => {
    const { client } = setup(json({ Response: 'False', Error: 'Invalid API key!' }, 401));
    const error = (await client.omdb.byId('tt0137523').catch((e: unknown) => e)) as AmodbError;
    expect(error).toBeInstanceOf(AmodbError);
    expect(error.status).toBe(401);
    expect(error.statusMessage).toBe('Invalid API key!');
  });

  it('maps an HTTP failure with a TMDB style body', async () => {
    const { client } = setup(json({ success: false, status_code: 7, status_message: 'Invalid API key' }, 401));
    const error = (await client.omdb.byId('tt0137523').catch((e: unknown) => e)) as AmodbError;
    expect(error.statusCode).toBe(7);
  });
});

describe('imageUrl', () => {
  it('builds the default URL', async () => {
    const { client } = setup();
    expect(client.imageUrl('/abc.jpg')).toBe('https://img.amodb.dev/t/p/w500/abc.jpg');
  });

  it('takes a size and adds a missing slash', async () => {
    const { client } = setup();
    expect(client.imageUrl('abc.jpg', 'original')).toBe('https://img.amodb.dev/t/p/original/abc.jpg');
    expect(client.imageUrl('/abc.jpg', 'w92')).toBe('https://img.amodb.dev/t/p/w92/abc.jpg');
  });

  it('returns null for null, undefined and empty paths', async () => {
    const { client } = setup();
    expect(client.imageUrl(null)).toBeNull();
    expect(client.imageUrl(undefined)).toBeNull();
    expect(client.imageUrl('')).toBeNull();
  });

  it('uses imageBaseUrl from the options', () => {
    const client = new Amodb({ apiKey: KEY, imageBaseUrl: 'https://cdn.example.test/img/', fetch: mockFetch().fetch });
    expect(client.imageUrl('/a.jpg', 'w300')).toBe('https://cdn.example.test/img/w300/a.jpg');
  });
});
