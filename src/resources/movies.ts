import type {
  Credits,
  Id,
  Images,
  MediaLists,
  MovieAlternativeTitles,
  MovieDetails,
  MovieExternalIds,
  MovieKeywords,
  Moods,
  Movie,
  Paged,
  Ratings,
  ReleaseDates,
  Review,
  Showtimes,
  Soundtracks,
  Translations,
  VideoList,
  WatchProviders,
  Wikidata,
} from '../types';
import type {
  CallOptions,
  ImagesOptions,
  MovieDetailsOptions,
  MovieListOptions,
  PageArg,
  VideosOptions,
} from '../options';
import { pageOptions, seg, toParams } from '../query';
import type { Requester } from '../transport';

/** `client.movies`: details, lists and the amodb extras for movies. */
export class Movies {
  constructor(private readonly http: Requester) {}

  details(id: Id, options?: MovieDetailsOptions): Promise<MovieDetails> {
    return this.http.request(`/movie/${seg(id)}`, toParams(options));
  }
  /** The newest movie in the catalog. */
  latest(options?: CallOptions): Promise<MovieDetails> {
    return this.http.request('/movie/latest', toParams(options));
  }
  credits(id: Id, options?: CallOptions): Promise<Credits> {
    return this.http.request(`/movie/${seg(id)}/credits`, toParams(options));
  }
  images(id: Id, options?: ImagesOptions): Promise<Images> {
    return this.http.request(`/movie/${seg(id)}/images`, toParams(options));
  }
  videos(id: Id, options?: VideosOptions): Promise<VideoList> {
    return this.http.request(`/movie/${seg(id)}/videos`, toParams(options));
  }
  keywords(id: Id, options?: CallOptions): Promise<MovieKeywords> {
    return this.http.request(`/movie/${seg(id)}/keywords`, toParams(options));
  }
  externalIds(id: Id, options?: CallOptions): Promise<MovieExternalIds> {
    return this.http.request(`/movie/${seg(id)}/external_ids`, toParams(options));
  }
  recommendations(id: Id, page?: PageArg): Promise<Paged<Movie>> {
    return this.http.request(`/movie/${seg(id)}/recommendations`, toParams(pageOptions(page)));
  }
  similar(id: Id, page?: PageArg): Promise<Paged<Movie>> {
    return this.http.request(`/movie/${seg(id)}/similar`, toParams(pageOptions(page)));
  }
  /** Only a few titles have reviews, so the list is empty for most. */
  reviews(id: Id, page?: PageArg): Promise<Paged<Review>> {
    return this.http.request(`/movie/${seg(id)}/reviews`, toParams(pageOptions(page)));
  }
  releaseDates(id: Id, options?: CallOptions): Promise<ReleaseDates> {
    return this.http.request(`/movie/${seg(id)}/release_dates`, toParams(options));
  }
  watchProviders(id: Id, options?: CallOptions): Promise<WatchProviders> {
    return this.http.request(`/movie/${seg(id)}/watch/providers`, toParams(options));
  }
  translations(id: Id, options?: CallOptions): Promise<Translations> {
    return this.http.request(`/movie/${seg(id)}/translations`, toParams(options));
  }
  /** The list is often empty. */
  alternativeTitles(id: Id, options?: CallOptions): Promise<MovieAlternativeTitles> {
    return this.http.request(`/movie/${seg(id)}/alternative_titles`, toParams(options));
  }
  /** User lists that contain the movie. Paged. */
  lists(id: Id, page?: PageArg): Promise<MediaLists> {
    return this.http.request(`/movie/${seg(id)}/lists`, toParams(pageOptions(page)));
  }

  popular(page?: PageArg | MovieListOptions): Promise<Paged<Movie>> {
    return this.http.request('/movie/popular', toParams(pageOptions(page)));
  }
  topRated(page?: PageArg | MovieListOptions): Promise<Paged<Movie>> {
    return this.http.request('/movie/top_rated', toParams(pageOptions(page)));
  }
  upcoming(page?: PageArg | MovieListOptions): Promise<Paged<Movie>> {
    return this.http.request('/movie/upcoming', toParams(pageOptions(page)));
  }
  nowPlaying(page?: PageArg | MovieListOptions): Promise<Paged<Movie>> {
    return this.http.request('/movie/now_playing', toParams(pageOptions(page)));
  }

  // amodb extras
  moods(id: Id, options?: CallOptions): Promise<Moods> {
    return this.http.request(`/movie/${seg(id)}/moods`, toParams(options));
  }
  soundtracks(id: Id, options?: CallOptions): Promise<Soundtracks> {
    return this.http.request(`/movie/${seg(id)}/soundtracks`, toParams(options));
  }
  ratings(id: Id, options?: CallOptions): Promise<Ratings> {
    return this.http.request(`/movie/${seg(id)}/ratings`, toParams(options));
  }
  wikidata(id: Id, options?: CallOptions): Promise<Wikidata> {
    return this.http.request(`/movie/${seg(id)}/wikidata`, toParams(options));
  }
  /**
   * Cinema showtimes. Without `country` the reply holds per-country counts in
   * `countries`. With an ISO 3166-1 code such as `RU`, `results` holds the venues.
   */
  showtimes(id: Id, country?: string, options?: CallOptions): Promise<Showtimes> {
    return this.http.request(`/movie/${seg(id)}/showtimes`, toParams(options, { country }));
  }
}
