// Descarga el Tanaj completo (MAM, versión fijada) desde Sefaria y lo limpia
// PARA LECTURA: en los pares ketiv/qeré se conserva el QERÉ (forma leída,
// vocalizada) — a diferencia del corpus ELS de codigos-torah, que conserva
// el ketiv consonantal.
//
// Output: tools/cache/{Book}.json  con shape { he: string[][] }
// Después correr: npm run build-corpus
//
// Run: node tools/fetch-corpus.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const VHE = "Miqra_according_to_the_Masorah";
const CACHE = new URL("./cache/", import.meta.url).pathname;
mkdirSync(CACHE, { recursive: true });

// key del corpus -> ref de Sefaria + número de capítulos
const BOOKS = {
	Genesis: ["Genesis", 50], Exodus: ["Exodus", 40], Leviticus: ["Leviticus", 27],
	Numbers: ["Numbers", 36], Deuteronomy: ["Deuteronomy", 34],
	Joshua: ["Joshua", 24], Judges: ["Judges", 21],
	ISamuel: ["I_Samuel", 31], IISamuel: ["II_Samuel", 24],
	IKings: ["I_Kings", 22], IIKings: ["II_Kings", 25],
	Isaiah: ["Isaiah", 66], Jeremiah: ["Jeremiah", 52], Ezekiel: ["Ezekiel", 48],
	Hosea: ["Hosea", 14], Joel: ["Joel", 4], Amos: ["Amos", 9], Obadiah: ["Obadiah", 1],
	Jonah: ["Jonah", 4], Micah: ["Micah", 7], Nahum: ["Nahum", 3], Habakkuk: ["Habakkuk", 3],
	Zephaniah: ["Zephaniah", 3], Haggai: ["Haggai", 2], Zechariah: ["Zechariah", 14],
	Malachi: ["Malachi", 3],
	Psalms: ["Psalms", 150], Proverbs: ["Proverbs", 31], Job: ["Job", 42],
	SongOfSongs: ["Song_of_Songs", 8], Ruth: ["Ruth", 4], Lamentations: ["Lamentations", 5],
	Ecclesiastes: ["Ecclesiastes", 12], Esther: ["Esther", 10], Daniel: ["Daniel", 12],
	Ezra: ["Ezra", 10], Nehemiah: ["Nehemiah", 13],
	IChronicles: ["I_Chronicles", 29], IIChronicles: ["II_Chronicles", 36],
};

/** Limpieza para lectura: qeré sobre ketiv, sin HTML/footnotes/marcadores. */
function cleanForReading(raw) {
	return (raw || "")
		// footnotes
		.replace(/<i class="footnote">[\s\S]*?<\/i>/g, "")
		.replace(/<sup class="footnote-marker">[\s\S]*?<\/sup>/g, "")
		// ketiv: fuera (incluido su contenido)
		.replace(/<span class="mam-kq-k">[\s\S]*?<\/span>/g, "")
		// el resto de spans (qeré, trivial, etc.): conservar contenido
		.replace(/<[^>]+>/g, "")
		// entidades HTML
		.replace(/&[a-zA-Z]+;|&#\d+;/g, " ")
		// marcadores de parashá {פ} {ס} (con o sin llaves/paréntesis)
		.replace(/[{(]\s*[פסשׁ]\s*[)}]/g, "")
		// qeré viene entre corchetes: conservar contenido
		.replace(/\[([^\]]*)\]/g, "$1")
		// paréntesis sueltos restantes
		.replace(/[()]/g, "")
		.replace(/\s{2,}/g, " ")
		.trim();
}

async function fetchBook(key, ref, chapters) {
	const url = `https://www.sefaria.org/api/texts/${ref}.1-${chapters}?vhe=${VHE}&context=0&commentary=0`;
	const res = await fetch(url);
	if (!res.ok) throw new Error(`${key}: HTTP ${res.status}`);
	const data = await res.json();
	let he = data.he;
	// libros de 1 capítulo: Sefaria devuelve string[] plano
	if (chapters === 1 && typeof he[0] === "string") he = [he];
	if (!Array.isArray(he) || he.length !== chapters) {
		throw new Error(`${key}: esperaba ${chapters} capítulos, llegaron ${he?.length}`);
	}
	return he.map((ch) => ch.map(cleanForReading));
}

let totalVerses = 0;
for (const [key, [ref, chapters]] of Object.entries(BOOKS)) {
	const he = await fetchBook(key, ref, chapters);
	const verses = he.reduce((n, c) => n + c.length, 0);
	totalVerses += verses;
	writeFileSync(join(CACHE, `${key}.json`), JSON.stringify({ he }));
	console.log(`${key.padEnd(14)} ${chapters} caps, ${verses} versos`);
	await new Promise((r) => setTimeout(r, 300)); // cortesía con la API
}
console.log(`\n✅ ${Object.keys(BOOKS).length} libros, ${totalVerses} versículos → tools/cache/`);
