# Changelog

All notable changes to this project are listed here. The format follows Keep a Changelog.

## Unreleased

Align extension types with the live API.

- `Moods` now has `source` (`'measured'`, `'estimated'` or `null`) and `results` of `{ name, avg, values }` on a 0 to 10 scale.
- `Soundtracks` has `results` of albums with `tracks`. `Ratings` documents the scales and the `{ value, votes }` or `null` shape of each provider.
- `Wikidata` has typed money (`value` and `currency`), `follows`, `followed_by`, `awards`, `nominations`, `based_on` with `author`, locations, broadcasters and `sitelinks`.
- `Showtimes` is typed. `country` is now optional in `movies.showtimes`. Without it the reply lists per-country counts in `countries`. With it, `results` holds venues with `showtimes`.
- Added `tv.showtimes`, `movies.latest`, `tv.latest`, `movies.lists`, `tv.lists`, `tv.episodeGroups`, `tv.seasonCredits`, `tv.episodeCredits` and `keywords.movies`.
- `find` accepts all 12 external sources, including `kinopoisk_id` and `wikidata_id`. `FindResults` items carry `media_type`.
- External ids are typed per kind (`MovieExternalIds`, `TvExternalIds`, `PersonExternalIds`) and include `kinopoisk_id`.
- `appendToResponse` is typed per resource and lists only sections the API serves. Movie and TV details take a `country` option for the appended `showtimes`.
- Removed `tv.aggregateCredits`, `AggregateCredits`, the `aggregate_credits` and `changes` append values, the open string fallback for append values, the `type` field of TV details, the `country` option of `movies.alternativeTitles`, the `includeAdult` options and the OMDb `episode` type. The API does not offer them or ignores them.
- README examples use the real field names and describe the paths that are not offered.
- Tests use real trimmed response bodies and cover the new types and methods.
- Add CI, release and Dependabot workflows.
- Repository and package URLs now point to the AmoDataBase organization.

## 0.1.0 - 2026-10-18

Initial release.
