# Developer Memory

## Build the macOS DMG

From the repository root, run:

```sh
npm run build:mac
```

The command builds the shared types, API, and desktop UI, generates the macOS
icons, then uses Electron Forge to package, sign, and create the DMG under
`apps/desktop/release/make/`.

Local builds use an ad-hoc signature. To use a Developer ID certificate already
installed in the macOS keychain, set `MACOS_SIGN_IDENTITY` to its identity name
before running the build. Public distribution also requires Apple notarization.
