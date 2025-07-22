These guidelines provide a standardized framework for initiating and maintaining .NET projects, with a focus on microservices architectures as outlined in Microsoft's ".NET Microservices: Architecture for Containerized .NET Applications" (v7.0). They ensure consistency, scalability, security, and maintainability across teams. All developers must adhere to these rules—no deviations are permitted without explicit approval from the lead architect via a documented pull request (PR) discussion. Enforcement will be achieved through code reviews, automated linters, CI/CD pipelines, and static analysis tools.

Current .NET Version (as of July 21, 2025): Target .NET 9.0 (latest stable release) for new projects, falling back to .NET 8.0 LTS for long-term support needs. Use .NET SDK 9.0.x for development.

1. Project Initiation and Setup
1.1 Solution Structure
Create a new solution using `dotnet new sln` or Visual Studio/VS Code templates.
Organize projects logically:
- Domain: Core business logic (entities, value objects, aggregates, domain events). No external dependencies.
- Application: Use cases, commands/queries (e.g., via MediatR), interfaces for repositories/services.
- Infrastructure: Implementations (e.g., EF Core repositories, external integrations). Use dependency injection (DI).
- API/Web: Entry points (Minimal APIs or controllers). Separate for each microservice.
- Tests: Unit/Integration/Functional tests per layer.
For microservices: One solution per bounded context; use multi-project solutions only for related services.
Avoid monolithic structures; prefer modular monoliths initially if microservices are overkill.

1.2 Tools and Dependencies
- IDE/Editor: Visual Studio 2022+ or VS Code with .NET extensions.
- Package Management: Use NuGet; pin versions in `*.csproj` files.
- Essential Packages:
  - ASP.NET Core: `Microsoft.AspNetCore.App`.
  - EF Core: `Microsoft.EntityFrameworkCore.SqlServer` (or polyglot: Cosmos DB, MongoDB).
  - MediatR for CQRS.
  - Polly for resilience.
  - Swashbuckle.AspNetCore for Swagger/OpenAPI.
- Avoid overusing AutoMapper/MediatR; map manually for simplicity.
- Containerization: Add Dockerfile (multi-stage: SDK for build, runtime for deploy). Use `docker-compose.yml` for multi-container setups.

1.3 Configuration
- Use `appsettings.json` with environment overrides (e.g., `appsettings.Development.json`).
- Secrets: Store in User Secrets during dev; use Azure Key Vault in production.
- Environment Variables: For sensitive data like connection strings.

Enforcement
- Use `.editorconfig` for code style enforcement.
- Run `dotnet format` in CI pipelines.

2. Coding Standards
Follow Microsoft's official C# coding conventions, customized for our projects. All code must be readable, maintainable, and adhere to SOLID principles.

2.1 Naming Conventions
- Classes/Interfaces: PascalCase (e.g., `OrderService`, `IOrderRepository`).
- Methods/Properties: PascalCase (e.g., `GetOrderAsync`).
- Variables/Parameters: camelCase (e.g., `orderId`).
- Constants: UPPER_CASE.
- Private Fields: `_camelCase` (e.g., `_orderRepository`).
- Avoid abbreviations; use descriptive names (e.g., `CalculateTotalPrice` not `CalcTot`).

2.2 Style and Formatting
- Indentation: 4 spaces (no tabs).
- Braces: On new line (Allman style).
- Null Checks: Use null-conditional operators (`?.`) and null-coalescing (`??`).
- Async/Await: All I/O-bound methods must be async; use `Task` returns.
- Logging: Use `ILogger`; log at appropriate levels (Info for normal ops, Error for exceptions).
- Error Handling: Use try-catch sparingly; prefer Polly for retries/circuit breakers in microservices.

2.3 Architectural Patterns
- DDD: Define bounded contexts; use entities/value objects/aggregates. Domain events for cross-aggregate communication.
- CQRS: Separate commands (writes) and queries (reads); use Dapper for queries.
- Microservices-Specific:
  - Data Sovereignty: One DB per service.
  - API: RESTful endpoints; version via URI (e.g., `/api/v1/orders`).
  - Communication: HTTP for sync, Event Bus (RabbitMQ/Azure Service Bus) for async.
  - Resilience: Implement health checks, retries, circuit breakers.
- Avoid tight coupling; prefer API Gateway (Ocelot) for client-facing aggregation.

- Authentication: JWT with IdentityServer, OpenIddict, or Azure AD.
- Open-source identity servers (e.g., OpenIddict) may be configured via the AdminUI to enable or disable features.
- Authorization: Policy-based; use `[Authorize]` attributes.
- Input Validation: FluentValidation for commands.
- Secrets: Never hardcode; use configuration providers.

Enforcement
- Linters: StyleCop Analyzers in projects.
- Code Analysis: Enable `dotnet analyze` in CI; treat warnings as errors.

3. Version Control with Git
- Repository Setup: Use Git; initialize with `.gitignore` for .NET.
- Branching Strategy: GitFlow or GitHub Flow.
  - `main`: Production-ready.
  - `develop`: Integration branch.
  - Feature branches: `feature/[issue-id]-description`.
  - Bugfix: `bugfix/[issue-id]-description`.
- Commits: Use Conventional Commits (e.g., `feat: add order endpoint`).
- PRs: Required for all changes; include description, tests, and link to issues. Minimum 1 reviewer approval.
- Tags: Semantic Versioning (SemVer) for releases.

Enforcement
- Use GitHub/Azure DevOps; configure branch protection (require PRs, status checks).

4. Testing Practices
- All code must have ≥80% coverage; no PRs without tests.
- Types:
  - Unit: xUnit/Moq for isolated tests (domain/application layers).
  - Integration: Test against real DB/containers (e.g., TestContainers for Docker).
  - Functional/End-to-End: Cover API flows.
- TDD/BDD: Write tests first where possible.
- Mocks: Use for external dependencies.
- CI Integration: Run tests in pipelines; fail on coverage drops.

Enforcement
- Use `coverlet.msbuild` for coverage reports in CI.

5. Documentation
- Project-Level: `README.md` with setup instructions, architecture diagram, build/deploy steps.
- API: Swagger/OpenAPI; auto-generate docs.
- Code: XML comments for public members; use `<summary>` tags.
- Wiki/Confluence: For architecture decisions, ADRs.
- Changelogs: Maintain `CHANGELOG.md` with SemVer.

Enforcement
- Require docs in PR templates.

6. Build, Deployment, and CI/CD
- Build: Use `dotnet build/publish`; multi-stage Dockerfiles.
- Deployment:
  - Dev: Local Docker Compose.
  - Prod: Kubernetes/AKS for microservices; Azure App Service for simpler apps.
- CI/CD: GitHub Actions or Azure Pipelines.
  - Triggers: On push/PR.
  - Steps: Build, Test, Scan (SonarQube), Deploy.
- Monitoring: Use Application Insights for logs/metrics.

Enforcement
- Pipeline as Code; no manual deploys.

7. Review and Onboarding
- Code Reviews: Mandatory; focus on adherence to guidelines.
- Onboarding: New devs must read/review these guidelines; complete a sample task.
- Audits: Quarterly reviews for compliance.

These guidelines draw from Microsoft's best practices and evolve with .NET advancements. Report issues via the project's issue tracker.
