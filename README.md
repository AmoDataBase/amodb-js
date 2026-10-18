<!-- GitHub topics: amodb, tmdb, omdb, typescript, javascript, movie-api, tv-api, api-client, sdk, nodejs -->

# amodb for JavaScript and TypeScript

The official client for [amodb](https://amodb.dev), a movie and TV metadata API that is compatible with TMDB v3 and OMDb.

- Zero runtime dependencies. Uses the global `fetch` (Node 18+, browsers and edge runtimes that provide it).
- ESM, CommonJS and type declarations in one package.
- Typed methods and responses, typed errors, retries on rate limits, request timeouts.
- Extras on top of TMDB: ratings, moods, soundtracks, wikidata, showtimes and lookup by external id.

amodb is a paid API. Get a key at https://amodb.dev/pricing.

Existing TMDB clients work by changing the base URL to `https://api.amodb.dev/3`.

## Install

```sh
npm install amodb
```

## Quick start

ESM or TypeScript:

```ts
import { Amodb } from 'amodb';

const client = new Amodb({ apiKey: process.env.AMODB_API_KEY! });

const movie = await client.movies.details(550);
console.log(movie.title, movie.vote_average);
console.log(client.imageUrl(movie.poster_path, 'w342'));
```

CommonJS:

```js
const { Amodb } = require('amodb');

const client = new Amodb({ apiKey: process.env.AMODB_API_KEY });

client.movies.details(550).then((movie) => console.log(movie.title));
```

## Authentication

A key is 32 lowercase hex characters. The client sends it as `Authorization: Bearer KEY`. To send `api_key=KEY` in the query string instead, set `auth: 'query'`. The key is never put in a URL in the default mode.

```ts
const client = new Amodb({ apiKey, auth: 'query' });
```

An empty `apiKey` throws a `TypeError` when you create the client.

## Options

| Option | Default | Notes |
|---|---|---|
| `apiKey` | required | Your amodb key |
| `baseUrl` | `https://api.amodb.dev/3` | TMDB style base |
| `omdbUrl` | `https://api.amodb.dev/omdb/` | OMDb style endpoint |
| `imageBaseUrl` | `https://img.amodb.dev/t/p/` | Used by `imageUrl` |
| `language` | none | Default `language` for every call |
| `timeout` | `15000` | Milliseconds. `0` turns the timeout off |
| `maxRetries` | `3` | Retries on HTTP 429. The cap is 3 |
| `auth` | `'bearer'` | Or `'query'` |
| `fetch` | global `fetch` | Your own implementation |
| `sleep` | `setTimeout` | Wait function for retries, handy in tests |
| `userAgent` | `amodb-js/0.1.0` | Not sent from browsers |

## Search

```ts
const results = await client.search.movie('fight club', { year: 1999, page: 1 });
for (const hit of results.results) {
  console.log(hit.id, hit.title, hit.release_date);
}

const tv = await client.search.tv('the wire');
const any = await client.search.multi('nolan');
```

Every method takes an options object. Typed options are camelCase (`includeAdult`, `appendToResponse`) and become snake_case on the wire. Use `params` for anything else, sent exactly as you write it:

```ts
await client.search.movie('alien', { params: { include_adult: false, region: 'US' } });
await client.discover.movie({ sort_by: 'popularity.desc', 'vote_average.gte': 7, with_genres: [28, 12] });
await client.trending.get('movie', 'week');
```

List methods also accept a bare page number: `client.movies.popular(2)`.

## Details with appendToResponse

Fetch a movie and related blocks in one call. Arrays are joined with commas. The allowed values are typed, and any other string is still accepted.

```ts
const movie = await client.movies.details(550, {
  appendToResponse: ['credits', 'images', 'videos', 'ratings', 'moods'],
});
console.log(movie.credits?.cast[0]?.name);
console.log(movie.ratings?.imdb?.value);

const show = await client.tv.details(1399, { appendToResponse: ['aggregate_credits'] });
const season = await client.tv.season(1399, 1);
const episode = await client.tv.episode(1399, 1, 1);
```

## Language

Set a default for every call, or pass `language` per call. A per-call value wins. Pass `null` to send none.

```ts
const client = new Amodb({ apiKey, language: 'ru-RU' });

await client.movies.details(550);                          // language=ru-RU
await client.movies.details(550, { language: 'pt-BR' });   // language=pt-BR
await client.movies.details(550, { language: null });      // no language
```

amodb serves 14 base languages: en, ru, uk, be, zh, pt, bg, he, cs, ro, fr, pl, it, es. Any other tag falls back to `en`.

## Images

`imageUrl(path, size)` builds an `img.amodb.dev` URL. The default size is `w500`. It returns `null` for an empty path and adds a missing leading slash.

```ts
import { imageUrl } from 'amodb';

client.imageUrl(movie.poster_path, 'w342');   // https://img.amodb.dev/t/p/w342/...
imageUrl('/abc.jpg', 'original');             // standalone, no client needed
```

Sizes: `w92 w154 w185 w300 w342 w500 w780 w1280 h632 original`. Images need no key.

## OMDb

The same key works on the OMDb style endpoint. A body with `"Response": "False"` raises `AmodbError`, and `statusMessage` holds the `Error` text.

```ts
const byId = await client.omdb.byId('tt0137523', { plot: 'full' });
const byTitle = await client.omdb.byTitle('Fight Club', { type: 'movie', year: 1999 });
const found = await client.omdb.search('fight', { type: 'movie', page: 1 });

console.log(byId.Title, byId.imdbRating, found.totalResults);
```

## Find by external id

```ts
const found = await client.find('tt0137523', 'imdb_id');
console.log(found.movie_results[0]?.title);
```

The `ExternalSource` type lists the accepted sources.

## amodb extras

These calls are not part of TMDB v3. They use the same key and base URL.

```ts
const ratings = await client.movies.ratings(550);
console.log(ratings.imdb?.value, ratings.imdb?.votes);

const moods = await client.movies.moods(550);
const soundtracks = await client.tv.soundtracks(1399);
const facts = await client.movies.wikidata(550);
const showtimes = await client.movies.showtimes(550, 'DE');
```

`ratings`, `moods`, `soundtracks` and `wikidata` exist on both `movies` and `tv`. `showtimes` is for movies.

## Errors

Every failure throws a subclass of `AmodbError`. All of them carry the TMDB error fields.

| Property | Meaning |
|---|---|
| `status` | HTTP status. `0` when no response arrived |
| `statusCode` | TMDB `status_code`, or `null` |
| `statusMessage` | TMDB `status_message`, or a short description |
| `body` | Parsed JSON body, or the raw text |

| Class | When |
|---|---|
| `RateLimitError` | HTTP 429 after the retries are used up. Has `retryAfter` (seconds or `null`) |
| `AmodbTimeoutError` | No complete response within `timeout` |
| `NetworkError` | The request failed before a response (offline, DNS, reset) |
| `AmodbError` | Any other HTTP error, and OMDb `Response: "False"` |

```ts
import { AmodbError, AmodbTimeoutError, NetworkError, RateLimitError } from 'amodb';

try {
  await client.movies.details(550);
} catch (err) {
  if (err instanceof RateLimitError) {
    console.log(`rate limited, retry in ${err.retryAfter ?? 'a few'} seconds`);
  } else if (err instanceof AmodbTimeoutError) {
    console.log('timed out');
  } else if (err instanceof NetworkError) {
    console.log('network problem:', err.statusMessage);
  } else if (err instanceof AmodbError) {
    console.log(err.status, err.statusCode, err.statusMessage);
  } else {
    throw err;
  }
}
```

Common codes: 401 / 7 invalid key, 401 / 10 suspended key, 402 / 36 plan expired, 404 / 34 not found, 405 / 37 method not offered, 429 / 25 over the limit.

## Retries and timeouts

- Only HTTP 429 is retried, at most 3 times (4 attempts in total).
- The client waits for `Retry-After` (seconds or an HTTP date, limited to 0 to 60 seconds). Without the header it waits 1, 2, then 4 seconds.
- Timeouts and network errors are not retried.
- Each attempt gets its own timeout, 15 seconds by default.

```ts
const client = new Amodb({
  apiKey,
  timeout: 5_000,   // 5 seconds
  maxRetries: 1,    // 0 turns retries off
});
```

## Custom fetch

Pass any `fetch` compatible function. It receives the full URL and an init object with `method`, `headers` and `signal`.

```ts
const client = new Amodb({
  apiKey,
  fetch: (url, init) => {
    console.log('GET', url);
    return fetch(url, init);
  },
});
```

The same hook is how the tests run without a network. You can also inject `sleep` so retries do not wait.

## Plans and rate limits

amodb plans differ only in requests per minute: `lite` 20, `pro` 40, `proplus` 120. Every plan gets all data. Names and prices are live at https://api.amodb.dev/plans and https://amodb.dev/pricing.

```ts
const catalog = await client.plans();   // public, no key is sent
for (const plan of catalog.plans) console.log(plan.id, plan.rpm);
```

Keyed responses include `X-RateLimit-Limit`, `X-RateLimit-Remaining` and `X-RateLimit-Reset`.

## Any other endpoint

`request` sends a GET to `baseUrl + path` with the same auth, retries and errors, and returns the parsed JSON.

```ts
const data = await client.request<{ id: number }>('/movie/550/credits', { language: 'en-US' });
```

## All methods

| Group | Methods |
|---|---|
| `movies` | `details` `credits` `images` `videos` `keywords` `externalIds` `recommendations` `similar` `reviews` `releaseDates` `watchProviders` `translations` `alternativeTitles` `popular` `topRated` `upcoming` `nowPlaying` `moods` `soundtracks` `ratings` `wikidata` `showtimes` |
| `tv` | `details` `aggregateCredits` `credits` `images` `videos` `keywords` `externalIds` `recommendations` `similar` `reviews` `contentRatings` `watchProviders` `translations` `alternativeTitles` `season` `episode` `popular` `topRated` `airingToday` `onTheAir` `moods` `soundtracks` `ratings` `wikidata` |
| `people` | `details` `combinedCredits` `movieCredits` `tvCredits` `images` `externalIds` `popular` |
| `search` | `movie` `tv` `person` `multi` `collection` `company` `keyword` |
| `discover` | `movie` `tv` |
| `trending` | `get(mediaType, window, params)` |
| `genres` | `movies` `tv` |
| `collections` `companies` `networks` `keywords` | `details` |
| `certifications` | `movie` `tv` |
| `watchProviders` | `regions` `movie` `tv` |
| `omdb` | `byId` `byTitle` `search` |
| client | `find` `configuration` `plans` `imageUrl` `request` |

TMDB account, session, rating and list write methods are not offered. They answer 405.

## TypeScript

Response types are exported: `Movie`, `MovieDetails`, `TvShow`, `TvShowDetails`, `Season`, `Episode`, `Person`, `PersonDetails`, `Credits`, `Paged<T>`, `Genre`, `Configuration`, `FindResults`, `Ratings`, `OmdbTitle`, `OmdbSearch`, `PlanCatalog` and more. Each has an index signature, so new fields are reachable without a cast.

```ts
import type { MovieDetails, Paged, Movie } from 'amodb';
```

The types use the global `fetch`, `Response` and `AbortSignal`. Add `"DOM"` to `lib` or install `@types/node` 18 or newer.

## Development

Development needs Node 20 or newer. The package itself runs on Node 18 or newer.

```sh
npm install
npm run typecheck
npm test
npm run build
```

Tests use a mocked `fetch` and never touch the network.

## License

MIT. See `LICENSE`. Report security issues to security@amodb.dev, see `SECURITY.md`.
