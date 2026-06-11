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

/** Aplica el formato elegido por el usuario. */
export function formatHebrew(s: string, opts: { nikud: boolean; teamim: boolean }): string {
	let out = s;
	if (!opts.teamim) out = stripTeamim(out);
	if (!opts.nikud) out = stripNikud(out);
	return out.replace(/ {2,}/g, " ").trim();
}
