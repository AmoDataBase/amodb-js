import type { Params } from './types';

// ---------------------------------------------------------------------------
// Client options
// ---------------------------------------------------------------------------

export type AuthMode = 'bearer' | 'query';

export interface AmodbOptions {
  /** Your amodb API key (32 hex characters). Required. */
  apiKey: string;
  /** Default `https://api.amodb.dev/3`. */
  baseUrl?: string;
  /** Default `https://api.amodb.dev/omdb/`. */
  omdbUrl?: string;
  /** Default `https://img.amodb.dev/t/p/`. */
  imageBaseUrl?: string;
  /** Default `language` sent on every call. A per-call `language` overrides it. */
  language?: string;
  /** Request timeout in milliseconds. Default 15000. Use 0 to disable. */
  timeout?: number;
  /** Retries on HTTP 429. Default 3, capped at 3. */
  maxRetries?: number;
  /** `bearer` sends `Authorization: Bearer KEY` (default). `query` sends `api_key=KEY`. */
  auth?: AuthMode;
  /** Custom `fetch`. Defaults to the global one. */
  fetch?: typeof fetch;
  /** Custom sleep used between retries, in milliseconds. Useful in tests. */
  sleep?: (ms: number) => Promise<void>;
  /** Overrides the `User-Agent` header. Not sent from browsers. */
  userAgent?: string;
}

// ---------------------------------------------------------------------------
// Per call options
// ---------------------------------------------------------------------------

/** Accepted by every method. */
export interface CallOptions {
  /** TMDB language tag such as `ru-RU`. Overrides the client default. Pass null to send none. */
  language?: string | null;
  /** Extra query parameters, sent as given (snake_case). */
  params?: Params;
}

export interface PageOptions extends CallOptions {
  page?: number;
}

/** Page options, or a bare page number. */
export type PageArg = PageOptions | number;

/**
 * Values accepted by `appendToResponse`, per resource. The list is comma joined
 * (up to 20 values). The API ignores unknown names, so the types list only the
 * sections that exist.
 */
export type MovieAppend =
  | 'credits'
  | 'images'
  | 'videos'
  | 'keywords'
  | 'translations'
  | 'external_ids'
  | 'similar'
  | 'recommendations'
  | 'reviews'
  | 'release_dates'
  | 'watch/providers'
  | 'alternative_titles'
  | 'lists'
  | 'moods'
  | 'soundtracks'
  | 'ratings'
  | 'wikidata'
  | 'showtimes';

export type TvAppend =
  | 'credits'
  | 'images'
  | 'videos'
  | 'keywords'
  | 'translations'
  | 'external_ids'
  | 'similar'
  | 'recommendations'
  | 'reviews'
  | 'content_ratings'
  | 'watch/providers'
  | 'alternative_titles'
  | 'lists'
  | 'episode_groups'
  | 'moods'
  | 'soundtracks'
  | 'ratings'
  | 'wikidata'
  | 'showtimes';

export type PersonAppend = 'combined_credits' | 'movie_credits' | 'tv_credits' | 'external_ids' | 'images';

export type SeasonAppend = 'credits' | 'images' | 'videos' | 'external_ids';

export type EpisodeAppend = 'credits' | 'images' | 'videos' | 'external_ids' | 'translations';

export interface MovieDetailsOptions extends CallOptions {
  appendToResponse?: MovieAppend[];
  /** ISO 3166-1 country code for the appended `showtimes` section. */
  country?: string;
}

export interface TvDetailsOptions extends CallOptions {
  appendToResponse?: TvAppend[];
  /** ISO 3166-1 country code for the appended `showtimes` section. */
  country?: string;
}

export interface PersonDetailsOptions extends CallOptions {
  appendToResponse?: PersonAppend[];
}

export interface SeasonDetailsOptions extends CallOptions {
  appendToResponse?: SeasonAppend[];
}

export interface EpisodeDetailsOptions extends CallOptions {
  appendToResponse?: EpisodeAppend[];
}

export interface ImagesOptions extends CallOptions {
  /** For example `['en', 'null']`. */
  includeImageLanguage?: string | string[];
}

export interface VideosOptions extends CallOptions {
  includeVideoLanguage?: string | string[];
}

export interface MovieListOptions extends PageOptions {
  /** ISO 3166-1 country code. */
  region?: string;
}

export interface SearchMovieOptions extends PageOptions {
  region?: string;
  year?: number | string;
  primaryReleaseYear?: number | string;
}

export interface SearchTvOptions extends PageOptions {
  year?: number | string;
  firstAirDateYear?: number | string;
}

/** Options for `search.person`, `search.multi`, `search.collection`, `search.company` and `search.keyword`. */
export type SearchOptions = PageOptions;

export interface WatchProvidersOptions extends CallOptions {
  watchRegion?: string;
}

// ---------------------------------------------------------------------------
// Discover
// ---------------------------------------------------------------------------

/**
 * Query parameters for `discover.movie`. Keys are sent as given.
 * Any other TMDB discover parameter is accepted through the index signature.
 */
export interface DiscoverMovieParams {
  language?: string | null;
  page?: number;
  region?: string;
  sort_by?: string;
  include_video?: boolean;
  year?: number | string;
  primary_release_year?: number | string;
  'primary_release_date.gte'?: string;
  'primary_release_date.lte'?: string;
  'release_date.gte'?: string;
  'release_date.lte'?: string;
  'vote_average.gte'?: number;
  'vote_average.lte'?: number;
  'vote_count.gte'?: number;
  'vote_count.lte'?: number;
  'with_runtime.gte'?: number;
  'with_runtime.lte'?: number;
  with_genres?: string | number | Array<string | number>;
  without_genres?: string | number | Array<string | number>;
  with_cast?: string | number | Array<string | number>;
  with_crew?: string | number | Array<string | number>;
  with_people?: string | number | Array<string | number>;
  with_companies?: string | number | Array<string | number>;
  with_keywords?: string | number | Array<string | number>;
  with_original_language?: string;
  with_origin_country?: string;
  with_watch_providers?: string | number | Array<string | number>;
  watch_region?: string;
  [key: string]: Params[string];
}

/** Query parameters for `discover.tv`. Keys are sent as given. */
export interface DiscoverTvParams {
  language?: string | null;
  page?: number;
  sort_by?: string;
  first_air_date_year?: number | string;
  'first_air_date.gte'?: string;
  'first_air_date.lte'?: string;
  'air_date.gte'?: string;
  'air_date.lte'?: string;
  'vote_average.gte'?: number;
  'vote_average.lte'?: number;
  'vote_count.gte'?: number;
  'vote_count.lte'?: number;
  'with_runtime.gte'?: number;
  'with_runtime.lte'?: number;
  with_genres?: string | number | Array<string | number>;
  without_genres?: string | number | Array<string | number>;
  with_companies?: string | number | Array<string | number>;
  with_keywords?: string | number | Array<string | number>;
  with_networks?: string | number | Array<string | number>;
  with_original_language?: string;
  with_origin_country?: string;
  with_status?: string | number;
  with_type?: string | number;
  with_watch_providers?: string | number | Array<string | number>;
  watch_region?: string;
  timezone?: string;
  [key: string]: Params[string];
}

// ---------------------------------------------------------------------------
// Trending, find, OMDb
// ---------------------------------------------------------------------------

export type TrendingMediaType = 'all' | 'movie' | 'tv' | 'person';
export type TrendingWindow = 'day' | 'week';

/**
 * Values accepted by `find`. These resolve to titles or people: `imdb_id` (tt and
 * nm ids), `tvdb_id`, `facebook_id`, `twitter_id`, `instagram_id`, `wikidata_id`
 * (Q ids) and `kinopoisk_id`. The others are accepted and return empty arrays.
 */
export type ExternalSource =
  | 'imdb_id'
  | 'freebase_mid'
  | 'freebase_id'
  | 'tvdb_id'
  | 'tvrage_id'
  | 'facebook_id'
  | 'twitter_id'
  | 'instagram_id'
  | 'tiktok_id'
  | 'youtube_id'
  | 'wikidata_id'
  | 'kinopoisk_id';

export type OmdbType = 'movie' | 'series';
export type OmdbPlot = 'short' | 'full';

export interface OmdbByIdOptions {
  plot?: OmdbPlot;
  type?: OmdbType;
  year?: number | string;
  /** Extra OMDb query parameters, sent as given. */
  params?: Params;
}

export interface OmdbByTitleOptions {
  type?: OmdbType;
  year?: number | string;
  plot?: OmdbPlot;
  params?: Params;
}

export interface OmdbSearchOptions {
  type?: OmdbType;
  year?: number | string;
  page?: number;
  params?: Params;
}

/** Known image sizes. Other strings are accepted. */
export type ImageSize =
  | 'w92'
  | 'w154'
  | 'w185'
  | 'w300'
  | 'w342'
  | 'w500'
  | 'w780'
  | 'w1280'
  | 'h632'
  | 'original'
  | (string & Record<never, never>);
