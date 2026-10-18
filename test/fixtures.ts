// Real response bodies from the amodb API, trimmed (lists cut, long strings cut).
// Each is typed against the SDK so a wrong field name or nullability fails typecheck.
import type {
  CollectionSearchResult,
  ContentRatings,
  EpisodeCredits,
  EpisodeGroups,
  FindResults,
  MediaLists,
  Moods,
  MovieAlternativeTitles,
  MovieDetails,
  MovieExternalIds,
  OmdbSearch,
  OmdbTitle,
  Paged,
  PersonExternalIds,
  Ratings,
  Showtimes,
  Soundtracks,
  TvAlternativeTitles,
  TvExternalIds,
  TvShowDetails,
  Wikidata,
} from '../src/index';

/** GET /3/movie/155/moods (measured), first 3 meters and readings. */
export const moodsMeasured: Moods = {
  id: 155,
  source: 'measured',
  results: [
    {
      name: 'action',
      avg: 3.9,
      values: [3.6, 3.4, 4.2],
    },
    {
      name: 'fear',
      avg: 5.2,
      values: [3.6, 6, 4.8],
    },
    {
      name: 'humor',
      avg: 0.9,
      values: [2.4, 1.8, 0.4],
    },
  ],
};

/** GET /3/tv/1396/moods (estimated from genres). */
export const moodsEstimated: Moods = {
  id: 1396,
  source: 'estimated',
  results: [
    {
      name: 'action',
      avg: 4,
      values: [3, 4, 5],
    },
    {
      name: 'fear',
      avg: 2,
      values: [1, 2, 3],
    },
    {
      name: 'humor',
      avg: 3,
      values: [2, 3, 4],
    },
  ],
};

/** GET /3/movie/1798888/moods, a title with no data. */
export const moodsEmpty: Moods = { id: 1798888, source: null, results: [] };

/** GET /3/movie/155/soundtracks, first 2 tracks. */
export const soundtracksMusicbrainz: Soundtracks = {
  id: 155,
  results: [
    {
      source: 'musicbrainz',
      album: 'The Dark Knight',
      artist: 'Hans Zimmer & James Newton Howard',
      released: '2008-07-15',
      url: 'https://musicbrainz.org/release/814b2f7b-c27c-451e-abac-a...',
      track_count: 14,
      tracks: [
        { disc: 1, number: 1, title: 'Why So Serious?', artist: 'Hans Zimmer', duration_ms: 554000 },
        { disc: 1, number: 2, title: "I'm Not a Hero", artist: 'Hans Zimmer', duration_ms: 395000 },
      ],
    },
  ],
};

/** GET /3/movie/27205/soundtracks, first 2 tracks. */
export const soundtracksDeezer: Soundtracks = {
  id: 27205,
  results: [
    {
      source: 'deezer',
      album: 'Inception (Music from the Motion Picture)',
      artist: 'Hans Zimmer',
      released: '2010-07-09',
      url: 'https://www.deezer.com/album/601778',
      track_count: 12,
      tracks: [
        {
          disc: 1,
          number: 1,
          title: 'Half Remembered Dream',
          artist: 'Hans Zimmer',
          duration_ms: 71000,
        },
        {
          disc: 1,
          number: 2,
          title: 'We Built Our Own World',
          artist: 'Hans Zimmer',
          duration_ms: 115000,
        },
      ],
    },
  ],
};

/** GET /3/movie/424/soundtracks, no album known. */
export const soundtracksEmpty: Soundtracks = { id: 424, results: [] };

/** GET /3/movie/550/ratings. */
export const ratingsFull: Ratings = {
  id: 550,
  imdb: { value: 8.8, votes: 2669989 },
  kinopoisk: { value: 8.7, votes: null },
  metacritic: { value: 67, votes: null },
  rotten_tomatoes: { value: 81, votes: null },
  tmdb: { value: 8.437, votes: 33039 },
};

/** GET /3/movie/1798888/ratings, every source missing. */
export const ratingsEmpty: Ratings = { id: 1798888, imdb: null, kinopoisk: null, metacritic: null, rotten_tomatoes: null, tmdb: null };

/** GET /3/movie/550/wikidata, first 2 of each group. */
export const wikidataFightClub: Wikidata = {
  id: 550,
  wikidata_id: 'Q190050',
  budget: { value: 63000000, currency: 'USD' },
  box_office: { value: 101209702, currency: 'USD', worldwide: true },
  follows: null,
  followed_by: null,
  sitelinks: {
    en: 'Fight Club',
    ru: 'Бойцовский клуб (фильм)',
    uk: 'Бійцівський клуб (фільм)',
    be: 'Байцоўскі клуб (фільм)',
    bg: 'Боен клуб (филм)',
    cs: 'Klub rváčů (film)',
    pl: 'Podziemny krąg (film)',
    ro: 'Fight Club (film)',
    fr: 'Fight Club (film)',
    it: 'Fight Club (film)',
    es: 'Fight Club',
    pt: 'Fight Club',
    he: 'מועדון קרב (סרט)',
    zh: '鬥陣俱樂部',
  },
  awards: [
    { wikidata_id: 'Q28044798', label: 'Empire Awards, UK for best british ac...' },
    { wikidata_id: 'Q943908', label: 'Jupiter Award', year: 2000 },
  ],
  nominations: [
    { wikidata_id: 'Q488645', label: 'Academy Award for Best Sound Editing', year: 2000 },
  ],
  based_on: [
    {
      wikidata_id: 'Q837283',
      label: 'Fight Club',
      author: { wikidata_id: 'Q268181', label: 'Chuck Palahniuk' },
    },
  ],
  filming_locations: [
    { wikidata_id: 'Q65', label: 'Los Angeles' },
  ],
  narrative_locations: [
    { wikidata_id: 'Q65', label: 'Los Angeles' },
  ],
  original_broadcasters: [],
};

/** GET /3/movie/604/wikidata (follows and followed_by). */
export const wikidataMatrixReloaded: Wikidata = {
  id: 604,
  wikidata_id: 'Q189600',
  budget: { value: 150000000, currency: 'USD' },
  box_office: { value: 739412035, currency: 'USD', worldwide: true },
  follows: { wikidata_id: 'Q83495', label: 'The Matrix', tmdb_id: 603, media_type: 'movie' },
  followed_by: { wikidata_id: 'Q207536', label: 'The Matrix Revolutions', tmdb_id: 605, media_type: 'movie' },
  sitelinks: {
    en: 'The Matrix Reloaded',
    ru: 'Матрица: Перезагрузка',
    uk: 'Матриця: Перезавантаження',
    be: 'be-tarask:Матрыца перазагрузка',
    bg: 'Матрицата: Презареждане',
    cs: 'Matrix Reloaded',
    pl: 'Matrix Reaktywacja',
    ro: 'Matrix - Reîncărcat',
    fr: 'Matrix Reloaded',
    it: 'Matrix Reloaded',
    es: 'The Matrix Reloaded',
    pt: 'Matrix Reloaded',
    he: 'מטריקס Reloaded',
    zh: '黑客帝国2：重装上阵',
  },
  awards: [],
  nominations: [],
  based_on: [],
  filming_locations: [
    { wikidata_id: 'Q3130', label: 'Sydney' },
  ],
  narrative_locations: [],
  original_broadcasters: [],
};

/** GET /3/movie/155/wikidata (based_on without an author). */
export const wikidataDarkKnight: Wikidata = {
  id: 155,
  wikidata_id: 'Q163872',
  budget: { value: 185000000, currency: 'USD' },
  box_office: { value: 1006234167, currency: 'USD', worldwide: true },
  follows: { wikidata_id: 'Q166262', label: 'Batman Begins', tmdb_id: 272, media_type: 'movie' },
  followed_by: { wikidata_id: 'Q189330', label: 'The Dark Knight Rises', tmdb_id: 49026, media_type: 'movie' },
  sitelinks: {
    en: 'The Dark Knight',
    ru: 'Тёмный рыцарь (фильм)',
    uk: 'Темний лицар (фільм)',
    be: 'Цёмны рыцар',
    bg: 'Черният рицар (филм, 2008)',
    cs: 'Temný rytíř (film)',
    pl: 'Mroczny Rycerz',
    ro: 'Cavalerul negru',
    fr: 'The Dark Knight : Le Chevalier noir',
    it: 'Il cavaliere oscuro',
    es: 'The Dark Knight',
    pt: 'The Dark Knight',
    he: 'האביר האפל',
    zh: '黑暗騎士',
  },
  awards: [
    { wikidata_id: 'Q106291', label: 'Academy Award for Best Supporting Actor', year: 2009 },
    { wikidata_id: 'Q488645', label: 'Academy Award for Best Sound Editing', year: 2009 },
  ],
  nominations: [
    { wikidata_id: 'Q106291', label: 'Academy Award for Best Supporting Actor', year: 2009 },
    { wikidata_id: 'Q131520', label: 'Academy Award for Best Cinematography', year: 2009 },
  ],
  based_on: [
    { wikidata_id: 'Q2695156', label: 'Batman', author: null },
  ],
  filming_locations: [
    { wikidata_id: 'Q65', label: 'Los Angeles' },
    { wikidata_id: 'Q1297', label: 'Chicago' },
  ],
  narrative_locations: [
    { wikidata_id: 'Q732858', label: 'Gotham City' },
    { wikidata_id: 'Q8646', label: 'Hong Kong' },
  ],
  original_broadcasters: [],
};

/** GET /3/movie/550/showtimes, no country. */
export const showtimesSummary: Showtimes = {
  id: 550,
  country: null,
  results: [],
  countries: [
    {
      country: 'RU',
      name: 'Russia',
      venues: 2,
      cities: 1,
      showtimes: 7,
      first_day: '2026-10-18',
      last_day: '2026-10-21',
    },
  ],
};

/** GET /3/movie/550/showtimes?country=RU, first 2 venues and showtimes. */
export const showtimesRussia: Showtimes = {
  id: 550,
  country: 'RU',
  results: [
    {
      id: 1114,
      name: 'Мираж Синема НА БОЛЬШОМ',
      chain: { key: 'mirage-ru', name: 'Мираж Синема' },
      city: 'Санкт-Петербург',
      region: null,
      address: 'Большой пр. П.С., д. 35А',
      postal_code: null,
      country: 'RU',
      timezone: 'Europe/Moscow',
      latitude: null,
      longitude: null,
      phone: null,
      url: 'https://www.mirage.ru/spb/cinema/1/',
      showtimes: [
        {
          date: '2026-10-18',
          start: '2026-10-18T21:40',
          end: null,
          auditorium: null,
          formats: ['2D'],
          tags: [],
          audio: null,
          subtitles: null,
          language: null,
          price: null,
          currency: null,
          prices: null,
          booking_url: 'https://www.mirage.ru/ticket_new/aca7...',
          sold_out: false,
        },
        {
          date: '2026-10-19',
          start: '2026-10-19T22:20',
          end: null,
          auditorium: 'Зал №4',
          formats: ['2D'],
          tags: [],
          audio: null,
          subtitles: null,
          language: null,
          price: null,
          currency: null,
          prices: null,
          booking_url: 'https://www.mirage.ru/ticket_new/0c32...',
          sold_out: false,
        },
      ],
    },
    {
      id: 1115,
      name: 'Мираж Синема ПИК',
      chain: { key: 'mirage-ru', name: 'Мираж Синема' },
      city: 'Санкт-Петербург',
      region: null,
      address: 'ул. Ефимова, д.2',
      postal_code: null,
      country: 'RU',
      timezone: 'Europe/Moscow',
      latitude: null,
      longitude: null,
      phone: null,
      url: 'https://www.mirage.ru/spb/cinema/27/',
      showtimes: [
        {
          date: '2026-10-19',
          start: '2026-10-19T20:10',
          end: null,
          auditorium: 'Зал №4',
          formats: ['2D'],
          tags: [],
          audio: null,
          subtitles: null,
          language: null,
          price: null,
          currency: null,
          prices: null,
          booking_url: 'https://www.mirage.ru/ticket_new/1d14...',
          sold_out: false,
        },
        {
          date: '2026-10-20',
          start: '2026-10-20T20:10',
          end: null,
          auditorium: 'Зал №4',
          formats: ['2D'],
          tags: [],
          audio: null,
          subtitles: null,
          language: null,
          price: null,
          currency: null,
          prices: null,
          booking_url: 'https://www.mirage.ru/ticket_new/8b2e...',
          sold_out: false,
        },
      ],
    },
  ],
  countries: [
    {
      country: 'RU',
      name: 'Russia',
      venues: 2,
      cities: 1,
      showtimes: 7,
      first_day: '2026-10-18',
      last_day: '2026-10-21',
    },
  ],
};

/** GET /3/tv/1396/showtimes, nothing playing. */
export const showtimesEmpty: Showtimes = { id: 1396, country: null, results: [], countries: [] };

/** GET /3/find/361?external_source=kinopoisk_id. */
export const findKinopoisk: FindResults = {
  movie_results: [
    {
      adult: false,
      backdrop_path: '/c6OLXfKAk5BKeR6broC8pYiCquX.jpg',
      genre_ids: [18, 53],
      id: 550,
      original_language: 'en',
      original_title: 'Fight Club',
      overview: 'A ticking-time-bomb insomniac and a s...',
      popularity: 39.0054,
      poster_path: '/jSziioSwPVrOy9Yow3XhWIBDjq1.jpg',
      release_date: '1999-10-15',
      title: 'Fight Club',
      video: false,
      vote_average: 8.437,
      vote_count: 33039,
      media_type: 'movie',
    },
  ],
  person_results: [],
  tv_results: [],
  tv_episode_results: [],
  tv_season_results: [],
};

/** GET /3/find/{Q id}?external_source=wikidata_id for a person. */
export const findPerson: FindResults = {
  movie_results: [],
  person_results: [
    {
      adult: false,
      gender: 2,
      id: 287,
      known_for_department: 'Acting',
      name: 'Brad Pitt',
      original_name: 'Brad Pitt',
      popularity: 13.5158,
      profile_path: '/ajNaPmXVVMJFg9GWmu6MJzTaXdV.jpg',
      known_for: [],
      media_type: 'person',
    },
  ],
  tv_results: [],
  tv_episode_results: [],
  tv_season_results: [],
};

/** GET /3/movie/550/external_ids. */
export const movieExternalIds: MovieExternalIds = {
  id: 550,
  imdb_id: 'tt0137523',
  wikidata_id: 'Q190050',
  facebook_id: 'FightClub',
  instagram_id: null,
  twitter_id: null,
  kinopoisk_id: '361',
};

/** GET /3/tv/1396/external_ids. */
export const tvExternalIds: TvExternalIds = {
  id: 1396,
  imdb_id: 'tt0903747',
  freebase_mid: null,
  freebase_id: null,
  tvdb_id: 81189,
  tvrage_id: null,
  wikidata_id: 'Q1079',
  facebook_id: 'BreakingBad',
  instagram_id: 'breakingbad',
  twitter_id: 'BreakingBad',
  kinopoisk_id: '404900',
};

/** GET /3/person/287/external_ids. */
export const personExternalIds: PersonExternalIds = {
  id: 287,
  imdb_id: 'nm0000093',
  wikidata_id: 'Q35332',
  facebook_id: null,
  instagram_id: null,
  tiktok_id: null,
  twitter_id: null,
  youtube_id: null,
};

/** GET /3/movie/latest. */
export const movieLatest: MovieDetails = {
  adult: false,
  backdrop_path: null,
  belongs_to_collection: null,
  budget: 0,
  genres: [
    { id: 35, name: 'Comedy' },
  ],
  homepage: '',
  id: 1798888,
  imdb_id: 'tt49276703',
  origin_country: ['US'],
  original_language: 'en',
  original_title: 'In the Mood to Leave',
  overview: 'Molly and Derek need to break up.',
  popularity: 0.1489,
  poster_path: '/b55uObskVIJm8n562djLphnljvO.jpg',
  production_companies: [],
  production_countries: [],
  release_date: '',
  revenue: 0,
  runtime: 5,
  spoken_languages: [],
  status: 'Released',
  tagline: '',
  title: 'In the Mood to Leave',
  video: false,
  vote_average: 0,
  vote_count: 0,
};

/** GET /3/tv/latest. */
export const tvLatest: TvShowDetails = {
  adult: false,
  backdrop_path: '/3ax3arGvBqwrvAXTu71hepUGJ0Q.jpg',
  created_by: [],
  episode_run_time: [],
  first_air_date: '2000-05-01',
  genres: [
    { id: 18, name: 'Drama' },
  ],
  homepage: '',
  id: 338695,
  in_production: false,
  languages: ['ru'],
  last_air_date: null,
  last_episode_to_air: null,
  name: 'Бандитский Петербург. Барон',
  next_episode_to_air: null,
  networks: [
    { id: 1199, logo_path: '/9wVcHld7xpIZ5e6CQ3LJyFSiFhz.png', name: 'NTV ', origin_country: 'RU' },
  ],
  number_of_episodes: 5,
  number_of_seasons: 1,
  origin_country: ['RU'],
  original_language: 'ru',
  original_name: 'Бандитский Петербург. Барон',
  overview: 'Absolutely unique storyline, brillian...',
  popularity: 0.2277,
  poster_path: '/gfelnmlZqi3zlLdyybojWwtCEjd.jpg',
  production_companies: [
    {
      id: 19211,
      logo_path: '/pjKrG5IC2BaHdE5OUi4Kpe5DlGH.png',
      name: 'KinoMost',
      origin_country: 'RU',
    },
  ],
  production_countries: [
    { iso_3166_1: 'RU', name: 'Russia' },
  ],
  seasons: [
    {
      air_date: '2000-05-01',
      episode_count: 5,
      id: 550759,
      name: 'Сезон 1',
      overview: '',
      poster_path: '/gfelnmlZqi3zlLdyybojWwtCEjd.jpg',
      season_number: 1,
      vote_average: 0,
    },
  ],
  spoken_languages: [
    { english_name: 'Russian', iso_639_1: 'ru', name: 'Русский' },
  ],
  status: 'Ended',
  tagline: '',
  vote_average: 10,
  vote_count: 1,
};

/** GET /3/movie/550/lists, first 2 lists. */
export const movieLists: MediaLists = {
  id: 550,
  page: 1,
  results: [
    {
      description: 'All of my ratings are the movies that...',
      favorite_count: 0,
      id: 8302254,
      item_count: 2585,
      iso_639_1: 'en',
      iso_3166_1: 'US',
      name: 'Movies That I have watched all',
      poster_path: null,
    },
    {
      description: "Letterboxd's most popular films this...",
      favorite_count: 0,
      id: 8634608,
      item_count: 71,
      iso_639_1: 'en',
      iso_3166_1: 'US',
      name: 'second-hand prominence',
      poster_path: null,
    },
  ],
  total_pages: 147,
  total_results: 2924,
};

/** GET /3/tv/1396/episode_groups. */
export const tvEpisodeGroups: EpisodeGroups = {
  id: 1396,
  results: [
    {
      description: 'Seasons grouped as they appear on DVD...',
      episode_count: 62,
      group_count: 6,
      id: '69f50757054263b7bc87e32a',
      name: 'DVD / PVOD',
      network: null,
      type: 3,
    },
  ],
};

/** GET /3/tv/1396/alternative_titles, first 2. */
export const tvAlternativeTitles: TvAlternativeTitles = {
  id: 1396,
  results: [
    { iso_3166_1: 'AZ', title: 'Bədbəxt', type: '' },
    {
      iso_3166_1: 'BR',
      title: 'Breaking Bad: A Química do Mal',
      type: 'altered title for broadcast on tv cha...',
    },
  ],
};

/** GET /3/movie/550/alternative_titles (empty). */
export const movieAlternativeTitles: MovieAlternativeTitles = { id: 550, titles: [] };

/** GET /3/tv/1396/content_ratings, first 2. */
export const tvContentRatings: ContentRatings = {
  id: 1396,
  results: [
    { descriptors: [], iso_3166_1: 'AT', rating: '16' },
    { descriptors: [], iso_3166_1: 'AU', rating: 'MA 15+' },
  ],
};

/** GET /3/tv/1396/season/1/episode/1/credits. */
export const episodeCredits: EpisodeCredits = {
  id: 62085,
  cast: [],
  crew: [
    {
      department: 'Camera',
      job: 'Director of Photography',
      credit_id: '52b7029219c29533d00dd2c1',
      adult: false,
      gender: 2,
      id: 2483,
      known_for_department: 'Camera',
      name: '约翰·托尔',
      original_name: '约翰·托尔',
      popularity: 1.1957,
      profile_path: '/cfL9A6tC7L5Ps5fq1o3WpVKGMb1.jpg',
    },
  ],
  guest_stars: [
    {
      character: 'Steven Gomez',
      credit_id: '5271b489760ee35b3e0881a7',
      order: 8,
      adult: false,
      gender: 2,
      id: 61535,
      known_for_department: 'Acting',
      name: '史蒂文·迈克尔·奎扎达',
      original_name: '史蒂文·迈克尔·奎扎达',
      popularity: 1.7511,
      profile_path: '/pVYrDkwI6GWvCNL2kJhpDJfBFyd.jpg',
    },
  ],
};

/** GET /3/search/collection?query=matrix. */
export const searchCollection: Paged<CollectionSearchResult> = {
  page: 1,
  results: [
    {
      adult: false,
      backdrop_path: '/u8d00USp8rO6cC0AlegyYSawn4M.jpg',
      id: 2344,
      name: 'The Matrix Collection',
      original_language: 'en',
      original_name: 'The Matrix Collection',
      overview: 'The Matrix collection depicts a compl...',
      poster_path: '/3mMbDltp0phBnJ53E8Zt1JDhIFo.jpg',
    },
  ],
  total_pages: 1,
  total_results: 1,
};

/** GET /omdb/?i=tt0903747, a series (totalSeasons, no DVD or BoxOffice). */
export const omdbSeries: OmdbTitle = {
  Title: 'Breaking Bad',
  Year: '2008\u20132013',
  Rated: 'TV-MA',
  Released: '20 Jan 2008',
  Runtime: '49 min',
  Genre: 'Crime, Drama, Thriller',
  Director: '泰瑞·麦克多诺, 山姆·卡特林, 乔治·马斯切斯',
  Writer: 'Vince Gilligan',
  Actors: 'Bryan Cranston, Aaron Paul, Anna Gunn',
  Plot: 'Walter White is a chemistry genius but works as a chemist...',
  Language: 'English, Spanish',
  Country: 'United States',
  Awards: 'Won 16 Primetime Emmys. 172 wins & 269 nominations total',
  Poster: 'https://img.amodb.dev/t/p/w300/bMSbEx9vXCSGN4NEktjVIEuibn...',
  Ratings: [
    { Source: 'Internet Movie Database', Value: '9.5/10' },
    { Source: 'Rotten Tomatoes', Value: '96%' },
  ],
  Metascore: 'N/A',
  imdbRating: '9.5',
  imdbVotes: '2,671,962',
  imdbID: 'tt0903747',
  Type: 'series',
  totalSeasons: '5',
  Response: 'True',
};

/** GET /omdb/?s=fight, first 2 hits. */
export const omdbSearch: OmdbSearch = {
  Search: [
    {
      Title: 'The Matrix',
      Year: '1999',
      imdbID: 'tt0133093',
      Type: 'movie',
      Poster: 'https://img.amodb.dev/t/p/w300/kEDbym5htJgDQNenjUtSJxAHys...',
    },
    {
      Title: 'The Matrix Reloaded',
      Year: '2003',
      imdbID: 'tt0234215',
      Type: 'movie',
      Poster: 'https://img.amodb.dev/t/p/w300/p4tk45cLirmTSklcrwz4NKTTk9...',
    },
  ],
  totalResults: '23',
  Response: 'True',
};

/** GET /3/movie/550 with the amodb sections appended (the large TMDB sections are removed). */
export const movieAppended: MovieDetails = {
  adult: false,
  backdrop_path: '/b9HyPoxwxjxkWEUL5ErZdhApQe2.jpg',
  belongs_to_collection: null,
  budget: 63000000,
  genres: [
    { id: 18, name: 'Drama' },
  ],
  homepage: 'https://www.20thcenturystudios.com/mo...',
  id: 550,
  imdb_id: 'tt0137523',
  origin_country: ['US'],
  original_language: 'en',
  original_title: 'Fight Club',
  overview: 'A ticking-time-bomb insomniac and a s...',
  popularity: 39.0054,
  poster_path: '/jSziioSwPVrOy9Yow3XhWIBDjq1.jpg',
  production_companies: [
    {
      id: 25,
      logo_path: '/nM2MfoMqzJQRiSynsDabOtFKetD.png',
      name: '20th Century Fox',
      origin_country: 'US',
    },
  ],
  production_countries: [
    { iso_3166_1: 'US', name: 'United States of America' },
  ],
  release_date: '1999-10-15',
  revenue: 101209702,
  runtime: 139,
  spoken_languages: [
    { english_name: 'English', iso_639_1: 'en', name: 'English' },
  ],
  status: 'Released',
  tagline: 'Mischief. Mayhem. Soap.',
  title: 'Fight Club',
  video: false,
  vote_average: 8.437,
  vote_count: 33039,
  external_ids: {
    imdb_id: 'tt0137523',
    wikidata_id: 'Q190050',
    facebook_id: 'FightClub',
    instagram_id: null,
    twitter_id: null,
    kinopoisk_id: '361',
  },
  alternative_titles: { titles: [] },
  lists: {
    page: 1,
    results: [
      {
        description: 'All of my ratings are the movies that...',
        favorite_count: 0,
        id: 8302254,
        item_count: 2585,
        iso_639_1: 'en',
        iso_3166_1: 'US',
        name: 'Movies That I have watched all',
        poster_path: null,
      },
    ],
    total_pages: 147,
    total_results: 2924,
  },
  moods: {
    source: 'estimated',
    results: [
      {
        name: 'action',
        avg: 4,
        values: [3],
      },
    ],
  },
  ratings: {
    imdb: { value: 8.8, votes: 2669989 },
    kinopoisk: { value: 8.7, votes: null },
    metacritic: { value: 67, votes: null },
    rotten_tomatoes: { value: 81, votes: null },
    tmdb: { value: 8.437, votes: 33039 },
  },
  soundtracks: { results: [] },
  wikidata: {
    id: 550,
    wikidata_id: 'Q190050',
    budget: { value: 63000000, currency: 'USD' },
    box_office: { value: 101209702, currency: 'USD', worldwide: true },
    follows: null,
    followed_by: null,
    sitelinks: {
      en: 'Fight Club',
      ru: 'Бойцовский клуб (фильм)',
      uk: 'Бійцівський клуб (фільм)',
      be: 'Байцоўскі клуб (фільм)',
      bg: 'Боен клуб (филм)',
      cs: 'Klub rváčů (film)',
      pl: 'Podziemny krąg (film)',
      ro: 'Fight Club (film)',
      fr: 'Fight Club (film)',
      it: 'Fight Club (film)',
      es: 'Fight Club',
      pt: 'Fight Club',
      he: 'מועדון קרב (סרט)',
      zh: '鬥陣俱樂部',
    },
    awards: [
      { wikidata_id: 'Q28044798', label: 'Empire Awards, UK for best british ac...' },
    ],
    nominations: [
      { wikidata_id: 'Q488645', label: 'Academy Award for Best Sound Editing', year: 2000 },
    ],
    based_on: [
      {
        wikidata_id: 'Q837283',
        label: 'Fight Club',
        author: { wikidata_id: 'Q268181', label: 'Chuck Palahniuk' },
      },
    ],
    filming_locations: [
      { wikidata_id: 'Q65', label: 'Los Angeles' },
    ],
    narrative_locations: [
      { wikidata_id: 'Q65', label: 'Los Angeles' },
    ],
    original_broadcasters: [],
  },
  showtimes: {
    id: 550,
    country: null,
    results: [],
    countries: [
      {
        country: 'RU',
        name: 'Russia',
        venues: 2,
        cities: 1,
        showtimes: 7,
        first_day: '2026-10-18',
        last_day: '2026-10-21',
      },
    ],
  },
};
