// Modal de búsqueda e inserción de pesukim.
import { App, Editor, Modal } from "obsidian";
import { formatRefLabel, parseRef } from "./refparse";
import { getVerses } from "./corpus";
import { searchText, SearchHit } from "./search";
import { formatHebrew } from "./hebrew";
import { currentLang, t } from "./i18n";
import type { PasukSettings } from "./main";

interface ResultItem {
	label: string; // ej. "Génesis 1:1"
	verses: string[]; // texto original
	preview: string; // primera línea para mostrar
}

export class PasukModal extends Modal {
	private editor: Editor;
	private settings: PasukSettings;
	private inputEl: HTMLInputElement;
	private resultsEl: HTMLElement;
	private hintEl: HTMLElement;
	private items: ResultItem[] = [];
	private selected = 0;
	private debounce: number | null = null;
	private searchSeq = 0;

	constructor(app: App, editor: Editor, settings: PasukSettings) {
		super(app);
		this.editor = editor;
		this.settings = settings;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.addClass("pasuk-modal");
		this.titleEl.setText(t("modalTitle"));

		this.inputEl = contentEl.createEl("input", {
			type: "text",
			placeholder: t("searchPlaceholder"),
			cls: "pasuk-input",
		});
		this.hintEl = contentEl.createDiv({ cls: "pasuk-hint", text: t("hint") });
		this.resultsEl = contentEl.createDiv({ cls: "pasuk-results" });

		this.inputEl.addEventListener("input", () => {
			if (this.debounce) window.clearTimeout(this.debounce);
			this.debounce = window.setTimeout(() => void this.runSearch(), 250);
		});
		this.inputEl.addEventListener("keydown", (evt) => {
			if (evt.key === "ArrowDown") {
				evt.preventDefault();
				this.select(this.selected + 1);
			} else if (evt.key === "ArrowUp") {
				evt.preventDefault();
				this.select(this.selected - 1);
			} else if (evt.key === "Enter") {
				evt.preventDefault();
				this.insertSelected();
			} else if (evt.key === "Escape") {
				this.close();
			}
		});
		this.inputEl.focus();
	}

	onClose() {
		this.contentEl.empty();
	}

	private async runSearch() {
		const q = this.inputEl.value.trim();
		const seq = ++this.searchSeq;
		this.items = [];
		this.selected = 0;
		if (!q) {
			this.render();
			return;
		}

		// 1) ¿Es una referencia?
		const ref = parseRef(q);
		if (ref) {
			const verses = await getVerses(ref.book.key, ref.chapter, ref.verseStart, ref.verseEnd);
			if (seq !== this.searchSeq) return;
			if (verses) {
				this.items = [
					{
						label: formatRefLabel(ref, currentLang()),
						verses,
						preview: verses[0],
					},
				];
			}
			this.render();
			return;
		}

		// 2) Búsqueda de texto (hebreo o transliteración)
		this.resultsEl.setText(t("searching"));
		const hits = await searchText(q, this.settings.maxResults);
		if (seq !== this.searchSeq) return;
		const lang = currentLang();
		this.items = hits.map((h: SearchHit) => ({
			label: `${lang === "es" ? h.book.es : h.book.en} ${h.chapter}:${h.verse}`,
			verses: [h.text],
			preview: h.text,
		}));
		this.render();
	}

	private render() {
		this.resultsEl.empty();
		if (!this.items.length) {
			if (this.inputEl.value.trim()) {
				this.resultsEl.createDiv({ cls: "pasuk-empty", text: t("noResults") });
			}
			return;
		}
		this.items.forEach((item, i) => {
			const el = this.resultsEl.createDiv({
				cls: "pasuk-result" + (i === this.selected ? " is-selected" : ""),
			});
			el.createDiv({ cls: "pasuk-result-ref", text: item.label });
			el.createDiv({
				cls: "pasuk-result-text",
				text: formatHebrew(item.preview, {
					nikud: this.settings.includeNikud,
					teamim: this.settings.includeTeamim,
				}),
			});
			el.addEventListener("click", () => {
				this.selected = i;
				this.insertSelected();
			});
			el.addEventListener("mousemove", () => this.select(i));
		});
	}

	private select(i: number) {
		if (!this.items.length) return;
		this.selected = Math.max(0, Math.min(i, this.items.length - 1));
		const children = Array.from(this.resultsEl.children);
		children.forEach((c, idx) => c.toggleClass("is-selected", idx === this.selected));
		children[this.selected]?.scrollIntoView({ block: "nearest" });
	}

	private insertSelected() {
		const item = this.items[this.selected];
		if (!item) return;
		const opts = { nikud: this.settings.includeNikud, teamim: this.settings.includeTeamim };
		const lines = item.verses.map((v) => formatHebrew(v, opts));

		let text: string;
		if (this.settings.quoteFormat) {
			const quoted = lines.map((l) => `> ${l}`).join("\n");
			text = `${quoted}\n> — ${item.label}\n`;
		} else {
			text = `${lines.join(" ")} (${item.label})`;
		}

		this.editor.replaceSelection(text);
		this.close();
	}
}
