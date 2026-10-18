import type { Movie, Paged, Params, Person, TrendingItem, TvShow } from '../types';
import type { TrendingMediaType, TrendingWindow } from '../options';
import { seg } from '../query';
import type { Requester } from '../transport';

interface TrendingByType {
  all: TrendingItem;
  movie: Movie;
  tv: TvShow;
  person: Person;
}

/** `client.trending` */
export class Trending {
  constructor(private readonly http: Requester) {}

  /** `params` is a raw query map such as `{ page: 2, language: 'de-DE' }`. */
  get<M extends TrendingMediaType = 'all'>(
    mediaType: M = 'all' as M,
    window: TrendingWindow = 'day',
    params?: Params,
  ): Promise<Paged<TrendingByType[M]>> {
    return this.http.request(`/trending/${seg(mediaType)}/${seg(window)}`, params);
  }
}
