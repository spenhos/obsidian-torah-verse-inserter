// Carga perezosa del corpus: cada libro se descomprime (gzip) la primera vez
// que se usa y queda cacheado en memoria.
//
// src/data/corpus.ts es un archivo GENERADO (npm run build-corpus) y no vive
// en el repo, por eso se tipa explícitamente aquí: así el análisis estático
// funciona aunque el archivo generado no esté presente.
import { CORPUS_GZ as RAW_GZ, BOOK_SHAPE as RAW_SHAPE } from "./data/corpus";

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- el módulo generado puede no existir en análisis estático
const CORPUS_GZ: Record<string, string> = RAW_GZ as Record<string, string>;
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- el módulo generado puede no existir en análisis estático
const BOOK_SHAPE: Record<string, number[]> = RAW_SHAPE as Record<string, number[]>;

const cache = new Map<string, string[][]>();

export async function loadBook(key: string): Promise<string[][]> {
	const hit = cache.get(key);
	if (hit) return hit;
	const b64 = CORPUS_GZ[key];
	if (!b64) throw new Error(`Unknown book: ${key}`);
	const bin = atob(b64);
	const bytes = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
	const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
	const text = await new Response(stream).text();
	const chapters = JSON.parse(text) as string[][];
	cache.set(key, chapters);
	return chapters;
}

/** [versículos por capítulo] — disponible sin descomprimir. */
export function bookShape(key: string): number[] | undefined {
	return BOOK_SHAPE[key];
}

/** Obtiene un rango de versículos (1-based). Devuelve null si la ref no existe. */
export async function getVerses(
	key: string,
	chapter: number,
	verseStart: number,
	verseEnd: number
): Promise<string[] | null> {
	const shape = bookShape(key);
	if (!shape || chapter < 1 || chapter > shape.length) return null;
	const maxV = shape[chapter - 1];
	if (verseStart < 1 || verseEnd < verseStart || verseStart > maxV) return null;
	const end = Math.min(verseEnd, maxV);
	const book = await loadBook(key);
	return book[chapter - 1].slice(verseStart - 1, end);
}
