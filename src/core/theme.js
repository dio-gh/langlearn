export const themePreferences = Object.freeze(["auto", "light", "dark"]);

function validTheme(value) {
  return themePreferences.includes(value) ? value : "auto";
}

export class ThemeController {
  constructor(
    store,
    root = document.documentElement,
    media = window.matchMedia("(prefers-color-scheme: dark)"),
    meta = document.querySelector('meta[name="theme-color"]'),
  ) {
    this.store = store;
    this.root = root;
    this.media = media;
    this.meta = meta;
    this.control = null;
    this.onSystemChange = () => {
      if (this.preference === "auto") this.apply();
    };
    this.media.addEventListener?.("change", this.onSystemChange);
    this.apply();
  }

  get preference() {
    return validTheme(this.store.state.settings.theme);
  }

  get resolved() {
    return this.preference === "auto"
      ? (this.media.matches ? "dark" : "light")
      : this.preference;
  }

  set(value) {
    const preference = validTheme(value);
    this.store.update((state) => {
      state.settings.theme = preference;
    });
    this.apply();
  }

  bind(control) {
    this.control = control;
    control.value = this.preference;
    control.addEventListener("change", () => this.set(control.value));
  }

  apply() {
    const preference = this.preference;
    if (preference === "auto") delete this.root.dataset.theme;
    else this.root.dataset.theme = preference;
    this.root.style.colorScheme = this.resolved;
    if (this.control) this.control.value = preference;
    if (this.meta) {
      this.meta.content = this.resolved === "dark" ? "#1f2b25" : "#f4f2ec";
    }
  }
}
