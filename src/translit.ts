// Transliteración latina → patrón de búsqueda en hebreo consonantal.
//
// Idea: las consonantes mapean a clases de letras hebreas (incluyendo finales);
// las vocales latinas (a,e,i,o,u) son flexibles — pueden corresponder a nada
// (solo nikud) o a una mater lectionis (א ה ו י). Así "bereshit" encuentra
// בראשית y "mayim" encuentra מים.

interface Token {
	pattern: string; // fragmento de regex
	isVowel: boolean;
}

// Dígrafos primero (orden importa)
const DIGRAPHS: Array<[string, string]> = [
	["sh", "ש"],
	["tz", "[צץ]"],
	["ts", "[צץ]"],
	["ch", "[חכך]"],
	["kh", "[כך]"],
	["th", "ת"],
	["ph", "[פף]"],
];

const CONSONANTS: Record<string, string> = {
	b: "ב",
	v: "[בו]",
	g: "ג",
	d: "ד",
	h: "ה",
	w: "ו",
	z: "ז",
	j: "[חכך]", // español: jet
	t: "[תט]",
	y: "י",
	k: "[כךק]",
	c: "[כךקס]", // comodín latino
	l: "ל",
	m: "[מם]",
	n: "[נן]",
	s: "[סש]",
	x: "[סש]",
	p: "[פף]",
	f: "[פף]",
	q: "ק",
	r: "ר",
};

// Vocales: opcionalmente una mater lectionis. La ' (apóstrofe) fuerza א/ע.
const VOWELS: Record<string, string> = {
	a: "[אהע]?",
	e: "[אהעי]?",
	i: "י?",
	o: "[וא]?",
	u: "ו?",
};

/** ¿El texto parece transliteración latina (y no hebreo directo)? */
export function isLatin(s: string): boolean {
	return /^[a-z'\s]+$/i.test(s.trim());
}

/**
 * Convierte una transliteración a RegExp sobre texto hebreo consonantal.
 * Devuelve null si no hay consonantes utilizables.
 */
export function translitToRegex(input: string): RegExp | null {
	const words = input.trim().toLowerCase().split(/\s+/);
	const wordPatterns: string[] = [];

	for (const word of words) {
		const tokens: Token[] = [];
		let i = 0;
		while (i < word.length) {
			const two = word.slice(i, i + 2);
			const dig = DIGRAPHS.find(([d]) => d === two);
			if (dig) {
				tokens.push({ pattern: dig[1], isVowel: false });
				i += 2;
				continue;
			}
			const ch = word[i];
			if (ch === "'") {
				tokens.push({ pattern: "[אע]", isVowel: false });
			} else if (CONSONANTS[ch]) {
				tokens.push({ pattern: CONSONANTS[ch], isVowel: false });
			} else if (VOWELS[ch]) {
				tokens.push({ pattern: VOWELS[ch], isVowel: true });
			}
			// caracteres desconocidos se ignoran
			i += 1;
		}
		// vocal inicial: suele ser א/ע presente (ej. "adam" → אדם)
		if (tokens.length && tokens[0].isVowel) {
			tokens[0] = { pattern: "[אהעיו]", isVowel: false };
		}
		const consonantCount = tokens.filter((t) => !t.isVowel).length;
		if (consonantCount === 0) continue;
		wordPatterns.push(tokens.map((t) => t.pattern).join(""));
	}

	if (!wordPatterns.length) return null;
	try {
		return new RegExp(wordPatterns.join("[ ־]"), "u");
	} catch {
		return null;
	}
}
