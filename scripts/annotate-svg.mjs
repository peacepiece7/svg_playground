import { readFileSync, writeFileSync } from "node:fs";

const sourcePath = new URL("../public/vectorized.svg", import.meta.url);
const outputPath = new URL("../public/vectorized-animated.svg", import.meta.url);
const source = readFileSync(sourcePath, "utf8");

// 브라우저의 getBBox()와 시각 검증으로 실제 별 path임을 확인한 인덱스입니다.
const stars = new Map([
  [401, "native-spark-left"],
  [405, "native-spark-center"],
]);

// 책에서 떠오르는 실제 종잇조각과 파편의 밝은 면 path입니다.
const papers = new Map([
  [294, "native-paper-01"], [307, "native-paper-02"], [320, "native-paper-03"],
  [555, "native-paper-04"], [582, "native-paper-05"], [682, "native-paper-06"],
  [727, "native-paper-07"], [817, "native-paper-08"], [835, "native-paper-09"],
  [844, "native-paper-10"],
]);

let pathIndex = -1;
let animated = source.replace(/<path\b[^>]*>/g, (tag) => {
  pathIndex += 1;
  if (stars.has(pathIndex)) return tag.replace("<path", `<path id="${stars.get(pathIndex)}" class="native-spark"`);
  if (papers.has(pathIndex)) return tag.replace("<path", `<path id="${papers.get(pathIndex)}" class="native-paper" style="--paper-index:${papers.size - pathIndex % papers.size}"`);
  return tag;
});

const styles = `<style>
  /* 원본 SVG 내부의 별 path 자체를 확대·회전·발광시킵니다. */
  .native-spark { transform-box: fill-box; transform-origin: center; animation: nativeSparkle 2.2s ease-in-out infinite; filter: drop-shadow(0 0 5px #b784ff); }
  #native-spark-center { animation-delay: .65s; }
  @keyframes nativeSparkle { 0%,100% { transform: scale(.72) rotate(0deg); opacity:.45; } 48% { transform: scale(1.28) rotate(42deg); opacity:1; fill:#e7d9ff; } }

  /* 원본 종잇조각 path를 위로 띄우고 살짝 흔듭니다. */
  .native-paper { transform-box: fill-box; transform-origin: center; animation: nativePaperFloat 3.4s ease-in-out infinite; animation-delay: calc(var(--paper-index) * -.24s); }
  @keyframes nativePaperFloat { 0%,100% { transform: translate(0,0); } 50% { transform: translate(5px,-13px) rotate(7deg); opacity:.62; } }
  .is-paused * { animation-play-state: paused !important; }
</style>`;

animated = animated.replace(/(<svg\b[^>]*>)/, `$1${styles}`);
writeFileSync(outputPath, animated);
console.log(`원본 path ${pathIndex + 1}개 중 별 ${stars.size}개, 종잇조각 ${papers.size}개에 ID를 추가했습니다.`);
