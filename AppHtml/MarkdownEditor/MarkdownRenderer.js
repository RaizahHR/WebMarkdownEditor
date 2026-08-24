(function (global) {
    "use strict";

    if (!global.marked || !global.marked.Marked) {
        throw new Error("WebMarkdown requires marked before MarkdownRenderer.js.");
    }
    function escapeHtml(value) {
        return String(value || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    const parser = new global.marked.Marked({
        async: false,
        gfm: true,
        breaks: false,
        renderer: {
            code(token) {
                const language = String(token.lang || "").trim().split(/\s+/, 1)[0];

                if (global.DataFlexHighlighter?.supports(language)) {
                    return `<pre class="highlight"><code class="language-dataflex">${global.DataFlexHighlighter.highlight(token.text)}</code></pre>\n`;
                }

                return `<pre><code>${escapeHtml(token.text)}</code></pre>\n`;
            },
            html(token) {
                return escapeHtml(token.text);
            },
            image(token) {
                return escapeHtml(token.text);
            },
            link(token) {
                const href = String(token.href || "");
                const text = token.tokens
                    ? this.parser.parseInline(token.tokens)
                    : escapeHtml(token.text || "");

                if (!/^https?:\/\//i.test(href)) {
                    return text;
                }

                const title = token.title ? ` title="${escapeHtml(token.title)}"` : "";
                return `<a href="${escapeHtml(href)}"${title}>${text}</a>`;
            }
        }
    });

    function renderSafe(markdown) {
        // Server code sanitizes stored Markdown. Keep the preview safe for
        // unsaved input as well by escaping raw HTML and emitting only links
        // with an absolute HTTP(S) destination.
        return parser.parse(String(markdown || ""), { async: false });
    }

    global.WebMarkdown = Object.freeze({ renderSafe });
})(window);
