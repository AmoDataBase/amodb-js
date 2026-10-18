import { imageUrl as buildImageUrl } from './images';
import type { AmodbOptions, CallOptions, ExternalSource, ImageSize } from './options';
import { seg, toParams } from './query';
import { Discover } from './resources/discover';
import {
  CertificationsResource,
  Collections,
  Companies,
  Genres,
  Keywords,
  Networks,
  WatchProvidersResource,
} from './resources/misc';
import { Movies } from './resources/movies';
import { Omdb } from './resources/omdb';
import { People } from './resources/people';
import { Search } from './resources/search';
import { Trending } from './resources/trending';
import { Tv } from './resources/tv';
import { HttpClient, type Requester } from './transport';
import type { Configuration, FindResults, Params, PlanCatalog } from './types';

/**
 * The amodb client.
 *
 * ```ts
 * const client = new Amodb({ apiKey: process.env.AMODB_API_KEY! });
 * const movie = await client.movies.details(550);
 * ```
 */
export class Amodb implements Requester {
  readonly movies: Movies;
  readonly tv: Tv;
  readonly people: People;
  readonly search: Search;
  readonly discover: Discover;
  readonly trending: Trending;
  readonly genres: Genres;
  readonly collections: Collections;
  readonly companies: Companies;
  readonly networks: Networks;
  readonly keywords: Keywords;
  readonly certifications: CertificationsResource;
  readonly watchProviders: WatchProvidersResource;
  readonly omdb: Omdb;

  private readonly http: HttpClient;

  /** Throws a TypeError when `apiKey` is empty. */
  constructor(options: AmodbOptions) {
    const http = new HttpClient(options);
    this.http = http;
    this.movies = new Movies(http);
    this.tv = new Tv(http);
    this.people = new People(http);
    this.search = new Search(http);
    this.discover = new Discover(http);
    this.trending = new Trending(http);
    this.genres = new Genres(http);
    this.collections = new Collections(http);
    this.companies = new Companies(http);
    this.networks = new Networks(http);
    this.keywords = new Keywords(http);
    this.certifications = new CertificationsResource(http);
    this.watchProviders = new WatchProvidersResource(http);
    this.omdb = new Omdb(http);
  }

  /** Looks up a title or person by an external id. */
  find(externalId: string, externalSource: ExternalSource, options?: CallOptions): Promise<FindResults> {
    return this.http.request(`/find/${seg(externalId)}`, toParams(options, { external_source: externalSource }));
  }

  /** Image sizes and base URLs. */
  configuration(): Promise<Configuration> {
    return this.http.request('/configuration');
  }

  /** The public plan catalog. No key is sent. */
  plans(): Promise<PlanCatalog> {
    return this.http.plans();
  }

  /** Builds an image URL from a `poster_path`, `profile_path` and similar fields. */
  imageUrl(path: string | null | undefined, size: ImageSize = 'w500'): string | null {
    return buildImageUrl(path, size, this.http.imageBaseUrl);
  }

  /**
   * Escape hatch: GET `baseUrl + path` with the same auth, retries and errors.
   * `params` is sent as given. Returns the parsed JSON.
   */
  request<T = unknown>(path: string, params?: Params): Promise<T> {
    return this.http.request<T>(path, params);
  }
}

/** Same as `new Amodb(options)`. */
export function createClient(options: AmodbOptions): Amodb {
  return new Amodb(options);
}
