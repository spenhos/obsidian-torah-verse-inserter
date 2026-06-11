// Genera los 3 SVGs del README en 7 idiomas desde una sola plantilla.
// EN → assets/*.svg ; demás → assets/{lang}/*.svg
// Run: node tools/build-assets.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = new URL("../assets/", import.meta.url).pathname;

const S = {
	en: {
		modalTitle: "Insert pasuk",
		regularKb: "regular keyboard ⌨️",
		translation: "Translation:",
		versionExample: "(es) El Pentateuco con Rashí ▾",
		noTranslation: "Translation: No translation ▾",
		aht: "AlHaTorah link",
		deut: "Deuteronomy",
		heroCaption: "Type “shema israel” with your Latin keyboard → finds the Hebrew שְׁמַע יִשְׂרָאֵל instantly, offline",
		flowTitle: "No keyboard switching — Hebrew search that just understands you",
		youType: "YOU TYPE",
		understands1: "TORAH VERSE INSERTER",
		understands2: "UNDERSTANDS",
		finds: "FINDS",
		note1: "vowels are flexible",
		note2: "yud · vav · alef optional",
		note3: "nikud ignored while matching",
		tooltip: "shin (sh/s)",
		legend1: "Click א to show or hide the on-screen Hebrew keyboard — it remembers your choice.",
		legend2: "Hover any key to see its name and sound.",
		legend3: "Click a key — the letter is typed straight into your search.",
		rtl: false,
	},
	es: {
		modalTitle: "Insertar pasuk",
		regularKb: "teclado normal ⌨️",
		translation: "Traducción:",
		versionExample: "(es) El Pentateuco con Rashí ▾",
		noTranslation: "Traducción: Sin traducción ▾",
		aht: "Link a AlHaTorah",
		deut: "Deuteronomio",
		heroCaption: "Escribe “shema israel” con tu teclado latino → encuentra el hebreo שְׁמַע יִשְׂרָאֵל al instante, sin internet",
		flowTitle: "Sin cambiar de teclado — una búsqueda en hebreo que simplemente te entiende",
		youType: "TÚ ESCRIBES",
		understands1: "TORAH VERSE INSERTER",
		understands2: "ENTIENDE",
		finds: "ENCUENTRA",
		note1: "las vocales son flexibles",
		note2: "yud · vav · álef opcionales",
		note3: "ignora el nikud al comparar",
		tooltip: "shin (sh/s)",
		legend1: "Haz clic en א para mostrar u ocultar el teclado hebreo — recuerda tu elección.",
		legend2: "Pasa el cursor sobre una tecla para ver su nombre y sonido.",
		legend3: "Haz clic en una tecla — la letra se escribe directo en tu búsqueda.",
		rtl: false,
	},
	he: {
		modalTitle: "הוספת פסוק",
		regularKb: "מקלדת רגילה ⌨️",
		translation: "תרגום:",
		versionExample: "(en) The Koren Jerusalem Bible ▾",
		noTranslation: "תרגום: ללא תרגום ▾",
		aht: "קישור לעל־התורה",
		deut: "דברים",
		heroCaption: "הקלידו “shema israel” במקלדת לטינית ← מוצא את שְׁמַע יִשְׂרָאֵל מיד, ללא אינטרנט",
		flowTitle: "בלי להחליף מקלדת — חיפוש בעברית שפשוט מבין אתכם",
		youType: "אתם מקלידים",
		understands1: "TORAH VERSE INSERTER",
		understands2: "מבין",
		finds: "מוצא",
		note1: "התנועות גמישות",
		note2: "יוד · ואו · אלף אופציונליות",
		note3: "מתעלם מהניקוד בהתאמה",
		tooltip: "שין (sh/s)",
		legend1: "לחצו על א כדי להציג או להסתיר את המקלדת — הבחירה נשמרת.",
		legend2: "רחפו מעל מקש כדי לראות את שמו וצלילו.",
		legend3: "לחיצה על מקש מקלידה את האות ישירות בחיפוש.",
		rtl: true,
	},
	ar: {
		modalTitle: "إدراج آية",
		regularKb: "لوحة مفاتيح عادية ⌨️",
		translation: "الترجمة:",
		versionExample: "(en) The Koren Jerusalem Bible ▾",
		noTranslation: "الترجمة: بدون ترجمة ▾",
		aht: "رابط AlHaTorah",
		deut: "التثنية",
		heroCaption: "اكتب “shema israel” بلوحة مفاتيح لاتينية ← يجد العبرية שְׁמַע יִשְׂרָאֵל فورًا، دون إنترنت",
		flowTitle: "دون تبديل لوحة المفاتيح — بحث عبري يفهمك ببساطة",
		youType: "أنت تكتب",
		understands1: "TORAH VERSE INSERTER",
		understands2: "يفهم",
		finds: "يجد",
		note1: "الحركات مرنة",
		note2: "يود · واو · ألف اختيارية",
		note3: "يتجاهل النيقود عند المطابقة",
		tooltip: "شين (sh/s)",
		legend1: "انقر على א لإظهار أو إخفاء لوحة المفاتيح العبرية — يتذكر اختيارك.",
		legend2: "مرّر فوق أي مفتاح لرؤية اسمه وصوته.",
		legend3: "انقر على مفتاح — يُكتب الحرف مباشرة في بحثك.",
		rtl: true,
	},
	fr: {
		modalTitle: "Insérer un passouk",
		regularKb: "clavier normal ⌨️",
		translation: "Traduction :",
		versionExample: "(fr) Bible du Rabbinat ▾",
		noTranslation: "Traduction : Sans traduction ▾",
		aht: "Lien AlHaTorah",
		deut: "Deutéronome",
		heroCaption: "Tapez “shema israel” avec votre clavier latin → trouve l'hébreu שְׁמַע יִשְׂרָאֵל instantanément, hors ligne",
		flowTitle: "Sans changer de clavier — une recherche en hébreu qui vous comprend",
		youType: "VOUS TAPEZ",
		understands1: "TORAH VERSE INSERTER",
		understands2: "COMPREND",
		finds: "TROUVE",
		note1: "les voyelles sont flexibles",
		note2: "youd · vav · alef optionnels",
		note3: "le nikoud est ignoré",
		tooltip: "shin (sh/s)",
		legend1: "Cliquez sur א pour afficher ou masquer le clavier hébreu — votre choix est mémorisé.",
		legend2: "Survolez une touche pour voir son nom et son son.",
		legend3: "Cliquez sur une touche — la lettre s'écrit directement dans votre recherche.",
		rtl: false,
	},
	ru: {
		modalTitle: "Вставить пасук",
		regularKb: "обычная клавиатура ⌨️",
		translation: "Перевод:",
		versionExample: "(ru) Russian Torah translation ▾",
		noTranslation: "Перевод: Без перевода ▾",
		aht: "Ссылка AlHaTorah",
		deut: "Второзаконие",
		heroCaption: "Введите “shema israel” латиницей → мгновенно находит иврит שְׁמַע יִשְׂרָאֵל, офлайн",
		flowTitle: "Без переключения клавиатуры — поиск на иврите, который вас понимает",
		youType: "ВЫ ВВОДИТЕ",
		understands1: "TORAH VERSE INSERTER",
		understands2: "ПОНИМАЕТ",
		finds: "НАХОДИТ",
		note1: "гласные гибкие",
		note2: "йуд · вав · алеф опциональны",
		note3: "никуд игнорируется",
		tooltip: "шин (sh/s)",
		legend1: "Нажмите א, чтобы показать или скрыть ивритскую клавиатуру — выбор запоминается.",
		legend2: "Наведите на клавишу, чтобы увидеть её название и звук.",
		legend3: "Нажмите клавишу — буква сразу вводится в поиск.",
		rtl: false,
	},
	pt: {
		modalTitle: "Inserir pasuk",
		regularKb: "teclado normal ⌨️",
		translation: "Tradução:",
		versionExample: "(pt) Bíblia hebraica ▾",
		noTranslation: "Tradução: Sem tradução ▾",
		aht: "Link AlHaTorah",
		deut: "Deuteronômio",
		heroCaption: "Digite “shema israel” no teclado latino → encontra o hebraico שְׁמַע יִשְׂרָאֵל na hora, offline",
		flowTitle: "Sem trocar de teclado — uma busca em hebraico que simplesmente entende você",
		youType: "VOCÊ DIGITA",
		understands1: "TORAH VERSE INSERTER",
		understands2: "ENTENDE",
		finds: "ENCONTRA",
		note1: "as vogais são flexíveis",
		note2: "yud · vav · alef opcionais",
		note3: "ignora o nikud ao comparar",
		tooltip: "shin (sh/s)",
		legend1: "Clique em א para mostrar ou ocultar o teclado hebraico — ele lembra sua escolha.",
		legend2: "Passe o mouse sobre uma tecla para ver seu nome e som.",
		legend3: "Clique em uma tecla — a letra é digitada direto na sua pesquisa.",
		rtl: false,
	},
};

const FONT = `font-family="-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"`;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function hero(t) {
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 420" ${FONT}>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1e2a3a"/>
      <stop offset="1" stop-color="#16202e"/>
    </linearGradient>
  </defs>
  <rect width="860" height="420" rx="18" fill="url(#bg)"/>
  <rect x="70" y="36" width="720" height="348" rx="14" fill="#243348" stroke="#3b4f6b" stroke-width="1.5"/>
  <text x="100" y="78" font-size="21" font-weight="700" fill="#e8eef7">${esc(t.modalTitle)}</text>
  <rect x="100" y="96" width="660" height="46" rx="9" fill="#1a2433" stroke="#5b8def" stroke-width="2"/>
  <text x="118" y="126" font-size="20" fill="#e8eef7">shema israel</text>
  <rect x="252" y="104" width="2.5" height="30" fill="#5b8def"/>
  <text x="742" y="126" font-size="13" fill="#7e93b0" text-anchor="end">${esc(t.regularKb)}</text>
  <rect x="100" y="154" width="42" height="30" rx="6" fill="#2c3e57" stroke="#3b4f6b"/>
  <text x="121" y="175" font-size="16" font-weight="700" fill="#e8eef7" text-anchor="middle">א</text>
  <text x="158" y="174" font-size="13" fill="#7e93b0">${esc(t.translation)}</text>
  <rect x="238" y="154" width="240" height="30" rx="6" fill="#2c3e57" stroke="#3b4f6b"/>
  <text x="250" y="174" font-size="12.5" fill="#cdd9ea">${esc(t.versionExample)}</text>
  <rect x="496" y="160" width="16" height="16" rx="4" fill="#5b8def"/>
  <path d="M499.5 168 l3.5 3.5 l6 -7" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <text x="520" y="173" font-size="13" fill="#cdd9ea">${esc(t.aht)}</text>
  <rect x="100" y="200" width="660" height="78" rx="9" fill="#2d4364"/>
  <text x="118" y="226" font-size="13.5" font-weight="700" fill="#8fb4f7">${esc(t.deut)} 6:4</text>
  <text x="742" y="258" font-size="22" fill="#f3f7fc" text-anchor="start" direction="rtl">שְׁמַע יִשְׂרָאֵל יְהֹוָה אֱלֹהֵינוּ יְהֹוָה אֶחָד׃</text>
  <rect x="100" y="286" width="660" height="74" rx="9" fill="#1f2c3f"/>
  <text x="118" y="312" font-size="13.5" font-weight="700" fill="#6f87a8">${esc(t.deut)} 5:1</text>
  <text x="742" y="342" font-size="20" fill="#b9c8dd" text-anchor="start" direction="rtl">וַיִּקְרָא מֹשֶׁה אֶל־כׇּל־יִשְׂרָאֵל… שְׁמַע יִשְׂרָאֵל</text>
  <text x="430" y="404" font-size="13" fill="#8aa2c0" text-anchor="middle">${esc(t.heroCaption)}</text>
</svg>
`;
}

function flow(t) {
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 300" ${FONT}>
  <defs>
    <linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1e2a3a"/>
      <stop offset="1" stop-color="#16202e"/>
    </linearGradient>
    <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="#5b8def"/>
    </marker>
  </defs>
  <rect width="860" height="300" rx="18" fill="url(#bg2)"/>
  <text x="430" y="48" font-size="19" font-weight="700" fill="#e8eef7" text-anchor="middle">${esc(t.flowTitle)}</text>
  <rect x="56" y="86" width="220" height="92" rx="12" fill="#243348" stroke="#3b4f6b" stroke-width="1.5"/>
  <text x="166" y="114" font-size="12.5" fill="#7e93b0" text-anchor="middle" letter-spacing="1">${esc(t.youType)}</text>
  <text x="166" y="152" font-size="26" font-weight="700" fill="#f3f7fc" text-anchor="middle" font-family="ui-monospace, Menlo, monospace">bereshit</text>
  <line x1="284" y1="132" x2="334" y2="132" stroke="#5b8def" stroke-width="2.5" marker-end="url(#arr)"/>
  <rect x="342" y="86" width="220" height="92" rx="12" fill="#243348" stroke="#3b4f6b" stroke-width="1.5"/>
  <text x="452" y="108" font-size="11.5" fill="#7e93b0" text-anchor="middle" letter-spacing="0.5">${esc(t.understands1)}</text>
  <text x="452" y="123" font-size="11.5" fill="#7e93b0" text-anchor="middle" letter-spacing="0.5">${esc(t.understands2)}</text>
  <text x="452" y="156" font-size="24" font-weight="700" fill="#8fb4f7" text-anchor="middle">b · r · sh · t</text>
  <line x1="570" y1="132" x2="620" y2="132" stroke="#5b8def" stroke-width="2.5" marker-end="url(#arr)"/>
  <rect x="628" y="86" width="190" height="92" rx="12" fill="#2d4364" stroke="#5b8def" stroke-width="1.5"/>
  <text x="723" y="114" font-size="12.5" fill="#9db9e0" text-anchor="middle" letter-spacing="1">${esc(t.finds)}</text>
  <text x="723" y="154" font-size="27" font-weight="700" fill="#f3f7fc" text-anchor="middle">בְּרֵאשִׁית</text>
  <text x="166" y="216" font-size="12.5" fill="#8aa2c0" text-anchor="middle">${esc(t.note1)}</text>
  <text x="452" y="216" font-size="12.5" fill="#8aa2c0" text-anchor="middle">${esc(t.note2)}</text>
  <text x="723" y="216" font-size="12.5" fill="#8aa2c0" text-anchor="middle">${esc(t.note3)}</text>
  <text x="430" y="262" font-size="14" fill="#cdd9ea" text-anchor="middle">mayim → מַיִם&#160;&#160;&#160;·&#160;&#160;&#160;moshe → מֹשֶׁה&#160;&#160;&#160;·&#160;&#160;&#160;shema israel → שְׁמַע יִשְׂרָאֵל&#160;&#160;&#160;·&#160;&#160;&#160;torah → תּוֹרָה</text>
</svg>
`;
}

function keyboard(t) {
	const KEYS = [
		["א ב ג ד ה ו ז ח ט י".split(" "), 202],
		["כ ך ל מ ם נ ן ס ע פ".split(" "), 244],
		["ף צ ץ ק ר ש ת ־".split(" "), 286],
	];
	let keysSvg = "";
	for (const [letters, y] of KEYS) {
		let x = 632;
		for (const letter of letters) {
			const isShin = letter === "ש";
			keysSvg += `    <rect x="${x}" y="${y}" width="38" height="34" rx="6" fill="${isShin ? "#5b8def" : "#243348"}" stroke="${isShin ? "#8fb4f7" : "#3b4f6b"}"/><text x="${x + 19}" y="${y + 23}"${isShin ? ' font-weight="700" fill="#ffffff"' : ""}>${letter}</text>\n`;
			x -= 46;
		}
	}
	// leyenda: alineada a la derecha en idiomas RTL
	const legend = t.rtl
		? [1, 2, 3].map((n, i) => `  <circle cx="694" cy="${452 + i * 36}" r="11" fill="#f0a83d"/>
  <text x="694" y="${456.5 + i * 36}" font-size="13" font-weight="700" fill="#1e2a3a" text-anchor="middle">${n}</text>
  <text x="672" y="${457 + i * 36}" font-size="14.5" fill="#cdd9ea" text-anchor="end" direction="rtl">${esc(t["legend" + n])}</text>`).join("\n")
		: [1, 2, 3].map((n, i) => `  <circle cx="166" cy="${452 + i * 36}" r="11" fill="#f0a83d"/>
  <text x="166" y="${456.5 + i * 36}" font-size="13" font-weight="700" fill="#1e2a3a" text-anchor="middle">${n}</text>
  <text x="188" y="${457 + i * 36}" font-size="14.5" fill="#cdd9ea">${esc(t["legend" + n])}</text>`).join("\n");

	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 560" ${FONT}>
  <defs>
    <linearGradient id="bg3" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1e2a3a"/>
      <stop offset="1" stop-color="#16202e"/>
    </linearGradient>
    <marker id="arr3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="#f0a83d"/>
    </marker>
  </defs>
  <rect width="860" height="560" rx="18" fill="url(#bg3)"/>
  <rect x="150" y="36" width="560" height="380" rx="14" fill="#243348" stroke="#3b4f6b" stroke-width="1.5"/>
  <text x="180" y="72" font-size="19" font-weight="700" fill="#e8eef7">${esc(t.modalTitle)}</text>
  <rect x="180" y="88" width="500" height="42" rx="9" fill="#1a2433" stroke="#5b8def" stroke-width="2"/>
  <text x="660" y="116" font-size="19" fill="#e8eef7" text-anchor="start" direction="rtl">ש</text>
  <rect x="638" y="96" width="2.5" height="26" fill="#5b8def"/>
  <rect x="180" y="146" width="42" height="30" rx="6" fill="#2c3e57" stroke="#f0a83d" stroke-width="2"/>
  <text x="201" y="167" font-size="16" font-weight="700" fill="#e8eef7" text-anchor="middle">א</text>
  <text x="238" y="166" font-size="13" fill="#7e93b0">${esc(t.noTranslation)}</text>
  <circle cx="224" cy="144" r="11" fill="#f0a83d"/>
  <text x="224" y="148.5" font-size="13" font-weight="700" fill="#1e2a3a" text-anchor="middle">1</text>
  <rect x="180" y="190" width="500" height="160" rx="9" fill="#1a2433" stroke="#3b4f6b"/>
  <g font-size="17" fill="#e8eef7" text-anchor="middle">
${keysSvg}  </g>
  <rect x="367" y="324" width="108" height="24" rx="6" fill="#0f1722" stroke="#5b8def"/>
  <text x="421" y="340" font-size="12.5" fill="#cdd9ea" text-anchor="middle">${esc(t.tooltip)}</text>
  <circle cx="487" cy="336" r="11" fill="#f0a83d"/>
  <text x="487" y="340.5" font-size="13" font-weight="700" fill="#1e2a3a" text-anchor="middle">2</text>
  <path d="M 421 282 C 580 240, 655 190, 648 136" fill="none" stroke="#f0a83d" stroke-width="2.2" stroke-dasharray="6 5" marker-end="url(#arr3)"/>
  <circle cx="601" cy="212" r="11" fill="#f0a83d"/>
  <text x="601" y="216.5" font-size="13" font-weight="700" fill="#1e2a3a" text-anchor="middle">3</text>
${legend}
</svg>
`;
}

let count = 0;
for (const [lang, t] of Object.entries(S)) {
	const dir = lang === "en" ? OUT : join(OUT, lang);
	mkdirSync(dir, { recursive: true });
	writeFileSync(join(dir, "hero.svg"), hero(t));
	writeFileSync(join(dir, "translit-flow.svg"), flow(t));
	writeFileSync(join(dir, "keyboard.svg"), keyboard(t));
	count += 3;
	console.log(`${lang}: hero + translit-flow + keyboard ✅`);
}
console.log(`\n✅ ${count} imágenes generadas`);
