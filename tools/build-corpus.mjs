// Empaqueta el corpus MAM del Tanaj (39 libros, nikud + te'amim) desde el
// proyecto codigos-torah hacia src/data/corpus.ts como gzip+base64 por libro.
// El plugin lo descomprime bajo demanda con DecompressionStream (lazy, por libro).
//
// Run: npm run build-corpus
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join, basename } from "node:path";

const CORPUS_DIR =
	"/Users/salehpenhos/Documents/Claude/Codigo/codigos-torah/public/data/corpus";
const OUT_DIR = new URL("../src/data/", import.meta.url).pathname;

mkdirSync(OUT_DIR, { recursive: true });

const files = readdirSync(CORPUS_DIR).filter((f) => f.endsWith(".json"));
if (files.length !== 39) {
	throw new Error(`Se esperaban 39 libros, hay ${files.length}`);
}

let totalRaw = 0;
let totalGz = 0;
const entries = [];
const meta = [];

for (const f of files.sort()) {
	const book = basename(f, ".json");
	const raw = readFileSync(join(CORPUS_DIR, f));
	const data = JSON.parse(raw.toString("utf-8"));
	const chapters = data.he;
	if (!Array.isArray(chapters)) throw new Error(`${book}: formato inesperado`);
	const verseCounts = chapters.map((c) => c.length);

	// Re-serializar solo los capítulos (sin el wrapper {he:...})
	const payload = JSON.stringify(chapters);
	const gz = gzipSync(Buffer.from(payload, "utf-8"), { level: 9 });
	totalRaw += payload.length;
	totalGz += gz.length;

	entries.push(`\t${JSON.stringify(book)}: ${JSON.stringify(gz.toString("base64"))},`);
	meta.push({ book, chapters: chapters.length, verseCounts });
}

const ts = `// GENERATED FILE — do not edit. Run: npm run build-corpus
// Fuente: corpus MAM (Miqra according to the Masorah) del proyecto codigos-torah,
// versión fijada de Sefaria, con parches Koren en la Torá. 39 libros del Tanaj.
// Formato por libro: gzip+base64 de JSON string[][] (capítulos -> versículos).

export const CORPUS_GZ: Record<string, string> = {
${entries.join("\n")}
};

/** Capítulos y versículos por libro (para validar referencias sin descomprimir). */
export const BOOK_SHAPE: Record<string, number[]> = {
${meta.map((m) => `\t${JSON.stringify(m.book)}: ${JSON.stringify(m.verseCounts)},`).join("\n")}
};
`;

writeFileSync(join(OUT_DIR, "corpus.ts"), ts);
console.log(
	`✅ ${files.length} libros → src/data/corpus.ts ` +
		`(raw ${(totalRaw / 1048576).toFixed(1)} MB → gz ${(totalGz / 1048576).toFixed(1)} MB)`
);
