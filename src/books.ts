// Metadata de los 39 libros del Tanaj (orden tradicional).
// `key` debe coincidir con los nombres de archivo del corpus (codigos-torah).

export interface BookInfo {
	key: string; // corpus key
	en: string;
	es: string;
	he: string;
	translit: string; // nombre hebreo romanizado
	aliases: string[]; // abreviaturas y variantes (sin acentos, lowercase)
}

export const BOOKS: BookInfo[] = [
	// --- Torá ---
	{ key: "Genesis", en: "Genesis", es: "Génesis", he: "בראשית", translit: "Bereshit", aliases: ["gen", "gn", "ber", "bereshit", "genesis"] },
	{ key: "Exodus", en: "Exodus", es: "Éxodo", he: "שמות", translit: "Shemot", aliases: ["ex", "exo", "shem", "shemot", "exodo"] },
	{ key: "Leviticus", en: "Leviticus", es: "Levítico", he: "ויקרא", translit: "Vayikra", aliases: ["lev", "lv", "vay", "vayikra", "levitico"] },
	{ key: "Numbers", en: "Numbers", es: "Números", he: "במדבר", translit: "Bemidbar", aliases: ["num", "nm", "bam", "bem", "bamidbar", "bemidbar", "numeros"] },
	{ key: "Deuteronomy", en: "Deuteronomy", es: "Deuteronomio", he: "דברים", translit: "Devarim", aliases: ["deut", "dt", "dev", "devarim", "deuteronomio"] },
	// --- Neviim ---
	{ key: "Joshua", en: "Joshua", es: "Josué", he: "יהושע", translit: "Yehoshúa", aliases: ["jos", "josh", "yeho", "yehoshua", "josue"] },
	{ key: "Judges", en: "Judges", es: "Jueces", he: "שופטים", translit: "Shoftim", aliases: ["jue", "jud", "shof", "shoftim", "jueces"] },
	{ key: "ISamuel", en: "I Samuel", es: "1 Samuel", he: "שמואל א", translit: "Shmuel Alef", aliases: ["1sam", "1sa", "1samuel", "isamuel", "shmuel1", "shmuela"] },
	{ key: "IISamuel", en: "II Samuel", es: "2 Samuel", he: "שמואל ב", translit: "Shmuel Bet", aliases: ["2sam", "2sa", "2samuel", "iisamuel", "shmuel2", "shmuelb"] },
	{ key: "IKings", en: "I Kings", es: "1 Reyes", he: "מלכים א", translit: "Melajim Alef", aliases: ["1re", "1rey", "1reyes", "1ki", "1kings", "ikings", "melajim1", "melachim1"] },
	{ key: "IIKings", en: "II Kings", es: "2 Reyes", he: "מלכים ב", translit: "Melajim Bet", aliases: ["2re", "2rey", "2reyes", "2ki", "2kings", "iikings", "melajim2", "melachim2"] },
	{ key: "Isaiah", en: "Isaiah", es: "Isaías", he: "ישעיהו", translit: "Yeshaiahu", aliases: ["isa", "is", "yesh", "yeshaiahu", "isaias"] },
	{ key: "Jeremiah", en: "Jeremiah", es: "Jeremías", he: "ירמיהו", translit: "Yirmiyahu", aliases: ["jer", "yirm", "yirmiyahu", "jeremias"] },
	{ key: "Ezekiel", en: "Ezekiel", es: "Ezequiel", he: "יחזקאל", translit: "Yejezkel", aliases: ["eze", "ez", "yejez", "yechezkel", "yejezkel", "ezequiel"] },
	{ key: "Hosea", en: "Hosea", es: "Oseas", he: "הושע", translit: "Hoshea", aliases: ["os", "hos", "hoshea", "oseas"] },
	{ key: "Joel", en: "Joel", es: "Joel", he: "יואל", translit: "Yoel", aliases: ["joe", "yoel", "joel"] },
	{ key: "Amos", en: "Amos", es: "Amós", he: "עמוס", translit: "Amós", aliases: ["am", "amos"] },
	{ key: "Obadiah", en: "Obadiah", es: "Abdías", he: "עובדיה", translit: "Ovadiá", aliases: ["abd", "oba", "ovadia", "abdias", "obadiah"] },
	{ key: "Jonah", en: "Jonah", es: "Jonás", he: "יונה", translit: "Yoná", aliases: ["jon", "yona", "jonas", "jonah"] },
	{ key: "Micah", en: "Micah", es: "Miqueas", he: "מיכה", translit: "Mijá", aliases: ["miq", "mic", "mija", "micha", "miqueas", "micah"] },
	{ key: "Nahum", en: "Nahum", es: "Nahúm", he: "נחום", translit: "Najum", aliases: ["nah", "najum", "nahum"] },
	{ key: "Habakkuk", en: "Habakkuk", es: "Habacuc", he: "חבקוק", translit: "Javakuk", aliases: ["hab", "javakuk", "habacuc", "habakkuk"] },
	{ key: "Zephaniah", en: "Zephaniah", es: "Sofonías", he: "צפניה", translit: "Tzefaniá", aliases: ["sof", "zep", "tzefania", "sofonias", "zephaniah"] },
	{ key: "Haggai", en: "Haggai", es: "Ageo", he: "חגי", translit: "Jagai", aliases: ["age", "hag", "jagai", "ageo", "haggai"] },
	{ key: "Zechariah", en: "Zechariah", es: "Zacarías", he: "זכריה", translit: "Zejariá", aliases: ["zac", "zec", "zejaria", "zacarias", "zechariah"] },
	{ key: "Malachi", en: "Malachi", es: "Malaquías", he: "מלאכי", translit: "Malají", aliases: ["mal", "malaji", "malaquias", "malachi"] },
	// --- Ketuvim ---
	{ key: "Psalms", en: "Psalms", es: "Salmos", he: "תהלים", translit: "Tehilim", aliases: ["sal", "ps", "psa", "teh", "tehilim", "salmos", "psalms", "salmo"] },
	{ key: "Proverbs", en: "Proverbs", es: "Proverbios", he: "משלי", translit: "Mishlei", aliases: ["pro", "prov", "mish", "mishlei", "proverbios"] },
	{ key: "Job", en: "Job", es: "Job", he: "איוב", translit: "Iyov", aliases: ["job", "iyov", "iov"] },
	{ key: "SongOfSongs", en: "Song of Songs", es: "Cantar de los Cantares", he: "שיר השירים", translit: "Shir HaShirim", aliases: ["cant", "shir", "shirhashirim", "cantares", "songofsongs", "song"] },
	{ key: "Ruth", en: "Ruth", es: "Rut", he: "רות", translit: "Rut", aliases: ["rut", "ruth"] },
	{ key: "Lamentations", en: "Lamentations", es: "Lamentaciones", he: "איכה", translit: "Eijá", aliases: ["lam", "eija", "eicha", "lamentaciones", "lamentations"] },
	{ key: "Ecclesiastes", en: "Ecclesiastes", es: "Eclesiastés", he: "קהלת", translit: "Kohélet", aliases: ["ecl", "ecc", "kohelet", "qohelet", "eclesiastes", "ecclesiastes"] },
	{ key: "Esther", en: "Esther", es: "Ester", he: "אסתר", translit: "Ester", aliases: ["est", "ester", "esther"] },
	{ key: "Daniel", en: "Daniel", es: "Daniel", he: "דניאל", translit: "Daniel", aliases: ["dan", "daniel"] },
	{ key: "Ezra", en: "Ezra", es: "Esdras", he: "עזרא", translit: "Ezrá", aliases: ["esd", "ezr", "ezra", "esdras"] },
	{ key: "Nehemiah", en: "Nehemiah", es: "Nehemías", he: "נחמיה", translit: "Nejemiá", aliases: ["neh", "nejemia", "nehemias", "nehemiah"] },
	{ key: "IChronicles", en: "I Chronicles", es: "1 Crónicas", he: "דברי הימים א", translit: "Divrei HaYamim Alef", aliases: ["1cr", "1cro", "1cron", "1chronicles", "ichronicles", "divrei1"] },
	{ key: "IIChronicles", en: "II Chronicles", es: "2 Crónicas", he: "דברי הימים ב", translit: "Divrei HaYamim Bet", aliases: ["2cr", "2cro", "2cron", "2chronicles", "iichronicles", "divrei2"] },
];

/** Ref de Sefaria por key del corpus (solo los que difieren del key). */
const SEFARIA_REF_OVERRIDES: Record<string, string> = {
	ISamuel: "I_Samuel",
	IISamuel: "II_Samuel",
	IKings: "I_Kings",
	IIKings: "II_Kings",
	SongOfSongs: "Song_of_Songs",
	IChronicles: "I_Chronicles",
	IIChronicles: "II_Chronicles",
};

export function sefariaRef(book: BookInfo): string {
	return SEFARIA_REF_OVERRIDES[book.key] ?? book.key;
}

/** Normaliza para matching: minúsculas, sin acentos latinos, sin espacios/puntos. */
export function normName(s: string): string {
	return s
		.toLowerCase()
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.replace(/[\s.''׳]/g, "");
}

const lookup = new Map<string, BookInfo>();
for (const b of BOOKS) {
	const names = [b.en, b.es, b.he, b.translit, b.key, ...b.aliases];
	for (const n of names) lookup.set(normName(n), b);
}

/** Resuelve un nombre de libro (exacto o por prefijo único). */
export function resolveBook(input: string): BookInfo | null {
	const n = normName(input);
	if (!n) return null;
	const exact = lookup.get(n);
	if (exact) return exact;
	// prefijo único
	const hits = new Set<BookInfo>();
	for (const [name, book] of lookup) {
		if (name.startsWith(n)) hits.add(book);
	}
	return hits.size === 1 ? [...hits][0] : null;
}
