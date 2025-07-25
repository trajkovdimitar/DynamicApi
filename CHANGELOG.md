# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-07-21
### Added
- Initial dynamic API with runtime model compilation.
- Generic CRUD controller for generated entities.
- Business rule evaluation via `BusinessRuleService`.

### Changed
- Nothing.

### Fixed
- Nothing.

## [0.2.0] - 2025-07-25
### Added
- Workflow definitions persisted to database via `WorkflowHistoryService`.
- Change log entries stored when workflows are saved.
### Changed
- `WorkflowService` now loads and saves workflows from the database in addition to JSON.

## [0.3.0] - 2025-07-26
### Added
- Workflow versioning with ability to rollback definitions.
### Changed
- Admin UI displays version and supports rollback.
