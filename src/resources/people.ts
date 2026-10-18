import type { ExternalIds, Id, Images, Paged, Person, PersonCredits, PersonDetails } from '../types';
import type { CallOptions, DetailsOptions, PageArg } from '../options';
import { pageOptions, seg, toParams } from '../query';
import type { Requester } from '../transport';

/** `client.people` */
export class People {
  constructor(private readonly http: Requester) {}

  details(id: Id, options?: DetailsOptions): Promise<PersonDetails> {
    return this.http.request(`/person/${seg(id)}`, toParams(options));
  }
  combinedCredits(id: Id, options?: CallOptions): Promise<PersonCredits> {
    return this.http.request(`/person/${seg(id)}/combined_credits`, toParams(options));
  }
  movieCredits(id: Id, options?: CallOptions): Promise<PersonCredits> {
    return this.http.request(`/person/${seg(id)}/movie_credits`, toParams(options));
  }
  tvCredits(id: Id, options?: CallOptions): Promise<PersonCredits> {
    return this.http.request(`/person/${seg(id)}/tv_credits`, toParams(options));
  }
  images(id: Id, options?: CallOptions): Promise<Images> {
    return this.http.request(`/person/${seg(id)}/images`, toParams(options));
  }
  externalIds(id: Id, options?: CallOptions): Promise<ExternalIds> {
    return this.http.request(`/person/${seg(id)}/external_ids`, toParams(options));
  }
  popular(page?: PageArg): Promise<Paged<Person>> {
    return this.http.request('/person/popular', toParams(pageOptions(page)));
  }
}
