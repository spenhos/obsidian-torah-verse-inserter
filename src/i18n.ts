// i18n mínimo (EN/ES por ahora; extender a HE/AR/FR/RU/PT antes del release público,
// siguiendo el patrón de obsidian-diacritics-free-search).
import { getLanguage } from "obsidian";

type Lang = "en" | "es";
const SUPPORTED: Lang[] = ["en", "es"];

const translations: Record<Lang, Record<string, string>> = {
	en: {
		cmdInsert: "Insert pasuk (Tanakh verse)",
		modalTitle: "Insert pasuk",
		searchPlaceholder: "Reference (Gen 1:1) or search (bereshit / בראשית)...",
		noResults: "No results",
		hint: "Type a reference like “Bereshit 1:1-3”, or search by transliteration or Hebrew.",
		insertHebrewOnly: "Hebrew only",
		settings: "Settings",
		includeNikud: "Include nikud (vowels)",
		includeNikudDesc: "Insert verses with vowel points",
		includeTeamim: "Include te'amim (cantillation)",
		includeTeamimDesc: "Insert verses with cantillation marks",
		quoteFormat: "Insert as quote block",
		quoteFormatDesc: "Wrap the inserted verses in a Markdown blockquote with the reference",
		maxResults: "Maximum search results",
		maxResultsDesc: "Limit how many verses appear when searching by text",
		fontCompat: "Font compatibility",
		fontCompatDesc: "Replace rare marks (qamats qatan, holam haser) with standard equivalents so they render in any font. Turn off only if your font supports them.",
		support: "Support this plugin",
		supportDesc: "Pasuk is free and open source. If it helps your study, you can support its development with a coffee. ☕",
		supportBtn: "Support on Ko-fi",
		viewGithub: "View on GitHub",
		reportIssue: "Report an issue",
		searching: "Searching…",
		toggleKeyboard: "Hebrew keyboard",
		translationLabel: "Translation:",
		noTranslation: "No translation",
		noTranslationForPassage: "That version has no text for this passage — inserted Hebrew only.",
		translationFetchError: "Could not fetch the translation (offline?) — inserted Hebrew only.",
	},
	es: {
		cmdInsert: "Insertar pasuk (versículo del Tanaj)",
		modalTitle: "Insertar pasuk",
		searchPlaceholder: "Referencia (Gén 1:1) o búsqueda (bereshit / בראשית)...",
		noResults: "Sin resultados",
		hint: "Escribe una referencia como “Bereshit 1:1-3”, o busca por transliteración o hebreo.",
		insertHebrewOnly: "Solo hebreo",
		settings: "Ajustes",
		includeNikud: "Incluir nikud (vocales)",
		includeNikudDesc: "Insertar los versículos con puntos vocálicos",
		includeTeamim: "Incluir te'amim (cantilación)",
		includeTeamimDesc: "Insertar los versículos con marcas de cantilación",
		quoteFormat: "Insertar como cita (quote)",
		quoteFormatDesc: "Envolver los versículos en un blockquote de Markdown con la referencia",
		maxResults: "Máximo de resultados",
		maxResultsDesc: "Límite de versículos al buscar por texto",
		fontCompat: "Compatibilidad de fuentes",
		fontCompatDesc: "Reemplaza signos raros (kamatz katán, jolam jaser) por sus equivalentes estándar para que se vean en cualquier fuente. Desactívalo solo si tu fuente los soporta.",
		support: "Apoya este plugin",
		supportDesc: "Pasuk es gratuito y de código abierto. Si te ayuda en tu estudio, puedes apoyar su desarrollo con un café. ☕",
		supportBtn: "Apóyame en Ko-fi",
		viewGithub: "Ver en GitHub",
		reportIssue: "Reportar un problema",
		searching: "Buscando…",
		toggleKeyboard: "Teclado hebreo",
		translationLabel: "Traducción:",
		noTranslation: "Sin traducción",
		noTranslationForPassage: "Esa versión no tiene texto para este pasaje — se insertó solo el hebreo.",
		translationFetchError: "No se pudo traer la traducción (¿sin internet?) — se insertó solo el hebreo.",
	},
};

let current: Lang = "en";

function detect(): Lang {
	let raw = "en";
	try {
		if (typeof getLanguage === "function") raw = getLanguage() || "en";
	} catch {
		raw = "en";
	}
	const two = raw.toLowerCase().split(/[-_]/)[0];
	return SUPPORTED.includes(two as Lang) ? (two as Lang) : "en";
}

export function initI18n(): void {
	current = detect();
}

export function currentLang(): "es" | "en" {
	return current;
}

export function t(key: string, params?: Record<string, string | number>): string {
	let s = translations[current]?.[key] ?? translations.en[key] ?? key;
	if (params) {
		for (const p of Object.keys(params)) {
			s = s.split("{" + p + "}").join(String(params[p]));
		}
	}
	return s;
}
