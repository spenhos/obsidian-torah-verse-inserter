// Modal de búsqueda e inserción de pesukim.
import { App, Editor, Modal, Notice } from "obsidian";
import { alhatorahUrl, BookInfo, sefariaRef } from "./books";
import { formatRefLabel, parseRef } from "./refparse";
import { getVerses } from "./corpus";
import { searchText, SearchHit } from "./search";
import { formatHebrew } from "./hebrew";
import { currentLang, t } from "./i18n";
import { fetchTranslation, listVersions } from "./sefaria";
import type PasukPlugin from "./main";

interface ResultItem {
	label: string; // ej. "Génesis 1:1"
	book: BookInfo;
	chapter: number;
	verseStart: number;
	verseEnd: number;
	verses: string[]; // texto original
	preview: string;
}

// Letras con tooltip (nombre + sonido). El maqaf al final.
const ALEF_BET: Array<[string, string]> = [
	["א", "alef (')"],
	["ב", "bet (b/v)"],
	["ג", "guimel (g)"],
	["ד", "dalet (d)"],
	["ה", "he (h)"],
	["ו", "vav (v/o/u)"],
	["ז", "zayin (z)"],
	["ח", "jet (j)"],
	["ט", "tet (t)"],
	["י", "yod (y/i)"],
	["כ", "kaf (k/j)"],
	["ך", "kaf sofit"],
	["ל", "lamed (l)"],
	["מ", "mem (m)"],
	["ם", "mem sofit"],
	["נ", "nun (n)"],
	["ן", "nun sofit"],
	["ס", "samej (s)"],
	["ע", "ayin (')"],
	["פ", "pe (p/f)"],
	["ף", "pe sofit"],
	["צ", "tsadi (ts)"],
	["ץ", "tsadi sofit"],
	["ק", "kuf (k)"],
	["ר", "resh (r)"],
	["ש", "shin (sh/s)"],
	["ת", "tav (t)"],
	["־", "maqaf"],
];

export class PasukModal extends Modal {
	private plugin: PasukPlugin;
	private editor: Editor;
	private inputEl: HTMLInputElement;
	private resultsEl: HTMLElement;
	private alefBetEl: HTMLElement;
	private versionSelect: HTMLSelectElement;
	private items: ResultItem[] = [];
	private selected = 0;
	private debounce: number | null = null;
	private searchSeq = 0;
	private versionsLoadedFor: string | null = null;

	constructor(app: App, editor: Editor, plugin: PasukPlugin) {
		super(app);
		this.editor = editor;
		this.plugin = plugin;
	}

	private get settings() {
		return this.plugin.settings;
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

		// Toolbar: teclado alef-bet + traducción
		const toolbar = contentEl.createDiv({ cls: "pasuk-toolbar" });

		const kbToggle = toolbar.createEl("button", {
			text: "א",
			cls: "pasuk-kb-toggle",
			attr: { "aria-label": t("toggleKeyboard") },
		});

		const versionWrap = toolbar.createDiv({ cls: "pasuk-version-wrap" });
		versionWrap.createSpan({ text: t("translationLabel") + " ", cls: "pasuk-version-label" });
		this.versionSelect = versionWrap.createEl("select", { cls: "pasuk-version-select" });
		this.versionSelect.createEl("option", { text: t("noTranslation"), value: "" });
		if (this.settings.preferredVersion) {
			// opción persistida (el listado completo se carga al abrir el dropdown)
			const opt = this.versionSelect.createEl("option", {
				text: this.settings.preferredVersionDisplay || this.settings.preferredVersion,
				value: this.settings.preferredVersion,
			});
			opt.selected = true;
		}
		this.versionSelect.addEventListener("mousedown", () => void this.loadVersions());
		this.versionSelect.addEventListener("change", () => {
			const opt = this.versionSelect.selectedOptions[0];
			this.settings.preferredVersion = this.versionSelect.value;
			this.settings.preferredVersionDisplay = opt ? opt.text : "";
			void this.plugin.saveSettings();
		});

		// Checkbox: link a AlHaTorah (persistido)
		const ahtLabel = toolbar.createEl("label", { cls: "pasuk-aht-label" });
		const ahtCheck = ahtLabel.createEl("input", { type: "checkbox" });
		ahtCheck.checked = this.settings.alhatorahLink;
		ahtLabel.appendText(" " + t("alhatorahLink"));
		ahtCheck.addEventListener("change", () => {
			this.settings.alhatorahLink = ahtCheck.checked;
			void this.plugin.saveSettings();
		});

		// Teclado alef-bet (plegable, estado persistido)
		this.alefBetEl = contentEl.createDiv({ cls: "pasuk-alefbet" });
		for (const [letter, tip] of ALEF_BET) {
			const btn = this.alefBetEl.createEl("button", {
				text: letter,
				cls: "pasuk-alefbet-key",
				attr: { "aria-label": tip },
			});
			btn.addEventListener("click", () => this.typeLetter(letter));
		}
		this.alefBetEl.toggleClass("is-hidden", !this.settings.alefBetOpen);
		kbToggle.addEventListener("click", () => {
			this.settings.alefBetOpen = !this.settings.alefBetOpen;
			this.alefBetEl.toggleClass("is-hidden", !this.settings.alefBetOpen);
			void this.plugin.saveSettings();
			this.inputEl.focus();
		});

		contentEl.createDiv({ cls: "pasuk-hint", text: t("hint") });
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
				void this.insertSelected();
			} else if (evt.key === "Escape") {
				this.close();
			}
		});
		this.inputEl.focus();
	}

	onClose() {
		this.contentEl.empty();
	}

	/** Inserta una letra del teclado en la posición del cursor del input. */
	private typeLetter(letter: string) {
		const el = this.inputEl;
		const start = el.selectionStart ?? el.value.length;
		const end = el.selectionEnd ?? start;
		el.value = el.value.slice(0, start) + letter + el.value.slice(end);
		const pos = start + letter.length;
		el.setSelectionRange(pos, pos);
		el.focus();
		el.dispatchEvent(new Event("input"));
	}

	/** Carga el listado de versiones para el libro del resultado seleccionado. */
	private async loadVersions() {
		const book = this.items[this.selected]?.book;
		const ref = book ? sefariaRef(book) : "Genesis";
		if (this.versionsLoadedFor === ref) return;
		try {
			const versions = await listVersions(ref, currentLang());
			const current = this.versionSelect.value;
			this.versionSelect.empty();
			this.versionSelect.createEl("option", { text: t("noTranslation"), value: "" });
			for (const v of versions) {
				const opt = this.versionSelect.createEl("option", {
					text: `(${v.lang}) ${v.display}`,
					value: v.title,
				});
				if (v.title === current) opt.selected = true;
			}
			this.versionsLoadedFor = ref;
		} catch {
			// sin red: se queda la opción persistida
		}
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

		const ref = parseRef(q);
		if (ref) {
			const verses = await getVerses(ref.book.key, ref.chapter, ref.verseStart, ref.verseEnd);
			if (seq !== this.searchSeq) return;
			if (verses) {
				this.items = [
					{
						label: formatRefLabel(ref, currentLang()),
						book: ref.book,
						chapter: ref.chapter,
						verseStart: ref.verseStart,
						verseEnd: Math.min(ref.verseEnd, ref.verseStart + verses.length - 1),
						verses,
						preview: verses[0],
					},
				];
			}
			this.render();
			return;
		}

		this.resultsEl.setText(t("searching"));
		const hits = await searchText(q, this.settings.maxResults);
		if (seq !== this.searchSeq) return;
		const lang = currentLang();
		this.items = hits.map((h: SearchHit) => ({
			label: `${lang === "es" ? h.book.es : h.book.en} ${h.chapter}:${h.verse}`,
			book: h.book,
			chapter: h.chapter,
			verseStart: h.verse,
			verseEnd: h.verse,
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
					fontCompat: this.settings.fontCompat,
				}),
			});
			el.addEventListener("click", () => {
				this.selected = i;
				void this.insertSelected();
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

	private async insertSelected() {
		const item = this.items[this.selected];
		if (!item) return;
		const opts = {
			nikud: this.settings.includeNikud,
			teamim: this.settings.includeTeamim,
			fontCompat: this.settings.fontCompat,
		};
		const lines = item.verses.map((v) => formatHebrew(v, opts));

		// Traducción opcional (online)
		let translation: string[] | null = null;
		let versionLabel = "";
		const version = this.settings.preferredVersion;
		if (version) {
			try {
				translation = await fetchTranslation(
					sefariaRef(item.book),
					item.chapter,
					item.verseStart,
					item.verseEnd,
					version
				);
				if (!translation) new Notice(t("noTranslationForPassage"));
				else
					versionLabel = (this.settings.preferredVersionDisplay || version)
						.replace(/\[/g, "(")
						.replace(/\]/g, ")");
			} catch {
				new Notice(t("translationFetchError"));
			}
		}

		const ahtLink = this.settings.alhatorahLink
			? `[AlHaTorah](${alhatorahUrl(item.book, item.chapter, item.verseStart)})`
			: "";

		let text: string;
		if (this.settings.quoteFormat) {
			let quoted = lines.map((l) => `> ${l}`).join("\n");
			if (translation) {
				quoted += "\n>\n" + translation.map((l) => `> ${l}`).join("\n");
			}
			let source = versionLabel ? `${item.label} · ${versionLabel}` : item.label;
			if (ahtLink) source += ` · ${ahtLink}`;
			text = `${quoted}\n> — ${source}\n`;
		} else {
			text = `${lines.join(" ")} (${item.label})`;
			if (translation) text += `\n${translation.join(" ")}`;
			if (ahtLink) text += ` ${ahtLink}`;
		}

		this.editor.replaceSelection(text);
		this.close();
	}
}
