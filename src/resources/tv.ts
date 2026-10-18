import type {
  AggregateCredits,
  AlternativeTitles,
  ContentRatings,
  Credits,
  Episode,
  ExternalIds,
  Id,
  Images,
  Moods,
  Paged,
  Ratings,
  Review,
  Season,
  Soundtracks,
  Translations,
  TvKeywords,
  TvShow,
  TvShowDetails,
  VideoList,
  WatchProviders,
  Wikidata,
} from '../types';
import type { CallOptions, DetailsOptions, ImagesOptions, PageArg, VideosOptions } from '../options';
import { pageOptions, seg, toParams } from '../query';
import type { Requester } from '../transport';

/** `client.tv`: shows, seasons, episodes and the amodb extras for TV. */
export class Tv {
  constructor(private readonly http: Requester) {}

  details(id: Id, options?: DetailsOptions): Promise<TvShowDetails> {
    return this.http.request(`/tv/${seg(id)}`, toParams(options));
  }
  aggregateCredits(id: Id, options?: CallOptions): Promise<AggregateCredits> {
    return this.http.request(`/tv/${seg(id)}/aggregate_credits`, toParams(options));
  }
  credits(id: Id, options?: CallOptions): Promise<Credits> {
    return this.http.request(`/tv/${seg(id)}/credits`, toParams(options));
  }
  images(id: Id, options?: ImagesOptions): Promise<Images> {
    return this.http.request(`/tv/${seg(id)}/images`, toParams(options));
  }
  videos(id: Id, options?: VideosOptions): Promise<VideoList> {
    return this.http.request(`/tv/${seg(id)}/videos`, toParams(options));
  }
  keywords(id: Id, options?: CallOptions): Promise<TvKeywords> {
    return this.http.request(`/tv/${seg(id)}/keywords`, toParams(options));
  }
  externalIds(id: Id, options?: CallOptions): Promise<ExternalIds> {
    return this.http.request(`/tv/${seg(id)}/external_ids`, toParams(options));
  }
  recommendations(id: Id, page?: PageArg): Promise<Paged<TvShow>> {
    return this.http.request(`/tv/${seg(id)}/recommendations`, toParams(pageOptions(page)));
  }
  similar(id: Id, page?: PageArg): Promise<Paged<TvShow>> {
    return this.http.request(`/tv/${seg(id)}/similar`, toParams(pageOptions(page)));
  }
  reviews(id: Id, page?: PageArg): Promise<Paged<Review>> {
    return this.http.request(`/tv/${seg(id)}/reviews`, toParams(pageOptions(page)));
  }
  contentRatings(id: Id, options?: CallOptions): Promise<ContentRatings> {
    return this.http.request(`/tv/${seg(id)}/content_ratings`, toParams(options));
  }
  watchProviders(id: Id, options?: CallOptions): Promise<WatchProviders> {
    return this.http.request(`/tv/${seg(id)}/watch/providers`, toParams(options));
  }
  translations(id: Id, options?: CallOptions): Promise<Translations> {
    return this.http.request(`/tv/${seg(id)}/translations`, toParams(options));
  }
  alternativeTitles(id: Id, options?: CallOptions): Promise<AlternativeTitles> {
    return this.http.request(`/tv/${seg(id)}/alternative_titles`, toParams(options));
  }

  season(tvId: Id, seasonNumber: number, options?: DetailsOptions): Promise<Season> {
    return this.http.request(`/tv/${seg(tvId)}/season/${seg(seasonNumber)}`, toParams(options));
  }
  episode(tvId: Id, seasonNumber: number, episodeNumber: number, options?: DetailsOptions): Promise<Episode> {
    return this.http.request(
      `/tv/${seg(tvId)}/season/${seg(seasonNumber)}/episode/${seg(episodeNumber)}`,
      toParams(options),
    );
  }

  popular(page?: PageArg): Promise<Paged<TvShow>> {
    return this.http.request('/tv/popular', toParams(pageOptions(page)));
  }
  topRated(page?: PageArg): Promise<Paged<TvShow>> {
    return this.http.request('/tv/top_rated', toParams(pageOptions(page)));
  }
  airingToday(page?: PageArg): Promise<Paged<TvShow>> {
    return this.http.request('/tv/airing_today', toParams(pageOptions(page)));
  }
  onTheAir(page?: PageArg): Promise<Paged<TvShow>> {
    return this.http.request('/tv/on_the_air', toParams(pageOptions(page)));
  }

  // amodb extras
  moods(id: Id, options?: CallOptions): Promise<Moods> {
    return this.http.request(`/tv/${seg(id)}/moods`, toParams(options));
  }
  soundtracks(id: Id, options?: CallOptions): Promise<Soundtracks> {
    return this.http.request(`/tv/${seg(id)}/soundtracks`, toParams(options));
  }
  ratings(id: Id, options?: CallOptions): Promise<Ratings> {
    return this.http.request(`/tv/${seg(id)}/ratings`, toParams(options));
  }
  wikidata(id: Id, options?: CallOptions): Promise<Wikidata> {
    return this.http.request(`/tv/${seg(id)}/wikidata`, toParams(options));
  }
}
