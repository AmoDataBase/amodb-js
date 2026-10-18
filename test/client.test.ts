import { afterEach, describe, expect, it, vi } from 'vitest';
import { Amodb, VERSION, createClient } from '../src/index';
import { KEY, json, mockFetch } from './helpers';

function setup(options: Partial<ConstructorParameters<typeof Amodb>[0]> = {}) {
  const m = mockFetch(json({ ok: true }));
  const client = new Amodb({ apiKey: KEY, fetch: m.fetch, ...options });
  return { client, ...m };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('construction', () => {
  it('throws on an empty key', () => {
    expect(() => new Amodb({ apiKey: '' })).toThrow(TypeError);
    expect(() => new Amodb({ apiKey: '   ' })).toThrow(/apiKey is required/);
    expect(() => new Amodb({} as never)).toThrow(TypeError);
    expect(() => new (Amodb as never as new (o?: unknown) => Amodb)()).toThrow(TypeError);
  });

  it('rejects an unknown auth mode', () => {
    expect(() => new Amodb({ apiKey: KEY, auth: 'cookie' as never })).toThrow(/auth must be/);
  });

  it('createClient returns a client', async () => {
    const m = mockFetch(json({ id: 1 }));
    const client = createClient({ apiKey: KEY, fetch: m.fetch });
    expect(client).toBeInstanceOf(Amodb);
    expect(await client.request('/movie/1')).toEqual({ id: 1 });
  });

  it('trims whitespace around the key', async () => {
    const { client, calls } = setup({ apiKey: `  ${KEY}\n` });
    await client.request('/configuration');
    expect(calls[0]?.headers.Authorization).toBe(`Bearer ${KEY}`);
  });

  it('uses the global fetch when none is injected', async () => {
    const m = mockFetch(json({ id: 550 }));
    vi.stubGlobal('fetch', m.fetch);
    const client = new Amodb({ apiKey: KEY });
    expect(await client.movies.details(550)).toEqual({ id: 550 });
    expect(m.calls[0]?.url).toBe('https://api.amodb.dev/3/movie/550');
  });

  it('prefers the injected fetch over the global one', async () => {
    const globalMock = mockFetch(json({ from: 'global' }));
    vi.stubGlobal('fetch', globalMock.fetch);
    const { client } = setup();
    await client.request('/configuration');
    expect(globalMock.fn).not.toHaveBeenCalled();
  });

  it('exposes the version', () => {
    expect(VERSION).toBe('0.1.0');
  });
});

describe('auth', () => {
  it('sends a Bearer header by default and keeps the key out of the URL', async () => {
    const { client, calls } = setup();
    await client.movies.details(550);
    const call = calls[0]!;
    expect(call.headers.Authorization).toBe(`Bearer ${KEY}`);
    expect(call.u.searchParams.has('api_key')).toBe(false);
    expect(call.url).not.toContain(KEY);
  });

  it('sends api_key in the query in query mode and no Authorization header', async () => {
    const { client, calls } = setup({ auth: 'query' });
    await client.movies.details(550, { language: 'en-US' });
    const call = calls[0]!;
    expect(call.u.searchParams.get('api_key')).toBe(KEY);
    expect(call.u.searchParams.get('language')).toBe('en-US');
    expect(call.headers.Authorization).toBeUndefined();
  });

  it('does not let params override the key in query mode', async () => {
    const { client, calls } = setup({ auth: 'query' });
    await client.request('/configuration', { api_key: 'other' });
    expect(calls[0]?.u.searchParams.get('api_key')).toBe(KEY);
  });

  it('sends the user agent and accepts JSON', async () => {
    const { client, calls } = setup();
    await client.request('/configuration');
    expect(calls[0]?.headers['User-Agent']).toBe('amodb-js/0.1.0');
    expect(calls[0]?.headers.Accept).toBe('application/json');
  });

  it('lets the user agent be replaced', async () => {
    const { client, calls } = setup({ userAgent: 'my-app/2' });
    await client.request('/configuration');
    expect(calls[0]?.headers['User-Agent']).toBe('my-app/2');
  });
});

describe('urls', () => {
  it('uses https://api.amodb.dev/3 by default', async () => {
    const { client, calls } = setup();
    await client.request('/movie/550');
    expect(calls[0]?.url).toBe('https://api.amodb.dev/3/movie/550');
  });

  it('accepts a custom baseUrl with a trailing slash and a path without a leading slash', async () => {
    const { client, calls } = setup({ baseUrl: 'https://example.test/3/' });
    await client.request('movie/550');
    expect(calls[0]?.url).toBe('https://example.test/3/movie/550');
  });

  it('adds params after an existing query string in the path', async () => {
    const { client, calls } = setup();
    await client.request('/discover/movie?page=2', { language: 'fr' });
    expect(calls[0]?.u.searchParams.get('page')).toBe('2');
    expect(calls[0]?.u.searchParams.get('language')).toBe('fr');
  });

  it('percent-encodes path segments', async () => {
    const { client, calls } = setup();
    await client.find('tt 1/2?x', 'imdb_id');
    expect(calls[0]?.url).toContain('/find/tt%201%2F2%3Fx?');
    expect(calls[0]?.u.pathname).toBe('/3/find/tt%201%2F2%3Fx');

    await client.movies.details('a/b');
    expect(calls[1]?.u.pathname).toBe('/3/movie/a%2Fb');
  });
});

describe('query encoding', () => {
  it('turns booleans into true and false', async () => {
    const { client, calls } = setup();
    await client.request('/x', { a: true, b: false });
    expect(calls[0]?.u.search).toBe('?a=true&b=false');
  });

  it('joins arrays with commas', async () => {
    const { client, calls } = setup();
    await client.request('/x', { with_genres: [28, 12], tags: ['a', 'b'] });
    expect(calls[0]?.url).toContain('with_genres=28,12');
    expect(calls[0]?.url).toContain('tags=a,b');
  });

  it('drops null, undefined and empty arrays', async () => {
    const { client, calls } = setup();
    await client.request('/x', { a: null, b: undefined, c: [], d: 0, e: '' });
    expect(calls[0]?.u.search).toBe('?d=0&e=');
  });

  it('percent-encodes values and keeps keys as given', async () => {
    const { client, calls } = setup();
    await client.request('/x', { query: 'star wars & more', 'vote_average.gte': 7.5 });
    expect(calls[0]?.url).toContain('query=star%20wars%20%26%20more');
    expect(calls[0]?.url).toContain('vote_average.gte=7.5');
  });

  it('encodes commas inside array items', async () => {
    const { client, calls } = setup();
    await client.request('/x', { q: ['a,b', 'c'] });
    expect(calls[0]?.url).toContain('q=a%2Cb,c');
  });
});

describe('language', () => {
  it('sends the default language', async () => {
    const { client, calls } = setup({ language: 'ru-RU' });
    await client.movies.details(550);
    expect(calls[0]?.u.searchParams.get('language')).toBe('ru-RU');
  });

  it('lets a per-call language override the default', async () => {
    const { client, calls } = setup({ language: 'ru-RU' });
    await client.movies.details(550, { language: 'pt-BR' });
    await client.request('/configuration', { language: 'fr-FR' });
    expect(calls[0]?.u.searchParams.get('language')).toBe('pt-BR');
    expect(calls[1]?.u.searchParams.get('language')).toBe('fr-FR');
  });

  it('keeps the default when the per-call language is undefined', async () => {
    const { client, calls } = setup({ language: 'ru-RU' });
    await client.movies.details(550, { language: undefined });
    expect(calls[0]?.u.searchParams.get('language')).toBe('ru-RU');
  });

  it('sends no language when null is passed', async () => {
    const { client, calls } = setup({ language: 'ru-RU' });
    await client.movies.details(550, { language: null });
    expect(calls[0]?.u.searchParams.has('language')).toBe(false);
  });

  it('sends no language when no default is set', async () => {
    const { client, calls } = setup();
    await client.movies.details(550);
    expect(calls[0]?.u.searchParams.has('language')).toBe(false);
  });
});

describe('append_to_response and options', () => {
  it('joins appendToResponse with commas', async () => {
    const { client, calls } = setup();
    await client.movies.details(550, { appendToResponse: ['credits', 'images', 'ratings', 'watch/providers'] });
    expect(calls[0]?.u.searchParams.get('append_to_response')).toBe('credits,images,ratings,watch/providers');
  });

  it('maps camelCase options to snake_case and merges the params passthrough', async () => {
    const { client, calls } = setup();
    await client.search.movie('fight club', {
      page: 2,
      year: 1999,
      primaryReleaseYear: 1998,
      params: { region: 'US', page: 9 },
    });
    const q = calls[0]!.u.searchParams;
    expect(calls[0]?.u.pathname).toBe('/3/search/movie');
    expect(q.get('query')).toBe('fight club');
    expect(q.get('year')).toBe('1999');
    expect(q.get('primary_release_year')).toBe('1998');
    expect(q.get('region')).toBe('US');
    expect(q.get('page')).toBe('2');
  });

  it('accepts a bare page number', async () => {
    const { client, calls } = setup();
    await client.movies.popular(3);
    await client.tv.similar(1399, 2);
    await client.movies.nowPlaying({ page: 4, region: 'DE', language: 'de-DE' });
    expect(calls[0]?.u.search).toBe('?page=3');
    expect(calls[1]?.u.search).toBe('?page=2');
    expect(calls[2]?.u.searchParams.get('region')).toBe('DE');
    expect(calls[2]?.u.searchParams.get('page')).toBe('4');
  });
});

describe('endpoints', () => {
  const cases: Array<[string, (c: Amodb) => Promise<unknown>, string]> = [
    ['movies.details', (c) => c.movies.details(550), '/3/movie/550'],
    ['movies.credits', (c) => c.movies.credits(550), '/3/movie/550/credits'],
    ['movies.images', (c) => c.movies.images(550), '/3/movie/550/images'],
    ['movies.videos', (c) => c.movies.videos(550), '/3/movie/550/videos'],
    ['movies.keywords', (c) => c.movies.keywords(550), '/3/movie/550/keywords'],
    ['movies.externalIds', (c) => c.movies.externalIds(550), '/3/movie/550/external_ids'],
    ['movies.recommendations', (c) => c.movies.recommendations(550), '/3/movie/550/recommendations'],
    ['movies.similar', (c) => c.movies.similar(550), '/3/movie/550/similar'],
    ['movies.reviews', (c) => c.movies.reviews(550), '/3/movie/550/reviews'],
    ['movies.releaseDates', (c) => c.movies.releaseDates(550), '/3/movie/550/release_dates'],
    ['movies.watchProviders', (c) => c.movies.watchProviders(550), '/3/movie/550/watch/providers'],
    ['movies.translations', (c) => c.movies.translations(550), '/3/movie/550/translations'],
    ['movies.alternativeTitles', (c) => c.movies.alternativeTitles(550), '/3/movie/550/alternative_titles'],
    ['movies.popular', (c) => c.movies.popular(), '/3/movie/popular'],
    ['movies.topRated', (c) => c.movies.topRated(), '/3/movie/top_rated'],
    ['movies.upcoming', (c) => c.movies.upcoming(), '/3/movie/upcoming'],
    ['movies.nowPlaying', (c) => c.movies.nowPlaying(), '/3/movie/now_playing'],
    ['movies.moods', (c) => c.movies.moods(550), '/3/movie/550/moods'],
    ['movies.soundtracks', (c) => c.movies.soundtracks(550), '/3/movie/550/soundtracks'],
    ['movies.ratings', (c) => c.movies.ratings(550), '/3/movie/550/ratings'],
    ['movies.wikidata', (c) => c.movies.wikidata(550), '/3/movie/550/wikidata'],
    ['movies.showtimes', (c) => c.movies.showtimes(550, 'DE'), '/3/movie/550/showtimes'],
    ['movies.latest', (c) => c.movies.latest(), '/3/movie/latest'],
    ['movies.lists', (c) => c.movies.lists(550), '/3/movie/550/lists'],
    ['tv.details', (c) => c.tv.details(1399), '/3/tv/1399'],
    ['tv.credits', (c) => c.tv.credits(1399), '/3/tv/1399/credits'],
    ['tv.images', (c) => c.tv.images(1399), '/3/tv/1399/images'],
    ['tv.videos', (c) => c.tv.videos(1399), '/3/tv/1399/videos'],
    ['tv.keywords', (c) => c.tv.keywords(1399), '/3/tv/1399/keywords'],
    ['tv.externalIds', (c) => c.tv.externalIds(1399), '/3/tv/1399/external_ids'],
    ['tv.recommendations', (c) => c.tv.recommendations(1399), '/3/tv/1399/recommendations'],
    ['tv.similar', (c) => c.tv.similar(1399), '/3/tv/1399/similar'],
    ['tv.reviews', (c) => c.tv.reviews(1399), '/3/tv/1399/reviews'],
    ['tv.contentRatings', (c) => c.tv.contentRatings(1399), '/3/tv/1399/content_ratings'],
    ['tv.watchProviders', (c) => c.tv.watchProviders(1399), '/3/tv/1399/watch/providers'],
    ['tv.translations', (c) => c.tv.translations(1399), '/3/tv/1399/translations'],
    ['tv.alternativeTitles', (c) => c.tv.alternativeTitles(1399), '/3/tv/1399/alternative_titles'],
    ['tv.season', (c) => c.tv.season(1399, 2), '/3/tv/1399/season/2'],
    ['tv.episode', (c) => c.tv.episode(1399, 2, 5), '/3/tv/1399/season/2/episode/5'],
    ['tv.popular', (c) => c.tv.popular(), '/3/tv/popular'],
    ['tv.topRated', (c) => c.tv.topRated(), '/3/tv/top_rated'],
    ['tv.airingToday', (c) => c.tv.airingToday(), '/3/tv/airing_today'],
    ['tv.onTheAir', (c) => c.tv.onTheAir(), '/3/tv/on_the_air'],
    ['tv.moods', (c) => c.tv.moods(1399), '/3/tv/1399/moods'],
    ['tv.soundtracks', (c) => c.tv.soundtracks(1399), '/3/tv/1399/soundtracks'],
    ['tv.ratings', (c) => c.tv.ratings(1399), '/3/tv/1399/ratings'],
    ['tv.wikidata', (c) => c.tv.wikidata(1399), '/3/tv/1399/wikidata'],
    ['tv.showtimes', (c) => c.tv.showtimes(1399), '/3/tv/1399/showtimes'],
    ['tv.latest', (c) => c.tv.latest(), '/3/tv/latest'],
    ['tv.lists', (c) => c.tv.lists(1399), '/3/tv/1399/lists'],
    ['tv.episodeGroups', (c) => c.tv.episodeGroups(1399), '/3/tv/1399/episode_groups'],
    ['tv.seasonCredits', (c) => c.tv.seasonCredits(1399, 2), '/3/tv/1399/season/2/credits'],
    ['tv.episodeCredits', (c) => c.tv.episodeCredits(1399, 2, 5), '/3/tv/1399/season/2/episode/5/credits'],
    ['people.details', (c) => c.people.details(287), '/3/person/287'],
    ['people.combinedCredits', (c) => c.people.combinedCredits(287), '/3/person/287/combined_credits'],
    ['people.movieCredits', (c) => c.people.movieCredits(287), '/3/person/287/movie_credits'],
    ['people.tvCredits', (c) => c.people.tvCredits(287), '/3/person/287/tv_credits'],
    ['people.images', (c) => c.people.images(287), '/3/person/287/images'],
    ['people.externalIds', (c) => c.people.externalIds(287), '/3/person/287/external_ids'],
    ['people.popular', (c) => c.people.popular(), '/3/person/popular'],
    ['search.movie', (c) => c.search.movie('x'), '/3/search/movie'],
    ['search.tv', (c) => c.search.tv('x'), '/3/search/tv'],
    ['search.person', (c) => c.search.person('x'), '/3/search/person'],
    ['search.multi', (c) => c.search.multi('x'), '/3/search/multi'],
    ['search.collection', (c) => c.search.collection('x'), '/3/search/collection'],
    ['search.company', (c) => c.search.company('x'), '/3/search/company'],
    ['search.keyword', (c) => c.search.keyword('x'), '/3/search/keyword'],
    ['discover.movie', (c) => c.discover.movie(), '/3/discover/movie'],
    ['discover.tv', (c) => c.discover.tv(), '/3/discover/tv'],
    ['trending.get', (c) => c.trending.get(), '/3/trending/all/day'],
    ['genres.movies', (c) => c.genres.movies(), '/3/genre/movie/list'],
    ['genres.tv', (c) => c.genres.tv(), '/3/genre/tv/list'],
    ['collections.details', (c) => c.collections.details(10), '/3/collection/10'],
    ['companies.details', (c) => c.companies.details(1), '/3/company/1'],
    ['networks.details', (c) => c.networks.details(49), '/3/network/49'],
    ['keywords.details', (c) => c.keywords.details(818), '/3/keyword/818'],
    ['keywords.movies', (c) => c.keywords.movies(818), '/3/keyword/818/movies'],
    ['find', (c) => c.find('tt0137523', 'imdb_id'), '/3/find/tt0137523'],
    ['configuration', (c) => c.configuration(), '/3/configuration'],
    ['certifications.movie', (c) => c.certifications.movie(), '/3/certification/movie/list'],
    ['certifications.tv', (c) => c.certifications.tv(), '/3/certification/tv/list'],
    ['watchProviders.regions', (c) => c.watchProviders.regions(), '/3/watch/providers/regions'],
    ['watchProviders.movie', (c) => c.watchProviders.movie(), '/3/watch/providers/movie'],
    ['watchProviders.tv', (c) => c.watchProviders.tv(), '/3/watch/providers/tv'],
  ];

  it.each(cases)('%s calls the right path', async (_name, call, pathname) => {
    const { client, calls } = setup();
    await call(client);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.u.origin).toBe('https://api.amodb.dev');
    expect(calls[0]?.u.pathname).toBe(pathname);
  });

  it('sends country for showtimes only when given', async () => {
    const { client, calls } = setup();
    await client.movies.showtimes(550, 'DE', { language: 'de-DE' });
    await client.movies.showtimes(550);
    expect(calls[0]?.u.searchParams.get('country')).toBe('DE');
    expect(calls[0]?.u.searchParams.get('language')).toBe('de-DE');
    expect(calls[1]?.u.searchParams.has('country')).toBe(false);
  });

  it('sends external_source for find', async () => {
    const { client, calls } = setup();
    await client.find('tt0137523', 'imdb_id', { language: 'en-US' });
    expect(calls[0]?.u.searchParams.get('external_source')).toBe('imdb_id');
    expect(calls[0]?.u.searchParams.get('language')).toBe('en-US');
  });

  it('passes discover params as given', async () => {
    const { client, calls } = setup();
    await client.discover.movie({
      sort_by: 'popularity.desc',
      'vote_average.gte': 7,
      with_genres: [28, 12],
      include_video: false,
      page: 2,
      some_new_filter: 'x',
    });
    const q = calls[0]!.u.searchParams;
    expect(q.get('sort_by')).toBe('popularity.desc');
    expect(q.get('vote_average.gte')).toBe('7');
    expect(q.get('with_genres')).toBe('28,12');
    expect(q.get('include_video')).toBe('false');
    expect(q.get('some_new_filter')).toBe('x');
  });

  it('builds trending paths', async () => {
    const { client, calls } = setup();
    await client.trending.get('movie', 'week', { page: 2 });
    await client.trending.get('person');
    expect(calls[0]?.u.pathname).toBe('/3/trending/movie/week');
    expect(calls[0]?.u.searchParams.get('page')).toBe('2');
    expect(calls[1]?.u.pathname).toBe('/3/trending/person/day');
  });

  it('sends watch_region for provider lists', async () => {
    const { client, calls } = setup();
    await client.watchProviders.movie({ watchRegion: 'US' });
    expect(calls[0]?.u.searchParams.get('watch_region')).toBe('US');
  });

  it('sends include_image_language as a comma list', async () => {
    const { client, calls } = setup();
    await client.movies.images(550, { includeImageLanguage: ['en', 'null'] });
    expect(calls[0]?.url).toContain('include_image_language=en,null');
  });

  it('returns the parsed body typed by the method', async () => {
    const body = { page: 1, results: [{ id: 550, title: 'Fight Club' }], total_pages: 1, total_results: 1 };
    const m = mockFetch(json(body));
    const client = new Amodb({ apiKey: KEY, fetch: m.fetch });
    const page = await client.search.movie('fight club');
    expect(page.results[0]?.id).toBe(550);
    expect(page.total_results).toBe(1);
  });
});

describe('plans', () => {
  const catalog = {
    currency: 'USD',
    periods: [{ id: 'm1', months: 1, save: 0 }],
    plans: [{ id: 'lite', name: 'Lite', rpm: 20, monthlyCents: 100, totals: { m1: 100 } }],
    fetchedAt: '2026-10-18T00:00:00Z',
  };

  it('calls /plans on the host of baseUrl without any key', async () => {
    const m = mockFetch(json(catalog));
    const client = new Amodb({ apiKey: KEY, fetch: m.fetch, auth: 'query' });
    const plans = await client.plans();
    expect(m.calls[0]?.url).toBe('https://api.amodb.dev/plans');
    expect(m.calls[0]?.headers.Authorization).toBeUndefined();
    expect(m.calls[0]?.url).not.toContain(KEY);
    expect(plans.plans[0]?.rpm).toBe(20);
  });

  it('derives the host from a custom baseUrl', async () => {
    const m = mockFetch(json(catalog));
    const client = new Amodb({ apiKey: KEY, fetch: m.fetch, baseUrl: 'https://custom.example.test/api/3' });
    await client.plans();
    expect(m.calls[0]?.url).toBe('https://custom.example.test/plans');
  });
});

describe('request escape hatch', () => {
  it('returns parsed JSON and applies auth and language', async () => {
    const m = mockFetch(json({ hello: 'world' }));
    const client = new Amodb({ apiKey: KEY, fetch: m.fetch, language: 'it-IT' });
    const result = await client.request<{ hello: string }>('/some/new/path', { page: 2, flag: true });
    expect(result.hello).toBe('world');
    expect(m.calls[0]?.u.pathname).toBe('/3/some/new/path');
    expect(m.calls[0]?.u.searchParams.get('page')).toBe('2');
    expect(m.calls[0]?.u.searchParams.get('flag')).toBe('true');
    expect(m.calls[0]?.u.searchParams.get('language')).toBe('it-IT');
    expect(m.calls[0]?.headers.Authorization).toBe(`Bearer ${KEY}`);
  });
});
