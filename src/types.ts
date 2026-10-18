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
  origin_country: string[];
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
  external_ids?: MovieExternalIds;
  recommendations?: Paged<Movie>;
  similar?: Paged<Movie>;
  reviews?: Paged<Review>;
  release_dates?: ReleaseDates;
  'watch/providers'?: WatchProviders;
  translations?: Translations;
  alternative_titles?: MovieAlternativeTitles;
  lists?: MediaLists;
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
  adult: boolean;
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
  /** For example `standard`. */
  episode_type?: string;
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

  // Present when requested with appendToResponse.
  credits?: EpisodeCredits;
  images?: Images;
  videos?: VideoList;
  external_ids?: EpisodeExternalIds;
  translations?: Translations;
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

  // Present when requested with appendToResponse.
  credits?: Credits;
  images?: Images;
  videos?: VideoList;
  external_ids?: SeasonExternalIds;
}

export interface TvShowDetails extends TvShowBase {
  /** Filled for only a few shows, empty for most. */
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

  // Present when requested with appendToResponse.
  credits?: Credits;
  images?: Images;
  videos?: VideoList;
  keywords?: TvKeywords;
  external_ids?: TvExternalIds;
  recommendations?: Paged<TvShow>;
  similar?: Paged<TvShow>;
  reviews?: Paged<Review>;
  content_ratings?: ContentRatings;
  'watch/providers'?: WatchProviders;
  translations?: Translations;
  alternative_titles?: TvAlternativeTitles;
  lists?: MediaLists;
  episode_groups?: EpisodeGroups;
  moods?: Moods;
  soundtracks?: Soundtracks;
  ratings?: Ratings;
  wikidata?: Wikidata;
  showtimes?: Showtimes;
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

  // Present when requested with appendToResponse.
  combined_credits?: PersonCredits;
  movie_credits?: PersonCredits;
  tv_credits?: PersonCredits;
  external_ids?: PersonExternalIds;
  images?: PersonImages;
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

/** Credits of one episode. `guest_stars` holds the guest cast; `cast` is empty today. */
export interface EpisodeCredits extends Credits {
  guest_stars: CastMember[];
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

/** Person images. Only `profiles` is filled. */
export interface PersonImages extends Extensible {
  id?: number;
  profiles: ImageFile[];
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

export interface MovieExternalIds extends Extensible {
  id?: number;
  imdb_id: string | null;
  wikidata_id: string | null;
  facebook_id: string | null;
  instagram_id: string | null;
  twitter_id: string | null;
  /** A numeric string such as `361`. Present when known. */
  kinopoisk_id?: string | null;
}

export interface TvExternalIds extends Extensible {
  id?: number;
  imdb_id: string | null;
  freebase_mid: string | null;
  freebase_id: string | null;
  tvdb_id: number | null;
  tvrage_id: number | null;
  wikidata_id: string | null;
  facebook_id: string | null;
  instagram_id: string | null;
  twitter_id: string | null;
  /** A numeric string such as `404900`. Present when known. */
  kinopoisk_id?: string | null;
}

export interface PersonExternalIds extends Extensible {
  id?: number;
  imdb_id: string | null;
  wikidata_id: string | null;
  facebook_id: string | null;
  instagram_id: string | null;
  tiktok_id: string | null;
  twitter_id: string | null;
  youtube_id: string | null;
}

/** Season external ids. Every value is null today. */
export interface SeasonExternalIds extends Extensible {
  id?: number;
  freebase_mid: string | null;
  freebase_id: string | null;
  tvdb_id: number | null;
  tvrage_id: number | null;
  wikidata_id: string | null;
}

/** Episode external ids. Every value is null today. */
export interface EpisodeExternalIds extends SeasonExternalIds {
  imdb_id: string | null;
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
      release_dates: Array<
        Extensible & {
          certification: string;
          descriptors: string[];
          release_date: string;
          type: number;
          iso_639_1: string;
          note: string;
        }
      >;
    }
  >;
}

export interface ContentRatings extends Extensible {
  id?: number;
  results: Array<Extensible & { descriptors: string[]; iso_3166_1: string; rating: string }>;
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

export interface AlternativeTitle extends Extensible {
  iso_3166_1: string;
  title: string;
  type: string;
}

/** Movie alternative titles use `titles`. The list is often empty. */
export interface MovieAlternativeTitles extends Extensible {
  id?: number;
  titles: AlternativeTitle[];
}

/** TV alternative titles use `results`. */
export interface TvAlternativeTitles extends Extensible {
  id?: number;
  results: AlternativeTitle[];
}

/** A user list that contains the title. */
export interface ListSummary extends Extensible {
  id: number;
  name: string;
  description: string;
  favorite_count: number;
  item_count: number;
  iso_639_1: string;
  iso_3166_1: string;
  poster_path: string | null;
}

/** Lists that contain a title. Paged. */
export interface MediaLists extends Paged<ListSummary> {
  id?: number;
}

export interface EpisodeGroupSummary extends Extensible {
  /** A hex string, not a number. */
  id: string;
  name: string;
  description: string;
  episode_count: number;
  group_count: number;
  network: Network | null;
  type: number;
}

export interface EpisodeGroups extends Extensible {
  id?: number;
  results: EpisodeGroupSummary[];
}

// ---------------------------------------------------------------------------
// amodb extras
// ---------------------------------------------------------------------------

export interface RatingValue extends Extensible {
  /** The score on the scale of its source, see `Ratings`. */
  value: number;
  votes: number | null;
}

/**
 * Ratings from several sources. A source with a missing or zero score is null.
 * Scales: `imdb`, `kinopoisk` and `tmdb` are out of 10, `metacritic` and
 * `rotten_tomatoes` are out of 100. The appended form has no `id`.
 */
export interface Ratings extends Extensible {
  id?: number;
  imdb: RatingValue | null;
  kinopoisk: RatingValue | null;
  metacritic: RatingValue | null;
  rotten_tomatoes: RatingValue | null;
  tmdb: RatingValue | null;
}

/** One mood meter, for example `fear` or `humor`. */
export interface MoodMeter extends Extensible {
  /** For example action, fear, humor, pace, profanity, romance, sadness, sex or violence. */
  name: string;
  /** The mean on a 0 to 10 scale. */
  avg: number;
  /** Individual readings on the same 0 to 10 scale. */
  values: number[];
}

/**
 * Where mood data comes from: `measured` is viewer data, `estimated` is derived
 * from genres, `null` means the title has no data (and `results` is empty).
 */
export type MoodSource = 'measured' | 'estimated' | null;

/** Mood meters for a title, sorted by name. The appended form has no `id`. */
export interface Moods extends Extensible {
  id?: number;
  source: MoodSource;
  results: MoodMeter[];
}

export interface SoundtrackTrack extends Extensible {
  disc: number;
  number: number;
  title: string;
  artist: string;
  duration_ms: number;
}

export interface SoundtrackAlbum extends Extensible {
  source: 'musicbrainz' | 'deezer';
  album: string;
  artist: string | null;
  released: string | null;
  url: string | null;
  track_count: number;
  tracks: SoundtrackTrack[];
}

/** Soundtrack albums for a title. `results` is empty when no album is known. The appended form has no `id`. */
export interface Soundtracks extends Extensible {
  id?: number;
  results: SoundtrackAlbum[];
}

/** A Wikidata item. `tmdb_id` and `media_type` are set only when the item is a title in the catalog. */
export interface WikidataLink extends Extensible {
  wikidata_id: string;
  /** In the request language, falling back to English. */
  label: string | null;
  tmdb_id?: number;
  media_type?: 'movie' | 'tv';
}

/** A prize or nomination. `year` is set when known. */
export interface WikidataEntry extends WikidataLink {
  year?: number;
}

export interface WikidataMoney extends Extensible {
  /** A rounded integer. */
  value: number;
  /** An ISO currency code, or null. */
  currency: string | null;
}

export interface WikidataBoxOffice extends WikidataMoney {
  worldwide: boolean;
}

/** A work that a title is based on, with its author when known. */
export interface WikidataSource extends WikidataEntry {
  author: WikidataLink | null;
}

/** Selected structured facts for a title from Wikidata. Empty groups are `[]`. */
export interface Wikidata extends Extensible {
  id: number;
  wikidata_id: string | null;
  budget: WikidataMoney | null;
  box_office: WikidataBoxOffice | null;
  follows: WikidataLink | null;
  followed_by: WikidataLink | null;
  /** Wikipedia page titles keyed by language code (the 14 served languages). */
  sitelinks: Record<string, string>;
  awards: WikidataEntry[];
  nominations: WikidataEntry[];
  based_on: WikidataSource[];
  filming_locations: WikidataLink[];
  narrative_locations: WikidataLink[];
  original_broadcasters: WikidataLink[];
}

/** One screening. `start` is local time at the venue, for example `2026-10-18T21:40`. */
export interface Showtime extends Extensible {
  /** A day, `YYYY-MM-DD`. */
  date: string;
  start: string;
  end: string | null;
  auditorium: string | null;
  formats: string[];
  tags: string[];
  audio: string | null;
  subtitles: string | null;
  language: string | null;
  price: number | null;
  currency: string | null;
  prices: unknown;
  booking_url: string | null;
  sold_out: boolean;
}

/** A cinema with its screenings of one title. */
export interface ShowtimeVenue extends Extensible {
  id: number;
  name: string;
  chain: { key: string; name: string | null };
  city: string | null;
  region: string | null;
  address: string | null;
  postal_code: string | null;
  country: string;
  timezone: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  url: string | null;
  showtimes: Showtime[];
}

/** Screening counts for one country. Only countries with a last day of today or later are listed. */
export interface ShowtimeCountry extends Extensible {
  country: string;
  name: string;
  venues: number;
  cities: number;
  showtimes: number;
  first_day: string;
  last_day: string;
}

/**
 * Cinema showtimes. Without a country, `country` is null, `results` is empty and
 * `countries` holds per-country counts (up to 60, most showtimes first).
 * With a country, `results` holds the venues (up to 1500 showtimes in total).
 */
export interface Showtimes extends Extensible {
  id: number;
  country: string | null;
  results: ShowtimeVenue[];
  countries: ShowtimeCountry[];
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
  /** Always an empty string today. */
  description: string;
  headquarters: string;
  homepage: string;
  /** Always null today. */
  parent_company: CompanySummary | null;
}

export interface NetworkDetails extends Network {
  headquarters: string;
  homepage: string;
}

/** A collection with its movies, ordered by release date. */
export interface CollectionDetails extends CollectionSummary {
  overview: string;
  parts: Movie[];
}

/** A collection as it appears in `search.collection`. */
export interface CollectionSearchResult extends Extensible {
  id: number;
  adult: boolean;
  backdrop_path: string | null;
  name: string;
  original_language: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
}

/** Movies that carry a keyword. Paged. */
export interface KeywordMovies extends Paged<Movie> {
  id: number;
}

/**
 * Result of `find`. Items carry `media_type`. `tv_episode_results` and
 * `tv_season_results` are always empty today, and `known_for` of a person is empty.
 */
export interface FindResults extends Extensible {
  movie_results: Array<Movie & { media_type: 'movie' }>;
  person_results: Array<Person & { media_type: 'person' }>;
  tv_results: Array<TvShow & { media_type: 'tv' }>;
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
  /** Series only, for example `"5"`. */
  totalSeasons?: string;
  /** Movies only. Always `"N/A"` today. */
  DVD?: string;
  /** Movies only. */
  BoxOffice?: string;
  /** Movies only. Always `"N/A"` today. */
  Production?: string;
  /** Movies only. Always `"N/A"` today. */
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
