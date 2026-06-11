// Traducciones vía API de Sefaria (online, opcional).
// Las versiones disponibles varían por libro; se listan bajo demanda y se cachean.
import { requestUrl } from "obsidian";

export interface VersionInfo {
	title: string; // versionTitle exacto (para el parámetro `ven`)
	display: string; // título corto para el dropdown
	lang: string; // "es", "en", "fr", ... (extraído de la etiqueta [xx] o language)
}

const versionsCache = new Map<string, VersionInfo[]>();

/** Extrae el idioma real: Sefaria marca traducciones no-inglesas con "[xx]" en el título. */
function realLang(language: string, title: string): string {
	const m = title.match(/\[([a-z]{2})\]\s*$/);
	if (m) return m[1];
	return language === "he" ? "he" : "en";
}

function shorten(title: string): string {
	let t = title.replace(/\s*\[[a-z]{2}\]\s*$/, "");
	if (t.length > 60) t = t.slice(0, 57) + "…";
	return t;
}

/** Lista las traducciones (no-hebreo) disponibles para un libro de Sefaria. */
export async function listVersions(sefariaRef: string, preferLang: string): Promise<VersionInfo[]> {
	const hit = versionsCache.get(sefariaRef);
	if (hit) return hit;
	const res = await requestUrl({
		url: `https://www.sefaria.org/api/texts/versions/${encodeURIComponent(sefariaRef)}`,
	});
	const raw = res.json as Array<{ language: string; versionTitle: string }>;
	const out: VersionInfo[] = [];
	for (const v of raw) {
		const lang = realLang(v.language, v.versionTitle);
		if (lang === "he") continue; // solo traducciones
		out.push({ title: v.versionTitle, display: shorten(v.versionTitle), lang });
	}
	// idioma preferido primero, luego inglés, luego el resto
	const rank = (l: string) => (l === preferLang ? 0 : l === "en" ? 1 : 2);
	out.sort((a, b) => rank(a.lang) - rank(b.lang) || a.display.localeCompare(b.display));
	versionsCache.set(sefariaRef, out);
	return out;
}

/** Limpia HTML/footnotes del texto de traducción de Sefaria. */
function cleanTranslation(raw: string): string {
	return (raw || "")
		.replace(/<i class="footnote">[\s\S]*?<\/i>/g, "")
		.replace(/<sup class="footnote-marker">[\s\S]*?<\/sup>/g, "")
		.replace(/<[^>]+>/g, "")
		.replace(/&[a-zA-Z]+;|&#\d+;/g, " ")
		// corchetes del traductor -> paréntesis (Obsidian interpreta [...] como enlace)
		.replace(/\[\s*/g, "(")
		.replace(/\s*\]/g, ")")
		.replace(/\s{2,}/g, " ")
		.trim();
}

/**
 * Trae la traducción de un rango de versículos con una versión específica.
 * Devuelve null si la versión no tiene texto para ese pasaje.
 */
export async function fetchTranslation(
	sefariaRef: string,
	chapter: number,
	verseStart: number,
	verseEnd: number,
	versionTitle: string
): Promise<string[] | null> {
	const range =
		verseStart === verseEnd
			? `${chapter}.${verseStart}`
			: `${chapter}.${verseStart}-${verseEnd}`;
	const params = new URLSearchParams({ ven: versionTitle, context: "0", commentary: "0" });
	const res = await requestUrl({
		url: `https://www.sefaria.org/api/texts/${encodeURIComponent(sefariaRef)}.${range}?${params.toString()}`,
	});
	const data = res.json as { text?: string | string[] };
	const t = data.text;
	const arr = typeof t === "string" ? [t] : Array.isArray(t) ? t : [];
	const cleaned = arr.map(cleanTranslation).filter((s) => s.length > 0);
	return cleaned.length ? cleaned : null;
}
