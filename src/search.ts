// Búsqueda de texto en todo el Tanaj (hebreo directo o transliteración).
import { BOOKS, BookInfo } from "./books";
import { loadBook } from "./corpus";
import { consonantal, stripNikud, stripTeamim } from "./hebrew";
import { isLatin, translitToRegex } from "./translit";

export interface SearchHit {
	book: BookInfo;
	chapter: number; // 1-based
	verse: number; // 1-based
	text: string; // texto original (con nikud + te'amim)
}

// Índice consonantal en memoria (se construye una vez por sesión, bajo demanda)
let consIndex: Map<string, string[][]> | null = null;

async function buildIndex(): Promise<Map<string, string[][]>> {
	if (consIndex) return consIndex;
	const idx = new Map<string, string[][]>();
	for (const b of BOOKS) {
		const chapters = await loadBook(b.key);
		idx.set(
			b.key,
			chapters.map((ch) => ch.map((v) => consonantal(v)))
		);
	}
	consIndex = idx;
	return idx;
}

/**
 * Busca `query` en todo el Tanaj. Acepta hebreo (con o sin nikud)
 * o transliteración latina. Devuelve hasta `limit` resultados.
 */
export async function searchText(query: string, limit: number): Promise<SearchHit[]> {
	const q = query.trim();
	if (!q) return [];

	let matcher: (cons: string) => boolean;
	if (isLatin(q)) {
		const re = translitToRegex(q);
		if (!re) return [];
		matcher = (cons) => re.test(cons);
	} else {
		// hebreo directo: normalizar a consonantal y buscar como substring
		const needle = consonantal(stripNikud(stripTeamim(q)));
		if (!needle) return [];
		matcher = (cons) => cons.includes(needle);
	}

	const idx = await buildIndex();
	const hits: SearchHit[] = [];

	for (const b of BOOKS) {
		const chapters = idx.get(b.key);
		if (!chapters) continue;
		const original = await loadBook(b.key);
		for (let c = 0; c < chapters.length; c++) {
			const verses = chapters[c];
			for (let v = 0; v < verses.length; v++) {
				if (matcher(verses[v])) {
					hits.push({ book: b, chapter: c + 1, verse: v + 1, text: original[c][v] });
					if (hits.length >= limit) return hits;
				}
			}
		}
	}
	return hits;
}
