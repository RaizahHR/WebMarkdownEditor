"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const context = { window: null };
context.window = context;
vm.createContext(context);

for (const file of [
    "../AppHtml/MarkdownEditor/vendor/marked-18.0.9.umd.js",
    "../AppHtml/MarkdownEditor/DataFlexHighlighter.js",
    "../AppHtml/MarkdownEditor/MarkdownRenderer.js"
]) {
    const filename = path.resolve(__dirname, file);
    vm.runInContext(fs.readFileSync(filename, "utf8"), context, { filename });
}

assert.equal(context.DataFlexHighlighter.supports("dataflex"), true);
assert.equal(context.DataFlexHighlighter.supports("df title=Example"), true);
assert.equal(context.DataFlexHighlighter.supports("flex"), true);
assert.equal(context.DataFlexHighlighter.supports("javascript"), false);

const source = [
    "Use cWebApp.pkg",
    "{ WebProperty=Client }",
    "Procedure Test",
    "    String sQuery",
    "    Move @SQL\"SELECT Name FROM Users WHERE Id = 42\" to sQuery",
    "    /* outer /* nested */ comment */",
    "    // <script>alert('no')</script>",
    "End_Procedure"
].join("\n");
const highlighted = context.DataFlexHighlighter.highlight(source);

assert.match(highlighted, /class="df-keyword">Procedure<\/span>/);
assert.match(highlighted, /class="df-meta-tag">WebProperty<\/span>/);
assert.match(highlighted, /class="df-meta-assignment">=<\/span>/);
assert.match(highlighted, /class="df-keyword">SELECT<\/span>/);
assert.match(highlighted, /class="df-number">42<\/span>/);
assert.match(highlighted, /class="df-comment">\/\* outer \/\* nested \*\/ comment \*\/<\/span>/);
assert.doesNotMatch(highlighted, /<script>/);
assert.match(highlighted, /&lt;script&gt;/);

const rendered = context.WebMarkdown.renderSafe(`\`\`\`dataflex\n${source}\n\`\`\``);
assert.match(rendered, /<code class="language-dataflex">/);
assert.match(rendered, /class="df-keyword"/);
assert.doesNotMatch(rendered, /<script>/);

const plainCode = context.WebMarkdown.renderSafe("```text\n<img src=x onerror=alert(1)>\n```");
assert.match(plainCode, /&lt;img src=x onerror=alert\(1\)&gt;/);
assert.doesNotMatch(plainCode, /<img/);

console.log("PASS");
