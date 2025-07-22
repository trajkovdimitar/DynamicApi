# Identity Server Integration Plan

## Identity Server Choice
- **OpenIddict**: Free, open source, .NET-based identity server that integrates well with ASP.NET Core. It supports OpenID Connect and OAuth 2.0.

## Tasks
1. **Research & Decision**
   - Confirm OpenIddict meets requirements for enabling/disabling features via AdminUI.
   - Review licensing (Apache 2.0) and compatibility with existing projects.

2. **Project Setup**
   - Add a new `Identity` project or integrate into `TheBackend.Api` following `DOTNET_GUIDELINES.md` structure.
   - Install NuGet packages:
     - `OpenIddict` core packages
     - `Microsoft.AspNetCore.Identity.EntityFrameworkCore`
   - Create DbContext for Identity and configure migrations.

3. **Authentication & Authorization**
   - Configure OpenIddict server services in `Program.cs`.
   - Implement ASP.NET Core Identity for user management.
   - Add JWT bearer authentication to other APIs.

4. **AdminUI Integration**
   - Expose endpoints to enable/disable OpenIddict features (e.g., token lifetimes, flows).
   - Build React components under `AdminUI/src` to manage these settings.

5. **User and Role Management**
   - Create AdminUI pages to create users, assign roles, and manage claims.
   - Add controllers/APIs in the backend for these operations.

6. **Testing**
   - Add unit and integration tests for authentication flows in `TheBackend.Tests`.
   - Ensure build and test commands succeed:
     ```bash
     dotnet format TheBackend.sln
     dotnet build TheBackend.sln -c Release
     dotnet test TheBackend.sln
     ```

7. **Documentation**
   - Update `README.md` with setup instructions for the identity server.
   - Document admin features and how to enable/disable them.

## Done Criteria
- All tests pass and AdminUI can toggle identity features.
- Users can authenticate and authorized endpoints respect roles/claims.
