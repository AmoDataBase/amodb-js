import { describe, expect, it } from 'vitest';
import { Amodb, AmodbError } from '../src/index';
import type { MoodSource } from '../src/index';
import * as fx from './fixtures';
import { KEY, json, mockFetch } from './helpers';

function clientFor(body: unknown, status = 200) {
  const m = mockFetch(json(body, status));
  const client = new Amodb({ apiKey: KEY, fetch: m.fetch });
  return { client, ...m };
}

describe('moods', () => {
  it('reads measured moods with avg and values on a 0 to 10 scale', async () => {
    const { client, calls } = clientFor(fx.moodsMeasured);
    const moods = await client.movies.moods(155);
    expect(calls[0]?.u.pathname).toBe('/3/movie/155/moods');
    const source: MoodSource = moods.source;
    expect(source).toBe('measured');
    expect(moods.id).toBe(155);
    expect(moods.results.map((r) => r.name)).toEqual(['action', 'fear', 'humor']);
    const first = moods.results[0];
    expect(first?.avg).toBe(3.9);
    expect(first?.values).toEqual([3.6, 3.4, 4.2]);
    for (const meter of moods.results) {
      expect(meter.avg).toBeGreaterThanOrEqual(0);
      expect(meter.avg).toBeLessThanOrEqual(10);
      expect(meter).not.toHaveProperty('value');
    }
  });

  it('reads estimated TV moods with integer averages', async () => {
    const { client, calls } = clientFor(fx.moodsEstimated);
    const moods = await client.tv.moods(1396);
    expect(calls[0]?.u.pathname).toBe('/3/tv/1396/moods');
    expect(moods.source).toBe('estimated');
    expect(moods.results.every((r) => Number.isInteger(r.avg))).toBe(true);
  });

  it('returns a null source and no results for a title without data', async () => {
    const { client } = clientFor(fx.moodsEmpty);
    const moods = await client.movies.moods(1798888);
    expect(moods.source).toBeNull();
    expect(moods.results).toEqual([]);
  });
});

describe('soundtracks', () => {
  it('reads a MusicBrainz album with tracks', async () => {
    const { client, calls } = clientFor(fx.soundtracksMusicbrainz);
    const sounds = await client.movies.soundtracks(155);
    expect(calls[0]?.u.pathname).toBe('/3/movie/155/soundtracks');
    const album = sounds.results[0];
    expect(album?.source).toBe('musicbrainz');
    expect(album?.album).toBe('The Dark Knight');
    expect(album?.artist).toBe('Hans Zimmer & James Newton Howard');
    expect(album?.released).toBe('2008-07-15');
    expect(album?.track_count).toBe(14);
    expect(album?.tracks[0]).toEqual({
      disc: 1,
      number: 1,
      title: 'Why So Serious?',
      artist: 'Hans Zimmer',
      duration_ms: 554000,
    });
  });

  it('reads a Deezer album on a TV path', async () => {
    const { client, calls } = clientFor(fx.soundtracksDeezer);
    const sounds = await client.tv.soundtracks(27205);
    expect(calls[0]?.u.pathname).toBe('/3/tv/27205/soundtracks');
    expect(sounds.results[0]?.source).toBe('deezer');
  });

  it('returns an empty results list when no album is known', async () => {
    const { client } = clientFor(fx.soundtracksEmpty);
    expect((await client.movies.soundtracks(424)).results).toEqual([]);
  });
});

describe('ratings', () => {
  it('reads each provider as value and votes', async () => {
    const { client, calls } = clientFor(fx.ratingsFull);
    const ratings = await client.movies.ratings(550);
    expect(calls[0]?.u.pathname).toBe('/3/movie/550/ratings');
    expect(Object.keys(ratings)).toEqual(['id', 'imdb', 'kinopoisk', 'metacritic', 'rotten_tomatoes', 'tmdb']);
    expect(ratings.imdb).toEqual({ value: 8.8, votes: 2669989 });
    expect(ratings.kinopoisk?.votes).toBeNull();
    expect(ratings.metacritic?.value).toBe(67);
    expect(ratings.rotten_tomatoes?.value).toBe(81);
    expect(ratings.tmdb?.value).toBe(8.437);
  });

  it('returns null for every provider with no score', async () => {
    const { client } = clientFor(fx.ratingsEmpty);
    const ratings = await client.tv.ratings(1);
    expect(ratings.imdb).toBeNull();
    expect(ratings.kinopoisk).toBeNull();
    expect(ratings.metacritic).toBeNull();
    expect(ratings.rotten_tomatoes).toBeNull();
    expect(ratings.tmdb).toBeNull();
  });
});

describe('wikidata', () => {
  it('reads money with value and currency, plus awards and sitelinks', async () => {
    const { client, calls } = clientFor(fx.wikidataFightClub);
    const facts = await client.movies.wikidata(550);
    expect(calls[0]?.u.pathname).toBe('/3/movie/550/wikidata');
    expect(facts.id).toBe(550);
    expect(facts.wikidata_id).toBe('Q190050');
    expect(facts.budget).toEqual({ value: 63000000, currency: 'USD' });
    expect(facts.box_office).toEqual({ value: 101209702, currency: 'USD', worldwide: true });
    expect(facts.budget).not.toHaveProperty('amount');
    expect(facts.sitelinks.en).toBe('Fight Club');
    expect(facts.awards[1]).toMatchObject({ wikidata_id: 'Q943908', year: 2000 });
    expect(facts.awards[0]?.year).toBeUndefined();
    expect(facts.based_on[0]?.author).toEqual({ wikidata_id: 'Q268181', label: 'Chuck Palahniuk' });
    expect(facts.follows).toBeNull();
    expect(facts.followed_by).toBeNull();
  });

  it('reads follows and followed_by links with catalog ids', async () => {
    const { client } = clientFor(fx.wikidataMatrixReloaded);
    const facts = await client.movies.wikidata(604);
    expect(facts.follows).toEqual({ wikidata_id: 'Q83495', label: 'The Matrix', tmdb_id: 603, media_type: 'movie' });
    expect(facts.followed_by?.tmdb_id).toBe(605);
    expect(facts.awards).toEqual([]);
    expect(facts.based_on).toEqual([]);
  });

  it('allows a null author in based_on', async () => {
    const { client } = clientFor(fx.wikidataDarkKnight);
    const facts = await client.tv.wikidata(155);
    expect(facts.based_on[0]).toMatchObject({ wikidata_id: 'Q2695156', author: null });
    expect(facts.original_broadcasters).toEqual([]);
  });
});

describe('showtimes', () => {
  it('sends no country by default and reads the per-country summary', async () => {
    const { client, calls } = clientFor(fx.showtimesSummary);
    const showtimes = await client.movies.showtimes(550);
    expect(calls[0]?.u.pathname).toBe('/3/movie/550/showtimes');
    expect(calls[0]?.u.searchParams.has('country')).toBe(false);
    expect(showtimes.country).toBeNull();
    expect(showtimes.results).toEqual([]);
    expect(showtimes.countries[0]).toEqual({
      country: 'RU',
      name: 'Russia',
      venues: 2,
      cities: 1,
      showtimes: 7,
      first_day: '2026-10-18',
      last_day: '2026-10-21',
    });
  });

  it('sends country when given and reads venues with showtimes', async () => {
    const { client, calls } = clientFor(fx.showtimesRussia);
    const showtimes = await client.movies.showtimes(550, 'RU', { language: 'ru-RU' });
    expect(calls[0]?.u.searchParams.get('country')).toBe('RU');
    expect(calls[0]?.u.searchParams.get('language')).toBe('ru-RU');
    expect(showtimes.country).toBe('RU');
    const venue = showtimes.results[0];
    expect(venue?.chain).toEqual({ key: 'mirage-ru', name: expect.any(String) });
    expect(venue?.timezone).toBe('Europe/Moscow');
    expect(venue?.latitude).toBeNull();
    const show = venue?.showtimes[0];
    expect(show?.start).toBe('2026-10-18T21:40');
    expect(show?.date).toBe('2026-10-18');
    expect(show?.formats).toEqual(['2D']);
    expect(show?.sold_out).toBe(false);
    expect(show?.price).toBeNull();
  });

  it('works for TV with and without a country', async () => {
    const { client, calls } = clientFor(fx.showtimesEmpty);
    const none = await client.tv.showtimes(1396);
    const ru = await client.tv.showtimes(1396, 'RU');
    expect(calls[0]?.u.pathname).toBe('/3/tv/1396/showtimes');
    expect(calls[0]?.u.searchParams.has('country')).toBe(false);
    expect(calls[1]?.u.searchParams.get('country')).toBe('RU');
    expect(none.countries).toEqual([]);
    expect(ru.results).toEqual([]);
  });
});

describe('append_to_response with the amodb sections', () => {
  it('sends the section names and reads the appended shapes', async () => {
    const { client, calls } = clientFor(fx.movieAppended);
    const movie = await client.movies.details(550, {
      appendToResponse: ['moods', 'soundtracks', 'ratings', 'wikidata', 'showtimes', 'lists', 'alternative_titles', 'external_ids'],
    });
    const q = calls[0]!.u.searchParams;
    expect(q.get('append_to_response')).toBe('moods,soundtracks,ratings,wikidata,showtimes,lists,alternative_titles,external_ids');
    expect(q.has('country')).toBe(false);
    // moods, soundtracks and ratings have no id when appended; wikidata and showtimes keep it.
    expect(movie.moods?.id).toBeUndefined();
    expect(movie.moods?.source).toBe('estimated');
    expect(movie.soundtracks?.id).toBeUndefined();
    expect(movie.soundtracks?.results).toEqual([]);
    expect(movie.ratings?.id).toBeUndefined();
    expect(movie.ratings?.imdb?.value).toBe(8.8);
    expect(movie.wikidata?.id).toBe(550);
    expect(movie.showtimes?.id).toBe(550);
    expect(movie.showtimes?.country).toBeNull();
    expect(movie.showtimes?.countries[0]?.country).toBe('RU');
    expect(movie.lists?.results[0]?.name).toBeTypeOf('string');
    expect(movie.alternative_titles?.titles).toEqual([]);
    expect(movie.external_ids?.kinopoisk_id).toBe('361');
  });

  it('sends country for the appended showtimes of a movie and a show', async () => {
    const { client, calls } = clientFor({});
    await client.movies.details(550, { appendToResponse: ['showtimes'], country: 'RU' });
    await client.tv.details(1396, { appendToResponse: ['showtimes'], country: 'DE' });
    expect(calls[0]?.u.searchParams.get('country')).toBe('RU');
    expect(calls[1]?.u.searchParams.get('country')).toBe('DE');
  });

  it('accepts the TV only and person only section names', async () => {
    const { client, calls } = clientFor({});
    await client.tv.details(1396, { appendToResponse: ['content_ratings', 'episode_groups', 'showtimes'] });
    await client.people.details(287, { appendToResponse: ['combined_credits', 'movie_credits', 'tv_credits', 'images', 'external_ids'] });
    await client.tv.season(1396, 1, { appendToResponse: ['credits'] });
    await client.tv.episode(1396, 1, 1, { appendToResponse: ['translations'] });
    expect(calls[0]?.u.searchParams.get('append_to_response')).toBe('content_ratings,episode_groups,showtimes');
    expect(calls[1]?.u.searchParams.get('append_to_response')).toBe('combined_credits,movie_credits,tv_credits,images,external_ids');
    expect(calls[2]?.u.searchParams.get('append_to_response')).toBe('credits');
    expect(calls[3]?.u.searchParams.get('append_to_response')).toBe('translations');
  });

  it('rejects names the API does not offer at compile time', () => {
    const { client } = clientFor({});
    // The calls are never awaited; the directives are checked by `npm run typecheck`.
    // @ts-expect-error aggregate_credits is not offered
    void client.tv.details(1396, { appendToResponse: ['aggregate_credits'] });
    // @ts-expect-error changes is not offered
    void client.movies.details(550, { appendToResponse: ['changes'] });
    // @ts-expect-error release_dates is movie only
    void client.tv.details(1396, { appendToResponse: ['release_dates'] });
    // @ts-expect-error content_ratings is TV only
    void client.movies.details(550, { appendToResponse: ['content_ratings'] });
    expect(true).toBe(true);
  });
});

describe('find', () => {
  it('looks up by kinopoisk_id and reads movie_results with media_type', async () => {
    const { client, calls } = clientFor(fx.findKinopoisk);
    const found = await client.find('361', 'kinopoisk_id');
    expect(calls[0]?.u.pathname).toBe('/3/find/361');
    expect(calls[0]?.u.searchParams.get('external_source')).toBe('kinopoisk_id');
    expect(Object.keys(found)).toEqual([
      'movie_results',
      'person_results',
      'tv_results',
      'tv_episode_results',
      'tv_season_results',
    ]);
    expect(found.movie_results[0]?.id).toBe(550);
    expect(found.movie_results[0]?.media_type).toBe('movie');
    expect(found.tv_episode_results).toEqual([]);
    expect(found.tv_season_results).toEqual([]);
  });

  it('looks up a person by wikidata_id', async () => {
    const { client, calls } = clientFor(fx.findPerson);
    const found = await client.find('Q35332', 'wikidata_id');
    expect(calls[0]?.u.searchParams.get('external_source')).toBe('wikidata_id');
    expect(found.person_results[0]?.media_type).toBe('person');
    expect(found.person_results[0]?.known_for).toEqual([]);
  });

  it.each([
    'imdb_id',
    'freebase_mid',
    'freebase_id',
    'tvdb_id',
    'tvrage_id',
    'facebook_id',
    'twitter_id',
    'instagram_id',
    'tiktok_id',
    'youtube_id',
    'wikidata_id',
    'kinopoisk_id',
  ] as const)('sends external_source=%s', async (source) => {
    const { client, calls } = clientFor(fx.findKinopoisk);
    await client.find('x', source);
    expect(calls[0]?.u.searchParams.get('external_source')).toBe(source);
  });
});

describe('external ids', () => {
  it('reads kinopoisk_id as a string on movies and TV', async () => {
    const movie = await clientFor(fx.movieExternalIds).client.movies.externalIds(550);
    expect(movie.kinopoisk_id).toBe('361');
    expect(movie.imdb_id).toBe('tt0137523');
    const tv = await clientFor(fx.tvExternalIds).client.tv.externalIds(1396);
    expect(tv.kinopoisk_id).toBeTypeOf('string');
    expect(tv.tvdb_id).toBeTypeOf('number');
    expect(tv.tvrage_id).toBeNull();
  });

  it('reads the person ids', async () => {
    const { client, calls } = clientFor(fx.personExternalIds);
    const ids = await client.people.externalIds(287);
    expect(calls[0]?.u.pathname).toBe('/3/person/287/external_ids');
    expect(ids.imdb_id).toBe('nm0000093');
    expect(ids.tiktok_id).toBeNull();
    expect(ids.youtube_id).toBeNull();
  });
});

describe('other served paths', () => {
  it('movies.latest and tv.latest call the latest paths', async () => {
    const movie = clientFor(fx.movieLatest);
    expect((await movie.client.movies.latest()).id).toBe(1798888);
    expect(movie.calls[0]?.u.pathname).toBe('/3/movie/latest');
    const tv = clientFor(fx.tvLatest);
    expect((await tv.client.tv.latest()).id).toBe(338695);
    expect(tv.calls[0]?.u.pathname).toBe('/3/tv/latest');
  });

  it('lists are paged for movies and TV', async () => {
    const movie = clientFor(fx.movieLists);
    const lists = await movie.client.movies.lists(550, 2);
    expect(movie.calls[0]?.u.pathname).toBe('/3/movie/550/lists');
    expect(movie.calls[0]?.u.searchParams.get('page')).toBe('2');
    expect(lists.id).toBe(550);
    expect(lists.results[0]?.item_count).toBeTypeOf('number');
    expect(lists.total_pages).toBeGreaterThan(1);

    const tv = clientFor(fx.movieLists);
    await tv.client.tv.lists(1396, { page: 3 });
    expect(tv.calls[0]?.u.pathname).toBe('/3/tv/1396/lists');
    expect(tv.calls[0]?.u.searchParams.get('page')).toBe('3');
  });

  it('episode groups use a string id', async () => {
    const { client, calls } = clientFor(fx.tvEpisodeGroups);
    const groups = await client.tv.episodeGroups(1396);
    expect(calls[0]?.u.pathname).toBe('/3/tv/1396/episode_groups');
    expect(groups.results[0]?.id).toBeTypeOf('string');
    expect(groups.results[0]?.network).toBeNull();
  });

  it('movie alternative titles use titles and TV uses results', async () => {
    const movie = await clientFor(fx.movieAlternativeTitles).client.movies.alternativeTitles(550);
    expect(movie.titles).toEqual([]);
    const tv = await clientFor(fx.tvAlternativeTitles).client.tv.alternativeTitles(1396);
    expect(tv.results[0]?.iso_3166_1).toBe('AZ');
  });

  it('content ratings carry descriptors', async () => {
    const tv = await clientFor(fx.tvContentRatings).client.tv.contentRatings(1396);
    expect(tv.results[0]).toMatchObject({ descriptors: [], iso_3166_1: 'AT', rating: '16' });
  });

  it('season and episode credits call their paths', async () => {
    const season = clientFor(fx.episodeCredits);
    await season.client.tv.seasonCredits(1396, 1);
    expect(season.calls[0]?.u.pathname).toBe('/3/tv/1396/season/1/credits');
    const episode = clientFor(fx.episodeCredits);
    const credits = await episode.client.tv.episodeCredits(1396, 1, 1);
    expect(episode.calls[0]?.u.pathname).toBe('/3/tv/1396/season/1/episode/1/credits');
    expect(credits.cast).toEqual([]);
    expect(credits.guest_stars[0]?.character).toBeTypeOf('string');
  });

  it('keyword movies are paged', async () => {
    const { client, calls } = clientFor({ id: 818, page: 1, results: [], total_pages: 1, total_results: 0 });
    const movies = await client.keywords.movies(818, 2);
    expect(calls[0]?.u.pathname).toBe('/3/keyword/818/movies');
    expect(calls[0]?.u.searchParams.get('page')).toBe('2');
    expect(movies.id).toBe(818);
  });

  it('collection search reads collection results', async () => {
    const { client, calls } = clientFor(fx.searchCollection);
    const found = await client.search.collection('matrix');
    expect(calls[0]?.u.pathname).toBe('/3/search/collection');
    expect(found.results[0]?.name).toBe('The Matrix Collection');
    expect(found.results[0]?.original_name).toBeTypeOf('string');
  });
});

describe('paths that are not offered', () => {
  it('has no methods for them', () => {
    const { client } = clientFor({});
    const tv = client.tv as unknown as Record<string, unknown>;
    const movies = client.movies as unknown as Record<string, unknown>;
    const people = client.people as unknown as Record<string, unknown>;
    expect(tv.aggregateCredits).toBeUndefined();
    expect(tv.changes).toBeUndefined();
    expect(movies.changes).toBeUndefined();
    expect(movies.contentRatings).toBeUndefined();
    expect(people.translations).toBeUndefined();
    expect(people.taggedImages).toBeUndefined();
    expect(people.latest).toBeUndefined();
    expect((client as unknown as Record<string, unknown>).credits).toBeUndefined();
    expect((client as unknown as Record<string, unknown>).account).toBeUndefined();
  });

  it('keeps mapping a 404 with status_code 34 to AmodbError', async () => {
    const body = { success: false, status_code: 34, status_message: 'The resource you requested could not be found.' };
    const { client } = clientFor(body, 404);
    const error = (await client.movies.moods(999999999).catch((e: unknown) => e)) as AmodbError;
    expect(error).toBeInstanceOf(AmodbError);
    expect(error.status).toBe(404);
    expect(error.statusCode).toBe(34);
    const other = (await client.request('/movie/550/aggregate_credits').catch((e: unknown) => e)) as AmodbError;
    expect(other.status).toBe(404);
    expect(other.statusCode).toBe(34);
  });

  it('keeps mapping a 405 with status_code 37 to AmodbError', async () => {
    const body = { success: false, status_code: 37, status_message: 'This method is not offered by amodb.' };
    const { client } = clientFor(body, 405);
    const error = (await client.request('/account/1').catch((e: unknown) => e)) as AmodbError;
    expect(error).toBeInstanceOf(AmodbError);
    expect(error.status).toBe(405);
    expect(error.statusCode).toBe(37);
    expect(error.statusMessage).toBe('This method is not offered by amodb.');
  });
});
