export { Amodb, createClient } from './client';
export { imageUrl } from './images';
export { AmodbError, AmodbTimeoutError, NetworkError, RateLimitError } from './errors';
export type { AmodbErrorInit, RateLimitErrorInit } from './errors';
export { VERSION } from './constants';

export { Movies } from './resources/movies';
export { Tv } from './resources/tv';
export { People } from './resources/people';
export { Search } from './resources/search';
export { Discover } from './resources/discover';
export { Trending } from './resources/trending';
export { Omdb } from './resources/omdb';
export {
  CertificationsResource,
  Collections,
  Companies,
  Genres,
  Keywords,
  Networks,
  WatchProvidersResource,
} from './resources/misc';

export type * from './options';
export type * from './types';
