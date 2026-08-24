# WebMarkdownEditor

A small DataFlex 26.0 WebApp workspace containing reusable Markdown editor and viewer controls.

## Security model

Both controls accept and synchronize Markdown source. The application must call
the XSS Sanitizer's `SanitizeMarkdown` function before storing and before
returning Markdown to a renderer. `MarkdownRenderer.js` then parses the
sanitized source, escapes raw HTML, suppresses images, and emits only absolute
`http://` and `https://` links. The same client restrictions protect the editor
preview while the user is typing.

The browser renderer is not a replacement for server-side sanitization. Do not
assign untrusted Markdown to `innerHTML` through another renderer, and keep the
server-side policy in place for existing database rows and API responses.

## Using the controls

Load the vendor scripts, shared renderer, controls, and stylesheet from `AppHtml/Index.html`. Then include the server packages:

```dataflex
Use cWebMarkdownEditor.pkg
Use cWebMarkdownViewer.pkg
```

The editor is a normal `cWebBaseDEO`, so it can use `Entry_Item`:

```dataflex
Object oDescription is a cWebMarkdownEditor
    Set piColumnSpan to 12
    Set piEditorHeight to 360
    Set piMaxLength to 100000
    Entry_Item Package.LongDescription
End_Object
```

The viewer receives Markdown source, never HTML:

```dataflex
WebSet psValue of oMarkdownViewer to Package.LongDescription
```

Fenced code blocks tagged `dataflex`, `df`, or `flex` use DataFlex Studio-style
syntax highlighting in both the editor preview and viewer. The dependency-free
browser lexer mirrors the [DataFlex Pygments lexer](https://gitlab.com/data-access-worldwide/projects/data-access-rnd-side-projects/df-docs/-/tree/develop/dataflex-lexer-pkg),
including nested comments, metadata blocks, and SQL embedded in `@SQL` strings.
Highlighted source is HTML-escaped before static token spans are added.

Control surfaces inherit the active DataFlex theme through variables such as
`--df-CtrBackgroundColor`, `--df-CtrTextColor`, `--df-CtrBorderColor`,
`--df-TxtLinkColor`, and `--df-Grayscale6`. DataFlex's `body.df-Dark` values
therefore apply automatically. Language-token colors are exposed separately as
`--markdown-df-*` variables because DataFlex does not define syntax-token colors.

Run `df-cli build WebMarkdownEditor.sws --rebuild` to compile the demo.
