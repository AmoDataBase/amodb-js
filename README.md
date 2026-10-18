<p align="center">
  <a href="https://amodb.dev">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/amodb-dev/.github/main/assets/lockup-dark.png">
      <img src="https://raw.githubusercontent.com/amodb-dev/.github/main/assets/lockup-light.png" alt="amodb" width="260">
    </picture>
  </a>
</p>

<h1 align="center">amodb-js</h1>

<p align="center">JavaScript and TypeScript client for the amodb movie and TV metadata API.</p>

<p align="center">
  <a href="https://github.com/amodb-dev/amodb-js/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/amodb-dev/amodb-js/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://www.npmjs.com/package/amodb"><img alt="npm version" src="https://img.shields.io/npm/v/amodb"></a>
  <a href="https://github.com/amodb-dev/amodb-js/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/github/license/amodb-dev/amodb-js"></a>
</p>

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

Every method takes an options object. Typed options are camelCase (`appendToResponse`, `primaryReleaseYear`) and become snake_case on the wire. Use `params` for anything else, sent exactly as you write it:

```ts
await client.search.movie('alien', { params: { region: 'US' } });
await client.discover.movie({ sort_by: 'popularity.desc', 'vote_average.gte': 7, with_genres: [28, 12] });
await client.trending.get('movie', 'week');
```

List methods also accept a bare page number: `client.movies.popular(2)`. Pages run from 1 to 500. Adult titles and people are never served, so `include_adult` has no effect.

`search.collection` finds collections. `client.movies.latest()` and `client.tv.latest()` return the newest catalog entry.

## Details with appendToResponse

Fetch a movie and related blocks in one call. Arrays are joined with commas, up to 20 values. The allowed values are typed per resource, and the API ignores names it does not know.

| Resource | Values |
|---|---|
| movie | `credits` `images` `videos` `keywords` `translations` `external_ids` `similar` `recommendations` `reviews` `release_dates` `watch/providers` `alternative_titles` `lists` `moods` `soundtracks` `ratings` `wikidata` `showtimes` |
| tv | The same, with `content_ratings` and `episode_groups` instead of `release_dates` |
| person | `combined_credits` `movie_credits` `tv_credits` `external_ids` `images` |
| season | `credits` `images` `videos` `external_ids` |
| episode | `credits` `images` `videos` `external_ids` `translations` |

```ts
const movie = await client.movies.details(550, {
  appendToResponse: ['credits', 'images', 'videos', 'ratings', 'moods'],
});
console.log(movie.credits?.cast[0]?.name);
console.log(movie.ratings?.imdb?.value);   // 8.8

const show = await client.tv.details(1396, { appendToResponse: ['content_ratings', 'external_ids'] });
const season = await client.tv.season(1396, 1);
const episode = await client.tv.episode(1396, 1, 1);
```

Appended `moods`, `ratings` and `soundtracks` have no `id`. Appended `wikidata` and `showtimes` keep it. Pass `country` with `showtimes`, for example `{ appendToResponse: ['showtimes'], country: 'RU' }`.

Some sections are thin today. `reviews` is empty for most titles, season images, videos and translations are empty, and season and episode `external_ids` are all null. TV details have no `type` field and `created_by` is empty for most shows.

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

`type` is `movie` or `series`. Search returns 10 hits per page, up to page 100. Only JSON is served (`r=json`). Seasons and episodes are not supported, and `Production`, `DVD` and `Website` are always `"N/A"`. Series carry `totalSeasons`.

## Find by external id

```ts
const found = await client.find('tt0137523', 'imdb_id');
console.log(found.movie_results[0]?.title);   // Fight Club

const byKinopoisk = await client.find('361', 'kinopoisk_id');
const byWikidata = await client.find('Q35332', 'wikidata_id');   // a person
console.log(byWikidata.person_results[0]?.name);
```

The `ExternalSource` type lists the 12 accepted sources: `imdb_id`, `freebase_mid`, `freebase_id`, `tvdb_id`, `tvrage_id`, `facebook_id`, `twitter_id`, `instagram_id`, `tiktok_id`, `youtube_id`, `wikidata_id` and `kinopoisk_id`. These resolve to titles or people: `imdb_id` (tt and nm ids), `tvdb_id`, `facebook_id`, `twitter_id`, `instagram_id`, `wikidata_id` and `kinopoisk_id`. The others are accepted and return empty arrays. An unknown source or a bad id answers 400 with `status_code` 22.

The result has `movie_results`, `person_results`, `tv_results`, `tv_episode_results` and `tv_season_results`. Items carry `media_type`. The last two lists are always empty today, and `known_for` of a person is empty.

External ids of a title include `kinopoisk_id` as a string:

```ts
const ids = await client.movies.externalIds(550);
console.log(ids.imdb_id, ids.kinopoisk_id);   // tt0137523 361
```

## amodb extras

These calls are not part of TMDB v3. They use the same key and base URL. `ratings`, `moods`, `soundtracks`, `wikidata` and `showtimes` exist on both `movies` and `tv`. Each can also be appended to a details call.

### Ratings

Each provider is `{ value, votes }` or `null` when the score is missing. `votes` can be `null`. IMDb, Kinopoisk and TMDB are out of 10. Metacritic and Rotten Tomatoes are out of 100.

```ts
const ratings = await client.movies.ratings(550);
console.log(ratings.imdb);              // { value: 8.8, votes: 2669989 }
console.log(ratings.rotten_tomatoes);   // { value: 81, votes: null }
console.log(ratings.tmdb?.value);       // 8.437
```

### Moods

`source` is `'measured'` for viewer data, `'estimated'` when derived from genres, or `null` with an empty `results` when the title has no data. Each meter has `avg` (0 to 10, one decimal) and `values` (readings on the same scale). Names seen: action, fear, humor, pace, profanity, romance, sadness, sex, violence.

```ts
const moods = await client.movies.moods(155);
console.log(moods.source);                       // 'measured'
for (const meter of moods.results) {
  console.log(meter.name, meter.avg, meter.values.length);
}
// action 3.9 6
```

### Soundtracks

`results` is a list of albums, each with `tracks`. It is empty when no album is known. `source` is `'musicbrainz'` or `'deezer'`.

```ts
const sound = await client.movies.soundtracks(155);
const album = sound.results[0];
console.log(album?.album, album?.artist, album?.track_count);
// The Dark Knight, Hans Zimmer & James Newton Howard, 14
console.log(album?.tracks[0]);
// { disc: 1, number: 1, title: 'Why So Serious?', artist: 'Hans Zimmer', duration_ms: 554000 }
```

### Wikidata

Money fields are `{ value, currency }`, and `box_office` adds `worldwide`. Links are `{ wikidata_id, label }` and gain `tmdb_id` and `media_type` when the item is a title in the catalog. `sitelinks` maps a language code to a Wikipedia page title. Empty groups are `[]`.

```ts
const facts = await client.movies.wikidata(550);
console.log(facts.wikidata_id);                  // Q190050
console.log(facts.budget);                       // { value: 63000000, currency: 'USD' }
console.log(facts.box_office?.value);            // 101209702
console.log(facts.sitelinks.en);                 // Fight Club
console.log(facts.based_on[0]?.author?.label);   // Chuck Palahniuk

const sequel = await client.movies.wikidata(604);
console.log(sequel.follows?.tmdb_id);            // 603
```

`follows`, `followed_by`, `awards`, `nominations`, `based_on`, `filming_locations`, `narrative_locations` and `original_broadcasters` are also on the result. `label` uses the request `language` and falls back to English.

### Showtimes

`country` is optional. Without it, `results` is empty and `countries` lists per-country counts, most showtimes first. With an ISO 3166-1 code, `results` lists the venues, each with its `showtimes`. Only days from today on are listed.

```ts
const summary = await client.movies.showtimes(550);
console.log(summary.country);       // null
console.log(summary.countries[0]);
// { country: 'RU', name: 'Russia', venues: 2, cities: 1, showtimes: 7,
//   first_day: '2026-10-18', last_day: '2026-10-21' }

const ru = await client.movies.showtimes(550, 'RU');
const venue = ru.results[0];
console.log(venue?.name, venue?.city, venue?.timezone);
const show = venue?.showtimes[0];
console.log(show?.start, show?.formats, show?.booking_url);
// start is local time at the venue, for example 2026-10-18T21:40
```

### Other served lists

```ts
await client.movies.lists(550);          // user lists that contain the movie, paged
await client.tv.episodeGroups(1396);     // episode groups, ids are strings
await client.tv.showtimes(1396, 'RU');
await client.tv.episodeCredits(1396, 1, 1);   // guest_stars holds the guest cast
await client.keywords.movies(818);       // movies that carry a keyword, paged
```

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

Common codes: 400 / 22 invalid parameters, 401 / 7 invalid key, 401 / 10 suspended key, 402 / 36 plan expired, 404 / 34 not found, 405 / 37 method not offered, 429 / 25 over the limit. Asking a movie for a TV only section (or the other way round) answers 404 / 34.

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
| `movies` | `details` `latest` `credits` `images` `videos` `keywords` `externalIds` `recommendations` `similar` `reviews` `releaseDates` `watchProviders` `translations` `alternativeTitles` `lists` `popular` `topRated` `upcoming` `nowPlaying` `moods` `soundtracks` `ratings` `wikidata` `showtimes` |
| `tv` | `details` `latest` `credits` `images` `videos` `keywords` `externalIds` `recommendations` `similar` `reviews` `contentRatings` `watchProviders` `translations` `alternativeTitles` `lists` `episodeGroups` `season` `seasonCredits` `episode` `episodeCredits` `popular` `topRated` `airingToday` `onTheAir` `moods` `soundtracks` `ratings` `wikidata` `showtimes` |
| `people` | `details` `combinedCredits` `movieCredits` `tvCredits` `images` `externalIds` `popular` |
| `search` | `movie` `tv` `person` `multi` `collection` `company` `keyword` |
| `discover` | `movie` `tv` |
| `trending` | `get(mediaType, window, params)` |
| `genres` | `movies` `tv` |
| `collections` `companies` `networks` | `details` |
| `keywords` | `details` `movies` |
| `certifications` | `movie` `tv` |
| `watchProviders` | `regions` `movie` `tv` |
| `omdb` | `byId` `byTitle` `search` |
| client | `find` `configuration` `plans` `imageUrl` `request` |

These TMDB features are not offered, so the client has no method for them:

- Everything under `account`, `authentication`, `guest_session` and `list`, and any `account_states` or `rating` path. They answer 405 with `status_code` 37.
- Aggregate credits, changes, `person/{id}/translations`, `person/latest`, tagged images, `tv/episode_group/{id}`, `credit/{id}`, `review/{id}`, `configuration/timezones` and `tv/{id}/screened_theatrically`.
- Images, translations and alternative names of collections, companies and networks.

These answer 404 with `status_code` 34, and `append_to_response` ignores `aggregate_credits` and `changes`. `client.request(path)` still lets you call any path.

## TypeScript

Response types are exported: `Movie`, `MovieDetails`, `TvShow`, `TvShowDetails`, `Season`, `Episode`, `Person`, `PersonDetails`, `Credits`, `Paged<T>`, `Genre`, `Configuration`, `FindResults`, `OmdbTitle`, `OmdbSearch`, `PlanCatalog` and more. The amodb extras have full types too: `Ratings`, `Moods`, `Soundtracks`, `Wikidata` and `Showtimes`, with `MoodMeter`, `SoundtrackAlbum`, `WikidataLink`, `ShowtimeVenue` and friends. Each type has an index signature, so new fields are reachable without a cast.

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

## Links

- Website: https://amodb.dev
- Docs: https://amodb.dev/docs
- Pricing: https://amodb.dev/pricing
- Status: https://amodb.dev/status
- Issues: https://github.com/amodb-dev/amodb-js/issues
- Changelog: https://github.com/amodb-dev/amodb-js/blob/main/CHANGELOG.md
- Security: https://github.com/amodb-dev/amodb-js/blob/main/SECURITY.md
- Organization: https://github.com/amodb-dev

## License

MIT. See `LICENSE`. Report security issues to security@amodb.dev, see `SECURITY.md`.
