import type {
  Certifications,
  CollectionDetails,
  CompanyDetails,
  GenreList,
  Id,
  Keyword,
  KeywordMovies,
  NetworkDetails,
  WatchProviderCatalog,
  WatchProviderRegions,
} from '../types';
import type { CallOptions, PageArg, WatchProvidersOptions } from '../options';
import { pageOptions, seg, toParams } from '../query';
import type { Requester } from '../transport';

/** `client.genres` */
export class Genres {
  constructor(private readonly http: Requester) {}

  movies(options?: CallOptions): Promise<GenreList> {
    return this.http.request('/genre/movie/list', toParams(options));
  }
  tv(options?: CallOptions): Promise<GenreList> {
    return this.http.request('/genre/tv/list', toParams(options));
  }
}

/** `client.collections` */
export class Collections {
  constructor(private readonly http: Requester) {}

  details(id: Id, options?: CallOptions): Promise<CollectionDetails> {
    return this.http.request(`/collection/${seg(id)}`, toParams(options));
  }
}

/** `client.companies` */
export class Companies {
  constructor(private readonly http: Requester) {}

  details(id: Id, options?: CallOptions): Promise<CompanyDetails> {
    return this.http.request(`/company/${seg(id)}`, toParams(options));
  }
}

/** `client.networks` */
export class Networks {
  constructor(private readonly http: Requester) {}

  details(id: Id, options?: CallOptions): Promise<NetworkDetails> {
    return this.http.request(`/network/${seg(id)}`, toParams(options));
  }
}

/** `client.keywords` */
export class Keywords {
  constructor(private readonly http: Requester) {}

  details(id: Id, options?: CallOptions): Promise<Keyword> {
    return this.http.request(`/keyword/${seg(id)}`, toParams(options));
  }
  /** Movies that carry the keyword. Paged. */
  movies(id: Id, page?: PageArg): Promise<KeywordMovies> {
    return this.http.request(`/keyword/${seg(id)}/movies`, toParams(pageOptions(page)));
  }
}

/** `client.certifications` */
export class CertificationsResource {
  constructor(private readonly http: Requester) {}

  movie(): Promise<Certifications> {
    return this.http.request('/certification/movie/list');
  }
  tv(): Promise<Certifications> {
    return this.http.request('/certification/tv/list');
  }
}

/** `client.watchProviders` */
export class WatchProvidersResource {
  constructor(private readonly http: Requester) {}

  regions(options?: CallOptions): Promise<WatchProviderRegions> {
    return this.http.request('/watch/providers/regions', toParams(options));
  }
  movie(options?: WatchProvidersOptions): Promise<WatchProviderCatalog> {
    return this.http.request('/watch/providers/movie', toParams(options));
  }
  tv(options?: WatchProvidersOptions): Promise<WatchProviderCatalog> {
    return this.http.request('/watch/providers/tv', toParams(options));
  }
}
