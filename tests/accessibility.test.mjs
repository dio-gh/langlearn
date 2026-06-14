import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "..");
const css = readFileSync(resolve(root, "styles.css"), "utf8");
const html = readFileSync(resolve(root, "index.html"), "utf8");

function color(name) {
  const match = css.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i"));
  assert.ok(match, name);
  return match[1];
}

function luminance(hex) {
  const channels = hex.slice(1).match(/../g)
    .map((value) => Number.parseInt(value, 16) / 255)
    .map((value) => value <= 0.04045
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(left, right) {
  const first = luminance(left);
  const second = luminance(right);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

test("light and dark text tokens meet WCAG 2.2 AA contrast", () => {
  for (const theme of ["light", "dark"]) {
    for (const background of ["bg", "surface"]) {
      for (const foreground of ["text", "muted", "subtle", "accent", "good", "bad", "warning"]) {
        assert.ok(
          contrast(color(`${theme}-${foreground}`), color(`${theme}-${background}`)) >= 4.5,
          `${theme} ${foreground}/${background}`,
        );
      }
    }
  }
});

test("borders and focus indicators meet non-text contrast", () => {
  for (const theme of ["light", "dark"]) {
    assert.ok(contrast(color(`${theme}-border`), color(`${theme}-bg`)) >= 3);
    assert.ok(contrast(color(`${theme}-border`), color(`${theme}-surface-2`)) >= 3);
    assert.ok(contrast(color(`${theme}-focus`), color(`${theme}-bg`)) >= 3);
    assert.ok(contrast(color(`${theme}-focus`), color(`${theme}-surface`)) >= 3);
  }
});

test("themes, labeled modes, and focus treatment are present", () => {
  assert.match(css, /prefers-color-scheme:\s*dark/);
  assert.match(css, /\[data-theme="dark"\]/);
  assert.match(css, /outline:\s*3px solid var\(--focus\)/);
  assert.match(html, /<option value="auto">Auto<\/option>/);
  assert.match(html, /<option value="light">Light<\/option>/);
  assert.match(html, /<option value="dark">Dark<\/option>/);
  assert.doesNotMatch(html, /sound|mute/i);
  assert.match(css, /\.mode-button\s*\{[\s\S]*?min-height:\s*36px/);
  assert.match(css, /\.answer\s*\{[\s\S]*?min-height:\s*40px/);
});
