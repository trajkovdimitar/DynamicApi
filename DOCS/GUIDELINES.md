# Project Guidelines

## Code Formatting (REQUIRED)
- Run `dotnet format TheBackend.sln` before committing.
- Use Allman brace style with four-space indentation.
- Keep lines under 120 characters.
- CamelCase for properties and methods, PascalCase for classes and interfaces.
- ASP.NET Core warnings (ASP0000) may be ignored if formatting fails; perform manual review.

## Building (REQUIRED)
- Run `dotnet build TheBackend.sln -c Release --no-restore` before pushing any changes.
- Fix all build warnings and errors. CI treats warnings as errors.
- Update deprecated APIs when encountered.

## Testing Before Deploying (REQUIRED)
- Run `dotnet test TheBackend.sln --no-build` and ensure all tests pass.
- Maintain test coverage around 80% using coverlet reports in CI.
- Perform manual end-to-end tests of workflow execution prior to deployment.

## General Rules (REQUIRED)
- Use conventional commit messages and descriptive pull requests.
- Validate inputs for security and profile performance of workflows.
- Keep documentation current with new features.
