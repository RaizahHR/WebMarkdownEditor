# WebMarkdownEditor

DataFlex 26.0 Markdown editor and viewer library with a runnable WebApp demo.

## Repository layout

- `Library/` contains the reusable package workspace, DataFlex classes, browser
  assets, tests, and library documentation.
- `Demo/` contains the separate WebApp workspace and its integration files.

The demo references `Library/WebMarkdownEditor-26.0.sws` as a local library;
the reusable browser assets are not duplicated.

See [`Library/README.md`](Library/README.md) for control usage and security
requirements, or [`Demo/README.md`](Demo/README.md) to build the sample app.
