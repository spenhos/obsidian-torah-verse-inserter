import { App, Editor, Plugin, PluginSettingTab, Setting } from "obsidian";
import { PasukModal } from "./modal";
import { initI18n, t } from "./i18n";

export interface PasukSettings {
	includeNikud: boolean;
	includeTeamim: boolean;
	quoteFormat: boolean;
	maxResults: number;
	fontCompat: boolean;
}

const DEFAULT_SETTINGS: PasukSettings = {
	includeNikud: true,
	includeTeamim: false,
	quoteFormat: true,
	maxResults: 30,
	fontCompat: true,
};

const GITHUB_URL = "https://github.com/spenhos/obsidian-pasuk";
const KOFI_URL = "https://ko-fi.com/elevalma";

export default class PasukPlugin extends Plugin {
	settings: PasukSettings;

	async onload() {
		await this.loadSettings();
		initI18n();

		this.addCommand({
			id: "insert-verse",
			name: t("cmdInsert"),
			editorCallback: (editor: Editor) => {
				new PasukModal(this.app, editor, this.settings).open();
			},
		});

		this.addSettingTab(new PasukSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		const data = (await this.loadData()) as Partial<PasukSettings> | null;
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class PasukSettingTab extends PluginSettingTab {
	plugin: PasukPlugin;

	constructor(app: App, plugin: PasukPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		const s = this.plugin.settings;
		const save = () => void this.plugin.saveSettings();

		new Setting(containerEl).setName(t("settings")).setHeading();

		new Setting(containerEl)
			.setName(t("includeNikud"))
			.setDesc(t("includeNikudDesc"))
			.addToggle((tg) =>
				tg.setValue(s.includeNikud).onChange((v) => {
					s.includeNikud = v;
					save();
				})
			);

		new Setting(containerEl)
			.setName(t("includeTeamim"))
			.setDesc(t("includeTeamimDesc"))
			.addToggle((tg) =>
				tg.setValue(s.includeTeamim).onChange((v) => {
					s.includeTeamim = v;
					save();
				})
			);

		new Setting(containerEl)
			.setName(t("quoteFormat"))
			.setDesc(t("quoteFormatDesc"))
			.addToggle((tg) =>
				tg.setValue(s.quoteFormat).onChange((v) => {
					s.quoteFormat = v;
					save();
				})
			);

		new Setting(containerEl)
			.setName(t("fontCompat"))
			.setDesc(t("fontCompatDesc"))
			.addToggle((tg) =>
				tg.setValue(s.fontCompat).onChange((v) => {
					s.fontCompat = v;
					save();
				})
			);

		new Setting(containerEl)
			.setName(t("maxResults"))
			.setDesc(t("maxResultsDesc"))
			.addText((txt) =>
				txt.setValue(String(s.maxResults)).onChange((v) => {
					const n = parseInt(v, 10);
					if (!isNaN(n) && n > 0) {
						s.maxResults = n;
						save();
					}
				})
			);

		new Setting(containerEl).setName(t("support")).setHeading();

		new Setting(containerEl)
			.setName(t("supportBtn"))
			.setDesc(t("supportDesc"))
			.addButton((button) => {
				button
					.setButtonText("☕ " + t("supportBtn"))
					.onClick(() => window.open(KOFI_URL, "_blank"));
				button.buttonEl.addClass("pasuk-kofi-btn");
				return button;
			});

		const about = containerEl.createDiv({ cls: "pasuk-about" });
		about.createSpan({ text: `Pasuk v${this.plugin.manifest.version} · ` });
		const gh = about.createEl("a", { text: t("viewGithub"), href: GITHUB_URL });
		gh.setAttr("target", "_blank");
		about.createSpan({ text: " · " });
		const issue = about.createEl("a", { text: t("reportIssue"), href: GITHUB_URL + "/issues" });
		issue.setAttr("target", "_blank");
	}
}
