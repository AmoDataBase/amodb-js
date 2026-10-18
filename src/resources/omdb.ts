import type { OmdbByIdOptions, OmdbByTitleOptions, OmdbSearchOptions } from '../options';
import { toParams } from '../query';
import type { HttpClient } from '../transport';
import type { OmdbSearch, OmdbTitle, Params } from '../types';

/** Maps `year` to the OMDb name `y`; everything else keeps its name. */
function omdbParams(options: { year?: number | string; params?: Params }, extra: Params): Params {
  const { year, ...rest } = options;
  return toParams(rest, { ...extra, y: year });
}

/**
 * `client.omdb`: the OMDb compatible endpoint.
 * A body with `Response: "False"` raises `AmodbError` with `statusMessage` set to the `Error` text.
 */
export class Omdb {
  constructor(private readonly http: Pick<HttpClient, 'omdb'>) {}

  byId(imdbId: string, options: OmdbByIdOptions = {}): Promise<OmdbTitle> {
    return this.http.omdb(omdbParams(options, { i: imdbId }));
  }
  byTitle(title: string, options: OmdbByTitleOptions = {}): Promise<OmdbTitle> {
    return this.http.omdb(omdbParams(options, { t: title }));
  }
  search(query: string, options: OmdbSearchOptions = {}): Promise<OmdbSearch> {
    return this.http.omdb(omdbParams(options, { s: query }));
  }
}
