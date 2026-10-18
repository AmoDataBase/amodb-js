import type {
  CollectionSummary,
  CompanySummary,
  Keyword,
  Movie,
  MultiResult,
  Paged,
  Person,
  TvShow,
} from '../types';
import type { SearchMovieOptions, SearchOptions, SearchTvOptions } from '../options';
import { toParams } from '../query';
import type { Requester } from '../transport';

/** `client.search` */
export class Search {
  constructor(private readonly http: Requester) {}

  movie(query: string, options?: SearchMovieOptions): Promise<Paged<Movie>> {
    return this.http.request('/search/movie', toParams({ query, ...options }));
  }
  tv(query: string, options?: SearchTvOptions): Promise<Paged<TvShow>> {
    return this.http.request('/search/tv', toParams({ query, ...options }));
  }
  person(query: string, options?: SearchOptions): Promise<Paged<Person>> {
    return this.http.request('/search/person', toParams({ query, ...options }));
  }
  multi(query: string, options?: SearchOptions): Promise<Paged<MultiResult>> {
    return this.http.request('/search/multi', toParams({ query, ...options }));
  }
  collection(query: string, options?: SearchOptions): Promise<Paged<CollectionSummary>> {
    return this.http.request('/search/collection', toParams({ query, ...options }));
  }
  company(query: string, options?: SearchOptions): Promise<Paged<CompanySummary>> {
    return this.http.request('/search/company', toParams({ query, ...options }));
  }
  keyword(query: string, options?: SearchOptions): Promise<Paged<Keyword>> {
    return this.http.request('/search/keyword', toParams({ query, ...options }));
  }
}
