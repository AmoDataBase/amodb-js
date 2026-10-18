import type { Movie, Paged, TvShow } from '../types';
import type { DiscoverMovieParams, DiscoverTvParams } from '../options';
import type { Requester } from '../transport';

/** `client.discover`. Parameters are sent as given, for example `sort_by` and `with_genres`. */
export class Discover {
  constructor(private readonly http: Requester) {}

  movie(params?: DiscoverMovieParams): Promise<Paged<Movie>> {
    return this.http.request('/discover/movie', params);
  }
  tv(params?: DiscoverTvParams): Promise<Paged<TvShow>> {
    return this.http.request('/discover/tv', params);
  }
}
