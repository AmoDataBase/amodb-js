import type {
  ContentRatings,
  Credits,
  Episode,
  EpisodeCredits,
  EpisodeGroups,
  Id,
  Images,
  MediaLists,
  Moods,
  Paged,
  Ratings,
  Review,
  Season,
  Showtimes,
  Soundtracks,
  Translations,
  TvAlternativeTitles,
  TvExternalIds,
  TvKeywords,
  TvShow,
  TvShowDetails,
  VideoList,
  WatchProviders,
  Wikidata,
} from '../types';
import type {
  CallOptions,
  EpisodeDetailsOptions,
  ImagesOptions,
  PageArg,
  SeasonDetailsOptions,
  TvDetailsOptions,
  VideosOptions,
} from '../options';
import { pageOptions, seg, toParams } from '../query';
import type { Requester } from '../transport';

/** `client.tv`: shows, seasons, episodes and the amodb extras for TV. */
export class Tv {
  constructor(private readonly http: Requester) {}

  details(id: Id, options?: TvDetailsOptions): Promise<TvShowDetails> {
    return this.http.request(`/tv/${seg(id)}`, toParams(options));
  }
  /** The newest show in the catalog. */
  latest(options?: CallOptions): Promise<TvShowDetails> {
    return this.http.request('/tv/latest', toParams(options));
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
  externalIds(id: Id, options?: CallOptions): Promise<TvExternalIds> {
    return this.http.request(`/tv/${seg(id)}/external_ids`, toParams(options));
  }
  recommendations(id: Id, page?: PageArg): Promise<Paged<TvShow>> {
    return this.http.request(`/tv/${seg(id)}/recommendations`, toParams(pageOptions(page)));
  }
  similar(id: Id, page?: PageArg): Promise<Paged<TvShow>> {
    return this.http.request(`/tv/${seg(id)}/similar`, toParams(pageOptions(page)));
  }
  /** Only a few titles have reviews, so the list is empty for most. */
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
  alternativeTitles(id: Id, options?: CallOptions): Promise<TvAlternativeTitles> {
    return this.http.request(`/tv/${seg(id)}/alternative_titles`, toParams(options));
  }
  /** User lists that contain the show. Paged. */
  lists(id: Id, page?: PageArg): Promise<MediaLists> {
    return this.http.request(`/tv/${seg(id)}/lists`, toParams(pageOptions(page)));
  }
  episodeGroups(id: Id, options?: CallOptions): Promise<EpisodeGroups> {
    return this.http.request(`/tv/${seg(id)}/episode_groups`, toParams(options));
  }

  season(tvId: Id, seasonNumber: number, options?: SeasonDetailsOptions): Promise<Season> {
    return this.http.request(`/tv/${seg(tvId)}/season/${seg(seasonNumber)}`, toParams(options));
  }
  seasonCredits(tvId: Id, seasonNumber: number, options?: CallOptions): Promise<Credits> {
    return this.http.request(`/tv/${seg(tvId)}/season/${seg(seasonNumber)}/credits`, toParams(options));
  }
  episode(tvId: Id, seasonNumber: number, episodeNumber: number, options?: EpisodeDetailsOptions): Promise<Episode> {
    return this.http.request(
      `/tv/${seg(tvId)}/season/${seg(seasonNumber)}/episode/${seg(episodeNumber)}`,
      toParams(options),
    );
  }
  episodeCredits(
    tvId: Id,
    seasonNumber: number,
    episodeNumber: number,
    options?: CallOptions,
  ): Promise<EpisodeCredits> {
    return this.http.request(
      `/tv/${seg(tvId)}/season/${seg(seasonNumber)}/episode/${seg(episodeNumber)}/credits`,
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
  /**
   * Cinema showtimes. Without `country` the reply holds per-country counts in
   * `countries`. With an ISO 3166-1 code such as `RU`, `results` holds the venues.
   */
  showtimes(id: Id, country?: string, options?: CallOptions): Promise<Showtimes> {
    return this.http.request(`/tv/${seg(id)}/showtimes`, toParams(options, { country }));
  }
}
