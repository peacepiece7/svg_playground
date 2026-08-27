# SVG Motion Playground

복잡하게 벡터화된 SVG를 분석하고, 원본 path 애니메이션과 SVG 필터 효과를 실험하는 React playground입니다.

## 주요 기능

- 8,256개의 익명 path 중 별과 종잇조각 후보에 재사용 가능한 ID 부여
- 원본 별 path의 확대·회전·발광 애니메이션
- 원본 종잇조각 path의 부유 애니메이션
- `feTurbulence`와 `feDisplacementMap`을 조합한 스퀴글 비전 효과
- 스퀴글 토글, 뒤틀림 강도 조절, 일시정지 및 처음부터 재생
- 효과 생성 과정과 동작을 설명하는 한글 코드 주석

## 실행

Node.js 22.13 이상이 필요합니다.

```bash
npm install
npm run dev
```

프로덕션 빌드와 테스트:

```bash
npm test
```

## SVG 재생성

`public/vectorized.svg`에서 ID와 필터가 포함된 `public/vectorized-animated.svg`를 다시 생성합니다.

```bash
npm run svg:annotate
```

선택된 path 인덱스와 삽입되는 SVG 필터는 `scripts/annotate-svg.mjs`에서 확인할 수 있습니다. 원본 SVG가 변경되면 path 순서가 달라질 수 있으므로 브라우저의 `getBBox()`를 이용해 후보를 다시 검증해야 합니다.

## 효과 구조

```text
vectorized.svg
  → path 후보에 ID/class 부여
  → 전체 path를 하나의 <g>로 래핑
  → feTurbulence로 노이즈 생성
  → feDisplacementMap으로 원본 픽셀 변위
  → vectorized-animated.svg
```

## 배포본

[SVG Motion Playground](https://svg-motion-playground.scv7282.chatgpt.site)
