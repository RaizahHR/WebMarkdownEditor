df.WebMarkdownViewer = class WebMarkdownViewer extends df.WebBaseControl {
    constructor(sName, oParent) {
        super(sName, oParent);

        this.prop(df.tString, "psValue", "");
        this.prop(df.tInt, "piViewerHeight", 240);

        this._sControlClass = "WebMarkdownViewer";
        this._bJSSizing = false;
    }

    openHtml(aHtml) {
        super.openHtml(aHtml);
        aHtml.push('<div class="WebMarkdownViewer_Content WebMarkdown_Content" role="document"></div>');
    }

    afterRender() {
        this._eControl = df.dom.query(this._eElem, ".WebMarkdownViewer_Content");
        super.afterRender();
        this.set_piViewerHeight(this.piViewerHeight);
        this.renderMarkdown();
    }

    set_psValue(value) {
        this.psValue = value || "";
        this.renderMarkdown();
    }

    set_piViewerHeight(value) {
        this.piViewerHeight = Math.max(80, Number(value) || 240);
        if (this._eControl) {
            this._eControl.style.minHeight = `${this.piViewerHeight}px`;
        }
    }

    renderMarkdown() {
        if (this._eControl) {
            // WebMarkdown.renderSafe is the only permitted HTML-producing boundary.
            this._eControl.innerHTML = window.WebMarkdown.renderSafe(this.psValue);
        }
    }
};
