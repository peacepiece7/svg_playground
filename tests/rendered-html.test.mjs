import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("animated SVG contains the selected original paths and squiggle filter", async () => {
  const svg = await readFile(new URL("../public/vectorized-animated.svg", import.meta.url), "utf8");

  assert.match(svg, /id="native-spark-left"/);
  assert.match(svg, /id="native-spark-center"/);
  assert.equal((svg.match(/class="native-paper"/g) ?? []).length, 10);
  assert.match(svg, /<feTurbulence[^>]+baseFrequency="0\.012"/);
  assert.match(svg, /<feDisplacementMap id="squiggle-displacement"/);
  assert.match(svg, /<g id="native-artwork" filter="url\(#squiggle-filter\)"/);
});

test("page exposes the SVG playback and filter controls", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /vectorized-animated\.svg/);
  assert.match(page, /스퀴글 \{squiggle \? "끄기" : "켜기"\}/);
  assert.match(page, /type="range"/);
  assert.match(page, /squiggle-displacement/);
});
