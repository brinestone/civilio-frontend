# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [4.0.4](https://github.com/brinestone/civilio-frontend/compare/v4.0.3...v4.0.4) (2025-12-04)


### Bug Fixes

* **forge:** add squirrel maker to bypass MSI permission issues ([7eca216](https://github.com/brinestone/civilio-frontend/commit/7eca2167081653fb077bec23a472d400b2613d89))

### [4.0.3](https://github.com/brinestone/civilio-frontend/compare/v4.0.1...v4.0.3) (2025-12-01)


### Bug Fixes

* **ci:** mismatching executableName ([22937e2](https://github.com/brinestone/civilio-frontend/commit/22937e20b8c77ecd299aee90423ce09ced231ca0))
* **ci:** revert to makerzip for macos ([7c00e1f](https://github.com/brinestone/civilio-frontend/commit/7c00e1fcc09fff5b148c7b86ba5e68e0e4535459))

### [4.0.1](https://github.com/brinestone/civilio-frontend/compare/v4.0.0...v4.0.1) (2025-12-01)


### Bug Fixes

* **ci:** add dmg maker to forge config ([5211fcd](https://github.com/brinestone/civilio-frontend/commit/5211fcd5b058e28bf29584dc9cb75e250f0a5287))

## [4.0.0](https://github.com/brinestone/civilio-frontend/compare/v3.0.5...v4.0.0) (2025-12-01)


### ⚠ BREAKING CHANGES

* **db:** updated database schema for data versioning (#30)

### Features

* add auto translator script ([c0914b5](https://github.com/brinestone/civilio-frontend/commit/c0914b515e1d1e986f940639709ec1086a7fe7a5))
* add validation handling and improve form state management ([6680abe](https://github.com/brinestone/civilio-frontend/commit/6680abe84c0c9bc67385754a3496a54d8dae2284))
* add versioning info to submissions view ([82042f6](https://github.com/brinestone/civilio-frontend/commit/82042f62eb1660085c0ecea7fba5d964b2cd23c2))
* add versioning info to submissions view ([e34b4b7](https://github.com/brinestone/civilio-frontend/commit/e34b4b7b7200eb357f5597cc48545cbf3bf1e7ea))
* **db:** updated database schema for data versioning ([#30](https://github.com/brinestone/civilio-frontend/issues/30)) ([6c0a468](https://github.com/brinestone/civilio-frontend/commit/6c0a4685ec0da2ca7dacad187b9de59884667b0b))
* enhance form handling with dynamic field rendering and validation extraction ([d8b3ad7](https://github.com/brinestone/civilio-frontend/commit/d8b3ad700e2521d43c96b83f75583e73bc74ce71))
* enhance submissions page with translation support and locale handling ([35f4cfe](https://github.com/brinestone/civilio-frontend/commit/35f4cfebd200154b040c6d1e3019abc020a0db68))
* **field-mapping:** add cached alias column to prevent query alias trimming ([#27](https://github.com/brinestone/civilio-frontend/issues/27)) ([5505ad8](https://github.com/brinestone/civilio-frontend/commit/5505ad8aa07fab5a1b57adc56fbcbd93cbb0b783))
* **form-footer:** add history tab and update translation keys ([#29](https://github.com/brinestone/civilio-frontend/issues/29)) ([e1bfb91](https://github.com/brinestone/civilio-frontend/commit/e1bfb914c36fee8cd6580a417af28720490e1512))
* **form-footer:** implement base design ([7354e06](https://github.com/brinestone/civilio-frontend/commit/7354e06fbe44e294468a14b9152a2ce06cc61e02))
* **form-footer:** implement errors tab ([#25](https://github.com/brinestone/civilio-frontend/issues/25)) ([75ccd45](https://github.com/brinestone/civilio-frontend/commit/75ccd45e67936f7f7b0d2b178f83a6011b7a9be2))
* **form-page:** add version selector control ([99abb32](https://github.com/brinestone/civilio-frontend/commit/99abb325d14206cf6450464e68c1ae54076b915d))
* **form-page:** implement handling of has-changes-guard request ([647eeee](https://github.com/brinestone/civilio-frontend/commit/647eeee286c42674090793fe0e1cc8a5bcf1b35f))
* **form-page:** implement initial submission versioning ([8a2f9d9](https://github.com/brinestone/civilio-frontend/commit/8a2f9d96444449c37a8fb31f7553025663723962))
* **form-page:** optimized renering ([9739869](https://github.com/brinestone/civilio-frontend/commit/973986926b52d34940eb8e4c48ad785e5ddaa3ce))
* **form-page:** place facility name in form header component ([1df05c1](https://github.com/brinestone/civilio-frontend/commit/1df05c19e02b9eac58ed993446aca2caeb85470f))
* **forms:** implement change undo/redo ([f09f5d7](https://github.com/brinestone/civilio-frontend/commit/f09f5d7d0eeebd797d659700f5de09d9eeb53506))
* **forms:** implement chefferie model ([fea4e6f](https://github.com/brinestone/civilio-frontend/commit/fea4e6fd32423bdf6df882da2b6a03352ea5655a))
* **forms:** implement data persistence ([1ec0eba](https://github.com/brinestone/civilio-frontend/commit/1ec0ebabf8885061d8139258b2dacd31611b45da))
* **forms:** implement group field component ([cfa34d4](https://github.com/brinestone/civilio-frontend/commit/cfa34d4cffbb05269fa8b98e6d7e49d8a663c316))
* **forms:** implement new tabular-field component ([e587d4c](https://github.com/brinestone/civilio-frontend/commit/e587d4cc21e0f9523429bdd1c9b9a8221978df54))
* **forms:** implements version data retrieval ([98accac](https://github.com/brinestone/civilio-frontend/commit/98accac9b9289de2f0da46c649645523ad2be995))
* refactor form and section page components ([f404107](https://github.com/brinestone/civilio-frontend/commit/f40410712adbea52ede644d72ffa2b590e4a3d16))
* Refactor form handling and remove unused components ([bc45c73](https://github.com/brinestone/civilio-frontend/commit/bc45c73ded6fa9a41039f5072e6456ed57fd6a3d))
* **submissions:** add versioning columns ([a56a8a4](https://github.com/brinestone/civilio-frontend/commit/a56a8a4ebb2374b589b8da1718ae9079322b0d92))
* **submissions:** add versioning columns ([#31](https://github.com/brinestone/civilio-frontend/issues/31)) ([6b590c8](https://github.com/brinestone/civilio-frontend/commit/6b590c81b2657485668fceef77c11134ee8d10a4))


### Bug Fixes

* optimize get_version_data ([c9629e2](https://github.com/brinestone/civilio-frontend/commit/c9629e227ea827ade279874c314e0c81975a264c))
* resolve sync issues with updated mappings ([08f373b](https://github.com/brinestone/civilio-frontend/commit/08f373bd6951a38d9258701eb697a73afb2d53a7))
* **section-page:** refactor section key handling and improve control refresh logic ([#28](https://github.com/brinestone/civilio-frontend/issues/28)) ([5f02669](https://github.com/brinestone/civilio-frontend/commit/5f026695d77ceb0cdb2d9e2958c219e646573f24))

### [3.0.5](https://github.com/brinestone/civilio-frontend/compare/v3.0.4...v3.0.5) (2025-10-12)

### [3.0.4](https://github.com/brinestone/civilio-frontend/compare/v3.0.3...v3.0.4) (2025-10-12)


### Bug Fixes

* **ci:** correct platform for linux to ubuntu-latest ([6f617d0](https://github.com/brinestone/civilio-frontend/commit/6f617d097d5fa44f5345acbfcb9693a8ce68991b))

### [3.0.3](https://github.com/brinestone/civilio-frontend/compare/v3.0.2...v3.0.3) (2025-10-12)


### Bug Fixes

* **ci:** add write permissions for release ([9f45d07](https://github.com/brinestone/civilio-frontend/commit/9f45d075a6057a8e49bbf4878e8eb8e043e3a7e3))

### [3.0.2](https://github.com/brinestone/civilio-frontend/compare/v3.0.1...v3.0.2) (2025-10-12)

### [3.0.1](https://github.com/brinestone/civilio-frontend/compare/v3.0.0...v3.0.1) (2025-10-12)


### Bug Fixes

* update release cache action vertion to v4 ([9fe1b73](https://github.com/brinestone/civilio-frontend/commit/9fe1b736b2fadcd56f0673f454fef00357ca45cc))

## [3.0.0](https://github.com/brinestone/civilio-frontend/compare/v2.1.0...v3.0.0) (2025-10-12)


### Features

* add theme update functionality and implement tabular field component ([772d19b](https://github.com/brinestone/civilio-frontend/commit/772d19b9c9a313c0adec84bf02330dae966e7378))
* **db-config:** persistence of db config ([814a931](https://github.com/brinestone/civilio-frontend/commit/814a931c497aa37cd91e8d8fb4d216c592345898))
* enhance form validation and translation loading mechanisms ([007668c](https://github.com/brinestone/civilio-frontend/commit/007668cc0fb7dacaaf8ea44056a723e457fb70e4))
* enhance geo-point component with online status indication and refactor form layout for improved field mapping ([ec6e9fa](https://github.com/brinestone/civilio-frontend/commit/ec6e9fa1e20bdc562bb98ade5c44192be0a96407))
* **field-mapping:** enhance field mapping functionality with new schemas and update handlers ([26157dd](https://github.com/brinestone/civilio-frontend/commit/26157dd132f5927e15193036d0058eddb805f8c4))
* **form:** implement SetFormType action and update lastFocusedFormType in state ([afc8e1c](https://github.com/brinestone/civilio-frontend/commit/afc8e1c8eafbe62966e3f3d1babf61fce2f173b7))
* **forms:** implement complete crud actions ([5a42e7f](https://github.com/brinestone/civilio-frontend/commit/5a42e7fe3163eb431ee5f898f92d5bf7362e6964))
* **forms:** implement fosa form page ([fb1cf31](https://github.com/brinestone/civilio-frontend/commit/fb1cf3178dda0b06bce30294534c490616146dc8))
* **forms:** implement tabular field ([c675242](https://github.com/brinestone/civilio-frontend/commit/c67524217d6c9107ae2b4620ec87fdf7205ae507))
* **general settings:** implement user preference persistence ([647dc54](https://github.com/brinestone/civilio-frontend/commit/647dc5417c1fc6720da098633117a93ce1d76962))
* integrate Leaflet for geo-point component and enhance form validation messages ([7060d60](https://github.com/brinestone/civilio-frontend/commit/7060d60727084913a4200f617c2284f5604edf33))
* Refactor form handling and configuration services ([dbf0371](https://github.com/brinestone/civilio-frontend/commit/dbf037103e3c8bd5dd79a1ddc542774f02125928))
* remove Fosa form page and related components ([17c6e2a](https://github.com/brinestone/civilio-frontend/commit/17c6e2a6bf2a4480941bb0ce9c054def293aa4d9))
* **routes:** restructure form and settings routes for better organization and lazy loading ([c698a05](https://github.com/brinestone/civilio-frontend/commit/c698a059277a3d2879ea1ea311140f820d383810))
* **submissions:** add filtering and pagination to submissions table ([f746bc4](https://github.com/brinestone/civilio-frontend/commit/f746bc4c1c21e3550f4f01a2d174fdc80f8ecc1d))
* **tabular-field:** enhance tabular field component with change tracking, add new row functionality, and implement commit/discard actions ([b88f2e8](https://github.com/brinestone/civilio-frontend/commit/b88f2e8c8480c4fb09d9723ad136b9b96412881a))
* **tabular-field:** implement change tracking in table ([9f7f0fd](https://github.com/brinestone/civilio-frontend/commit/9f7f0fd836c98a544063140272b8c11c206a8a2b))


### Bug Fixes

* **electron:** fix build issues ([0eb0cf7](https://github.com/brinestone/civilio-frontend/commit/0eb0cf7c4ce6f5323b9d75bfdd70fafd990b3f8c))
* update paths and configurations for asset handling and entry points ([cd3b70a](https://github.com/brinestone/civilio-frontend/commit/cd3b70a7ea16fe16412e759a12ffa3c50ad5d957))
