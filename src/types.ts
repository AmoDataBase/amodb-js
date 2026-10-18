/**
 * Response and parameter types.
 *
 * Every response interface carries an index signature, so fields the API
 * adds later are still reachable without a cast.
 */

/** A value accepted in a query map. null and undefined are dropped. */
export type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ReadonlyArray<string | number | boolean>;

/** A raw query map. Keys are sent exactly as given (snake_case on the wire). */
export type Params = Record<string, QueryValue>;

/** A numeric id. Strings are accepted for ids read from other sources. */
export type Id = number | string;

export interface Extensible {
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------

export interface Paged<T> extends Extensible {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface Genre extends Extensible {
  id: number;
  name: string;
}

export interface GenreList extends Extensible {
  genres: Genre[];
}

export interface Keyword extends Extensible {
  id: number;
  name: string;
}

export interface ProductionCompany extends Extensible {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface ProductionCountry extends Extensible {
  iso_3166_1: string;
  name: string;
}

export interface SpokenLanguage extends Extensible {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface CollectionSummary extends Extensible {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview?: string;
}

export interface Network extends Extensible {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

// ---------------------------------------------------------------------------
// Movies
// ---------------------------------------------------------------------------

interface MovieBase extends Extensible {
  id: number;
  adult: boolean;
  backdrop_path: string | null;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

/** A movie as it appears in lists and search results. */
export interface Movie extends MovieBase {
  genre_ids: number[];
  media_type?: 'movie';
}

export interface MovieDetails extends MovieBase {
  belongs_to_collection: CollectionSummary | null;
  budget: number;
  genres: Genre[];
  homepage: string | null;
  imdb_id: string | null;
  origin_country?: string[];
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  revenue: number;
  runtime: number | null;
  spoken_languages: SpokenLanguage[];
  status: string;
  tagline: string | null;

  // Present when requested with appendToResponse.
  credits?: Credits;
  images?: Images;
  videos?: VideoList;
  keywords?: MovieKeywords;
  external_ids?: ExternalIds;
  recommendations?: Paged<Movie>;
  similar?: Paged<Movie>;
  reviews?: Paged<Review>;
  release_dates?: ReleaseDates;
  'watch/providers'?: WatchProviders;
  translations?: Translations;
  alternative_titles?: AlternativeTitles;
  moods?: Moods;
  soundtracks?: Soundtracks;
  ratings?: Ratings;
  wikidata?: Wikidata;
  showtimes?: Showtimes;
}

// ---------------------------------------------------------------------------
// TV
// ---------------------------------------------------------------------------

interface TvShowBase extends Extensible {
  id: number;
  backdrop_path: string | null;
  first_air_date: string;
  name: string;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  vote_average: number;
  vote_count: number;
}

/** A show as it appears in lists and search results. */
export interface TvShow extends TvShowBase {
  genre_ids: number[];
  media_type?: 'tv';
}

export interface SeasonSummary extends Extensible {
  id: number;
  air_date: string | null;
  episode_count: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

export interface Episode extends Extensible {
  id: number;
  air_date: string | null;
  episode_number: number;
  name: string;
  overview: string;
  production_code?: string;
  runtime: number | null;
  season_number: number;
  show_id?: number;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
  crew?: CrewMember[];
  guest_stars?: CastMember[];
}

export interface Season extends Extensible {
  id: number;
  _id?: string;
  air_date: string | null;
  episodes: Episode[];
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

export interface TvShowDetails extends TvShowBase {
  created_by: Array<{ id: number; name: string; credit_id?: string; profile_path: string | null; [key: string]: unknown }>;
  episode_run_time: number[];
  genres: Genre[];
  homepage: string | null;
  in_production: boolean;
  languages: string[];
  last_air_date: string | null;
  last_episode_to_air: Episode | null;
  next_episode_to_air: Episode | null;
  networks: Network[];
  number_of_episodes: number;
  number_of_seasons: number;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  seasons: SeasonSummary[];
  spoken_languages: SpokenLanguage[];
  status: string;
  tagline: string | null;
  type: string;

  // Present when requested with appendToResponse.
  credits?: Credits;
  aggregate_credits?: AggregateCredits;
  images?: Images;
  videos?: VideoList;
  keywords?: TvKeywords;
  external_ids?: ExternalIds;
  recommendations?: Paged<TvShow>;
  similar?: Paged<TvShow>;
  reviews?: Paged<Review>;
  content_ratings?: ContentRatings;
  'watch/providers'?: WatchProviders;
  translations?: Translations;
  alternative_titles?: AlternativeTitles;
  moods?: Moods;
  soundtracks?: Soundtracks;
  ratings?: Ratings;
  wikidata?: Wikidata;
}

// ---------------------------------------------------------------------------
// People and credits
// ---------------------------------------------------------------------------

export interface Person extends Extensible {
  id: number;
  adult: boolean;
  gender: number;
  known_for_department: string;
  name: string;
  original_name?: string;
  popularity: number;
  profile_path: string | null;
  media_type?: 'person';
  known_for?: Array<Movie | TvShow>;
}

export interface PersonDetails extends Extensible {
  id: number;
  adult: boolean;
  also_known_as: string[];
  biography: string;
  birthday: string | null;
  deathday: string | null;
  gender: number;
  homepage: string | null;
  imdb_id: string | null;
  known_for_department: string;
  name: string;
  place_of_birth: string | null;
  popularity: number;
  profile_path: string | null;
}

export interface CastMember extends Extensible {
  id: number;
  adult?: boolean;
  gender?: number;
  known_for_department?: string;
  name: string;
  original_name?: string;
  popularity?: number;
  profile_path: string | null;
  cast_id?: number;
  character: string;
  credit_id: string;
  order: number;
}

export interface CrewMember extends Extensible {
  id: number;
  adult?: boolean;
  gender?: number;
  known_for_department?: string;
  name: string;
  original_name?: string;
  popularity?: number;
  profile_path: string | null;
  credit_id: string;
  department: string;
  job: string;
}

export interface Credits extends Extensible {
  id?: number;
  cast: CastMember[];
  crew: CrewMember[];
}

export interface AggregateCredits extends Extensible {
  id?: number;
  cast: Array<Extensible & { id: number; name: string; roles?: Array<Extensible & { character: string; episode_count: number }>; total_episode_count?: number }>;
  crew: Array<Extensible & { id: number; name: string; jobs?: Array<Extensible & { job: string; episode_count: number }>; department?: string; total_episode_count?: number }>;
}

/** One credit in a person's movie, TV or combined credits. */
export interface PersonCredit extends Extensible {
  id: number;
  media_type?: 'movie' | 'tv';
  title?: string;
  name?: string;
  character?: string;
  job?: string;
  department?: string;
  credit_id: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
}

export interface PersonCredits extends Extensible {
  id: number;
  cast: PersonCredit[];
  crew: PersonCredit[];
}

// ---------------------------------------------------------------------------
// Media blocks (also returned inside appendToResponse)
// ---------------------------------------------------------------------------

export interface ImageFile extends Extensible {
  aspect_ratio: number;
  file_path: string;
  height: number;
  width: number;
  iso_639_1: string | null;
  vote_average: number;
  vote_count: number;
}

export interface Images extends Extensible {
  id?: number;
  backdrops?: ImageFile[];
  logos?: ImageFile[];
  posters?: ImageFile[];
  profiles?: ImageFile[];
  stills?: ImageFile[];
}

export interface Video extends Extensible {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  official: boolean;
  published_at: string;
  site: string;
  size: number;
  type: string;
}

export interface VideoList extends Extensible {
  id?: number;
  results: Video[];
}

export interface MovieKeywords extends Extensible {
  id?: number;
  keywords: Keyword[];
}

export interface TvKeywords extends Extensible {
  id?: number;
  results: Keyword[];
}

export interface ExternalIds extends Extensible {
  id?: number;
  imdb_id?: string | null;
  tvdb_id?: number | null;
  wikidata_id?: string | null;
  facebook_id?: string | null;
  instagram_id?: string | null;
  twitter_id?: string | null;
}

export interface Review extends Extensible {
  id: string;
  author: string;
  author_details?: Extensible;
  content: string;
  created_at: string;
  updated_at?: string;
  url?: string;
}

export interface ReleaseDates extends Extensible {
  id?: number;
  results: Array<
    Extensible & {
      iso_3166_1: string;
      release_dates: Array<Extensible & { certification: string; release_date: string; type: number; iso_639_1?: string; note?: string }>;
    }
  >;
}

export interface ContentRatings extends Extensible {
  id?: number;
  results: Array<Extensible & { iso_3166_1: string; rating: string }>;
}

export interface WatchProvider extends Extensible {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority: number;
}

export interface WatchProviderRegion extends Extensible {
  link: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
  ads?: WatchProvider[];
  free?: WatchProvider[];
}

export interface WatchProviders extends Extensible {
  id?: number;
  /** Keyed by ISO 3166-1 country code. */
  results: Record<string, WatchProviderRegion>;
}

export interface WatchProviderCatalog extends Extensible {
  results: WatchProvider[];
}

export interface WatchProviderRegions extends Extensible {
  results: Array<Extensible & { iso_3166_1: string; english_name: string; native_name: string }>;
}

export interface Translations extends Extensible {
  id?: number;
  translations: Array<
    Extensible & { iso_3166_1: string; iso_639_1: string; name: string; english_name: string; data: Extensible }
  >;
}

export interface AlternativeTitles extends Extensible {
  id?: number;
  titles?: Array<Extensible & { iso_3166_1: string; title: string; type: string }>;
  results?: Array<Extensible & { iso_3166_1: string; title: string; type: string }>;
}

// ---------------------------------------------------------------------------
// amodb extras
// ---------------------------------------------------------------------------

export interface RatingValue extends Extensible {
  value: number;
  votes: number | null;
}

/** Ratings from several sources. A source with no data is null. */
export interface Ratings extends Extensible {
  id?: number;
  imdb: RatingValue | null;
  kinopoisk: RatingValue | null;
  metacritic: RatingValue | null;
  rotten_tomatoes: RatingValue | null;
  tmdb: RatingValue | null;
}

/** Mood meters for a title. */
export interface Moods extends Extensible {
  id?: number;
}

export interface Soundtracks extends Extensible {
  id?: number;
}

/** Selected structured facts for a title. */
export interface Wikidata extends Extensible {
  id?: number;
}

/** Cinema showtimes when known. */
export interface Showtimes extends Extensible {
  id?: number;
}

// ---------------------------------------------------------------------------
// Search, discover, trending, find
// ---------------------------------------------------------------------------

export type MultiResult =
  | (Movie & { media_type: 'movie' })
  | (TvShow & { media_type: 'tv' })
  | (Person & { media_type: 'person' });

export type TrendingItem = MultiResult;

export interface CompanySummary extends Extensible {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface CompanyDetails extends CompanySummary {
  description: string;
  headquarters: string;
  homepage: string;
  parent_company: CompanySummary | null;
}

export interface NetworkDetails extends Network {
  headquarters: string;
  homepage: string;
}

export interface CollectionDetails extends CollectionSummary {
  overview: string;
  parts: Movie[];
}

export interface FindResults extends Extensible {
  movie_results: Movie[];
  person_results: Person[];
  tv_results: TvShow[];
  tv_episode_results: Episode[];
  tv_season_results: Season[];
}

// ---------------------------------------------------------------------------
// Configuration and certifications
// ---------------------------------------------------------------------------

export interface Configuration extends Extensible {
  images: {
    base_url: string;
    secure_base_url: string;
    backdrop_sizes: string[];
    logo_sizes: string[];
    poster_sizes: string[];
    profile_sizes: string[];
    still_sizes: string[];
    [key: string]: unknown;
  };
  change_keys?: string[];
}

export interface Certifications extends Extensible {
  /** Keyed by ISO 3166-1 country code. */
  certifications: Record<string, Array<Extensible & { certification: string; meaning: string; order: number }>>;
}

// ---------------------------------------------------------------------------
// OMDb
// ---------------------------------------------------------------------------

export interface OmdbRating extends Extensible {
  Source: string;
  Value: string;
}

export interface OmdbTitle extends Extensible {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: OmdbRating[];
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD?: string;
  BoxOffice?: string;
  Production?: string;
  Website?: string;
  Response: 'True';
}

export interface OmdbSearchItem extends Extensible {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

export interface OmdbSearch extends Extensible {
  Search: OmdbSearchItem[];
  totalResults: string;
  Response: 'True';
}

// ---------------------------------------------------------------------------
// Plans
// ---------------------------------------------------------------------------

export interface PlanPeriod extends Extensible {
  id: string;
  months: number;
  save: number;
}

export interface Plan extends Extensible {
  /** For example lite, pro or proplus. */
  id: string;
  name: string;
  /** Requests per minute. */
  rpm: number;
  monthlyCents: number;
  /** Total price in cents, keyed by period id. */
  totals: Record<string, number>;
}

export interface PlanCatalog extends Extensible {
  currency: string;
  periods: PlanPeriod[];
  plans: Plan[];
  fetchedAt: string | number;
}
