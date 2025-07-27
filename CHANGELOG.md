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

## [0.4.0] - 2025-07-27
### Added
- Generic Elsa workflow executor to run workflow definitions from steps.

## [0.5.0] - 2025-07-26
### Added
- Conditional step evaluation using Roslyn scripting.
- Error handling policies with retry and skip support.

## [0.6.0] - 2025-07-27
### Added
- React-based workflow editor using React Flow and React Query.
- Admin UI no longer loads Blazor designer script.

## [0.7.0] - 2025-07-27
### Added
- Elsa Workflow Studio page using the <elsa-studio-dashboard> web component.

## [0.8.0] - 2025-07-28
### Removed
- Elsa workflow engine packages, executors, and frontend integrations.
### Added
- Documentation with strict development guidelines.

## [0.9.0] - 2025-07-29
### Added
- Workflows now execute after entity updates and deletions.

## [0.10.0] - 2025-07-30
### Added
- Workflow editor UI supports creating and editing workflow definitions.

## [0.11.0] - 2025-07-31
### Added
- Search box for filtering workflows.
- Default step added when creating new workflows.
- Unsaved change detection with cancel confirmation.
- Reset button restores original workflow state.
- Step duplication, reordering, and collapsing controls.
- Button to copy workflow JSON to clipboard.
- Toast notifications for save success or failure.
- Improved error handling when saving workflows.

## [0.12.0] - 2025-07-31
### Added
- Step descriptions and default parameters when selecting a step type.
- Model dropdown for entity-related steps clarifies which entity is created.
- Placeholder text on workflow name and other fields.
- Warning banner for unsaved changes.
- Confirmation prompts when deleting steps or variables.
- `Mappings` parameter edited via multiline text area.
- Message shown when no steps exist.
- Step headers display the step type.
