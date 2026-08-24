df.WebMarkdownEditor = class WebMarkdownEditor extends df.WebBaseDEO {
    constructor(sName, oParent) {
        super(sName, oParent);

        this.prop(df.tString, "psPlaceholder", "");
        this.prop(df.tInt, "piEditorHeight", 320);
        this.prop(df.tInt, "peMode", 0);
        this.prop(df.tBool, "pbShowToolbar", true);

        this._sControlClass = "WebMarkdownEditor";
        this._bJSSizing = false;

        this._onInput = this.onInput.bind(this);
        this._onEditorKeyDown = this.onEditorKeyDown.bind(this);
        this._onModeClick = this.onModeClick.bind(this);
        this._onToolbarMouseDown = this.onToolbarMouseDown.bind(this);
        this._onToolbarClick = this.onToolbarClick.bind(this);
    }

    openHtml(aHtml) {
        super.openHtml(aHtml);

        aHtml.push(
            '<div class="WebMarkdownEditor_Wrapper">',
                '<div class="WebMarkdownEditor_Header">',
                    '<div class="WebMarkdownEditor_Tabs" role="tablist" aria-label="Editor mode">',
                        '<button type="button" role="tab" data-mode="0">Write</button>',
                        '<button type="button" role="tab" data-mode="1">Preview</button>',
                    '</div>',
                    '<div class="WebMarkdownEditor_Toolbar" role="toolbar" aria-label="Markdown formatting">',
                        '<button type="button" data-action="strong" aria-label="Bold (Ctrl+B)" title="Bold (Ctrl+B)">B</button>',
                        '<button type="button" data-action="emphasis" aria-label="Italic (Ctrl+I)" title="Italic (Ctrl+I)">I</button>',
                        '<button type="button" data-action="heading" aria-label="Heading 2" title="Heading 2">H2</button>',
                        '<button type="button" data-action="bullet" aria-label="Bulleted list" title="Bulleted list">&bull;</button>',
                        '<button type="button" data-action="code" aria-label="Inline code" title="Inline code">`</button>',
                        '<button type="button" data-action="link" aria-label="Link (Ctrl+K)" title="Link (Ctrl+K)">Link</button>',
                    '</div>',
                '</div>',
                '<div class="WebMarkdownEditor_Body">',
                    '<textarea class="WebMarkdownEditor_Source" name="', df.dom.encodeAttr(this._sName), '"',
                        ' aria-label="Markdown source" spellcheck="true"',
                        (!this.isEnabled() ? ' disabled="disabled" tabindex="-1"' : ''),
                    '></textarea>',
                    '<div class="WebMarkdownEditor_Preview WebMarkdown_Content" role="document" hidden></div>',
                '</div>',
            '</div>'
        );
    }

    afterRender() {
        this._eWrapper = df.dom.query(this._eElem, ".WebMarkdownEditor_Wrapper");
        this._eControl = df.dom.query(this._eElem, ".WebMarkdownEditor_Source");
        this._ePreview = df.dom.query(this._eElem, ".WebMarkdownEditor_Preview");
        this._eToolbar = df.dom.query(this._eElem, ".WebMarkdownEditor_Toolbar");
        this._eTabs = df.dom.query(this._eElem, ".WebMarkdownEditor_Tabs");

        super.afterRender();

        this._eControl.addEventListener("input", this._onInput);
        this._eControl.addEventListener("keydown", this._onEditorKeyDown);
        this._eTabs.addEventListener("click", this._onModeClick);
        this._eToolbar.addEventListener("mousedown", this._onToolbarMouseDown);
        this._eToolbar.addEventListener("click", this._onToolbarClick);

        this.set_psPlaceholder(this.psPlaceholder);
        this.set_piEditorHeight(this.piEditorHeight);
        this.set_piMaxLength(this.piMaxLength);
        this.set_pbShowToolbar(this.pbShowToolbar);
        this.set_peMode(this.peMode);
    }

    destroy() {
        this._eControl?.removeEventListener("input", this._onInput);
        this._eControl?.removeEventListener("keydown", this._onEditorKeyDown);
        this._eTabs?.removeEventListener("click", this._onModeClick);
        this._eToolbar?.removeEventListener("mousedown", this._onToolbarMouseDown);
        this._eToolbar?.removeEventListener("click", this._onToolbarClick);
        super.destroy();
    }

    set_psValue(value) {
        super.set_psValue(value);
        if (this.peMode === 1) {
            this.renderPreview();
        }
    }

    set_psPlaceholder(value) {
        this.psPlaceholder = value || "";
        if (this._eControl) {
            this._eControl.placeholder = this.psPlaceholder;
        }
    }

    set_piEditorHeight(value) {
        this.piEditorHeight = Math.max(120, Number(value) || 320);
        if (this._eWrapper) {
            this._eWrapper.style.setProperty("--markdown-editor-height", `${this.piEditorHeight}px`);
        }
    }

    set_piMaxLength(value) {
        this.piMaxLength = Math.max(0, Number(value) || 0);
        if (this._eControl) {
            if (this.piMaxLength > 0) {
                this._eControl.maxLength = this.piMaxLength;
            } else {
                this._eControl.removeAttribute("maxlength");
            }
        }
    }

    set_pbShowToolbar(value) {
        this.pbShowToolbar = Boolean(value);
        if (this._eToolbar) {
            this._eToolbar.hidden = !this.pbShowToolbar || this.peMode !== 0;
        }
    }

    set_peMode(value) {
        this.peMode = Number(value) === 1 ? 1 : 0;
        this.applyMode();
    }

    applyEnabled(value) {
        super.applyEnabled(value);
        this._eToolbar?.querySelectorAll("button").forEach((button) => {
            button.disabled = !value;
        });
    }

    applyMode() {
        if (!this._eControl || !this._ePreview || !this._eTabs) {
            return;
        }

        const preview = this.peMode === 1;
        this._eControl.hidden = preview;
        this._ePreview.hidden = !preview;
        this._eToolbar.hidden = !this.pbShowToolbar || preview;

        this._eTabs.querySelectorAll("button[data-mode]").forEach((button) => {
            const selected = Number(button.dataset.mode) === this.peMode;
            button.setAttribute("aria-selected", selected ? "true" : "false");
            button.tabIndex = selected ? 0 : -1;
        });

        if (preview) {
            this.renderPreview();
        }
    }

    renderPreview() {
        if (this._ePreview) {
            // WebMarkdown.renderSafe is the only permitted HTML-producing boundary.
            this._ePreview.innerHTML = window.WebMarkdown.renderSafe(this.getControlValue());
        }
    }

    onInput() {
        if (this.peMode === 1) {
            this.renderPreview();
        }
    }

    onModeClick(event) {
        const button = event.target.closest("button[data-mode]");
        if (button) {
            this.set_peMode(Number(button.dataset.mode));
        }
    }

    onToolbarMouseDown(event) {
        const button = event.target.closest("button[data-action]");
        if (button && this._eToolbar.contains(button)) {
            // Keep the textarea selection available for formatting commands.
            event.preventDefault();
        }
    }

    onToolbarClick(event) {
        const button = event.target.closest("button[data-action]");
        if (button && this._eToolbar.contains(button) && !button.disabled) {
            this.formatSelection(button.dataset.action);
        }
    }

    onEditorKeyDown(event) {
        if (!(event.ctrlKey || event.metaKey) || event.altKey) {
            return;
        }

        const action = {
            b: "strong",
            i: "emphasis",
            k: "link"
        }[event.key.toLowerCase()];

        if (action) {
            event.preventDefault();
            this.formatSelection(action);
        }
    }

    formatSelection(action) {
        const source = this._eControl;
        const start = source.selectionStart;
        const end = source.selectionEnd;
        const selected = source.value.slice(start, end);
        let replacement;
        let selectionStart;
        let selectionEnd;

        switch (action) {
            case "strong":
                replacement = `**${selected || "bold text"}**`;
                selectionStart = start + 2;
                selectionEnd = selectionStart + (selected || "bold text").length;
                break;
            case "emphasis":
                replacement = `*${selected || "italic text"}*`;
                selectionStart = start + 1;
                selectionEnd = selectionStart + (selected || "italic text").length;
                break;
            case "code":
                replacement = `\`${selected || "code"}\``;
                selectionStart = start + 1;
                selectionEnd = selectionStart + (selected || "code").length;
                break;
            case "link":
                replacement = `[${selected || "link text"}](https://)`;
                selectionStart = start + 1;
                selectionEnd = selectionStart + (selected || "link text").length;
                break;
            case "heading":
                return this.prefixSelectedLines("## ");
            case "bullet":
                return this.prefixSelectedLines("- ");
            default:
                return;
        }

        if (this.piMaxLength > 0 && source.value.length - (end - start) + replacement.length > this.piMaxLength) {
            return;
        }

        source.setRangeText(replacement, start, end, "end");
        source.setSelectionRange(selectionStart, selectionEnd);
        this.commitSourceChange(selectionStart, selectionEnd);
    }

    prefixSelectedLines(prefix) {
        const source = this._eControl;
        const start = source.value.lastIndexOf("\n", source.selectionStart - 1) + 1;
        const endOfSelection = source.selectionEnd;
        const end = source.value.indexOf("\n", endOfSelection);
        const rangeEnd = end === -1 ? source.value.length : end;
        const selectedLines = source.value.slice(start, rangeEnd);
        const replacement = prefix + selectedLines.replaceAll("\n", `\n${prefix}`);

        if (this.piMaxLength > 0 && source.value.length - (rangeEnd - start) + replacement.length > this.piMaxLength) {
            return;
        }

        source.setRangeText(replacement, start, rangeEnd, "end");
        this.commitSourceChange(start, start + replacement.length);
    }

    commitSourceChange(selectionStart, selectionEnd) {
        const source = this._eControl;

        source.dispatchEvent(new Event("input", { bubbles: true }));
        source.dispatchEvent(new Event("change", { bubbles: true }));
        source.focus();
        source.setSelectionRange(selectionStart, selectionEnd);
    }
};
