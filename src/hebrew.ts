// Utilidades de texto hebreo: quitar te'amim (cantilación) y/o nikud (vocales).

const TEAMIM_RE = /[֑-֯]/g; // cantilación
const NIKUD_RE = /[ְ-ׇֽׁׂ]/g; // vocales + dagesh + meteg + shin/sin dots

/** Quita SOLO los te'amim (U+0591–U+05AF), conserva el nikud. */
export function stripTeamim(s: string): string {
	return s.replace(TEAMIM_RE, "");
}

/** Quita el nikud (vocales, dagesh, meteg, puntos de shin/sin). */
export function stripNikud(s: string): string {
	return s.replace(NIKUD_RE, "");
}

/** Texto consonantal puro: sin te'amim ni nikud. */
export function consonantal(s: string): string {
	return stripNikud(stripTeamim(s));
}

/**
 * Compatibilidad de fuentes: MAM usa signos que muchas fuentes no incluyen.
 * Se sustituyen por equivalentes visualmente idénticos:
 *   U+05C7 kamatz katán  -> U+05B8 kamatz
 *   U+05BA jolam jaser   -> U+05B9 jolam
 */
export function normalizeRareMarks(s: string): string {
	return s.replace(/ׇ/g, "ָ").replace(/ֺ/g, "ֹ");
}

/** Aplica el formato elegido por el usuario. */
export function formatHebrew(
	s: string,
	opts: { nikud: boolean; teamim: boolean; fontCompat?: boolean }
): string {
	let out = s;
	if (!opts.teamim) out = stripTeamim(out);
	if (!opts.nikud) out = stripNikud(out);
	if (opts.fontCompat !== false) out = normalizeRareMarks(out);
	return out.replace(/ {2,}/g, " ").trim();
}
