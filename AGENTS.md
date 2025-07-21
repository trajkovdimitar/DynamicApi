# AGENT Instructions

## Code style
- Use four spaces for indentation in C# files.
- Keep line length under 120 characters.

## Validation
- After making changes run:
  1. `dotnet format DynamicModelApi.sln` for automatic code formatting.
  2. `dotnet build DynamicModelApi.sln -c Release` to ensure the solution builds.
  3. `dotnet test DynamicModelApi.sln` even if no tests exist.
- If commands fail due to missing SDK, run `./dotnet-install.sh --channel 9.0 --install-dir $HOME/.dotnet` and add the install directory to `PATH`.

## Pull Request
- Summaries should mention key changes.
- Tests section should include output from build or test commands.
