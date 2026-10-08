# SVG Motion Playground

복잡하게 벡터화된 SVG를 분석하고, 원본 path 애니메이션과 SVG 필터 효과를 실험하는 React playground입니다.

## 현재 상태

2026-10-08 기준 화면과 SVG 생성 기능은 구현되어 있습니다. Node 22에서 빌드와 기존 테스트 2개가 통과하며, 개발 서버와 프로덕션 서버의 HTML·SVG 응답을 확인했습니다.

**외부 호출용 API는 아직 구현되지 않았습니다.** `examples/d1/app/api/notes/route.ts`는 실행되지 않는 예제이며 `/api/notes`는 로컬에서 `404`입니다. 배포본은 소유자에게만 접근이 허용되고, 인증 없는 외부 요청은 `401`입니다.

자세한 검증 결과와 남은 작업은 [진행 상태 및 API 리뷰](docs/status-review.md)를 참고하세요.

## 주요 기능

- 8,256개의 익명 path 중 별과 종잇조각 후보에 재사용 가능한 ID 부여
- 원본 별 path의 확대·회전·발광 애니메이션
- 원본 종잇조각 path의 부유 애니메이션
- `feTurbulence`와 `feDisplacementMap`을 조합한 스퀴글 비전 효과
- 스퀴글 토글, 뒤틀림 강도 조절, 일시정지 및 처음부터 재생
- 효과 생성 과정과 동작을 설명하는 한글 코드 주석

## 실행

Node.js 22.13 이상이 필요합니다. 점검에는 Node 22.14.0을 사용했습니다. 먼저 `node --version`을 확인하세요. nvm 사용 시 `nvm use 22`로 전환합니다.

```bash
npm ci
npm run dev
```

기본 개발 주소는 `http://localhost:3000`이며 다른 기기에서 접속하려면 호스트를 명시합니다.

```bash
npm run dev -- --hostname 0.0.0.0 --port 3000
```

같은 네트워크에서는 `http://<서버의 LAN IP>:3000`으로 접속합니다. 호스트 바인딩은 인터넷 공개나 배포본의 접근 권한 변경을 의미하지 않습니다.

프로덕션 빌드와 실행:

```bash
npm run build
npm start -- --port 3001
```

`npm start`는 기본적으로 `0.0.0.0`에 바인딩합니다. 로컬 접속만 필요하면 `--hostname 127.0.0.1`을 추가합니다. 현재 빌드는 vinext와 Cloudflare Worker 구성이며, 배포 프로젝트 설정은 `.openai/hosting.json`에 있습니다.

검사:

```bash
npm test
npm run lint
npx tsc --noEmit --incremental false
```

`npm test`는 빌드 후 SVG·페이지 소스 문자열을 검사합니다. 실제 브라우저나 HTTP 통합 테스트는 포함하지 않습니다. 현재 lint는 SVG fallback `<img>` 경고 1개, TypeScript 검사는 Cloudflare 런타임 타입 누락으로 실패합니다.

## API와 데이터베이스

- 활성 라우트는 `app/page.tsx`의 `/`이며 `app/api`는 없습니다.
- `/vectorized.svg`, `/vectorized-animated.svg`는 정적 SVG 자산입니다.
- 화면 제어는 React 상태와 `<object>` 내부 SVG DOM을 변경하며 API를 호출하지 않습니다.
- `.openai/hosting.json`의 `d1`, `r2`는 모두 `null`이고 `db/schema.ts`는 비어 있습니다.
- `app/chatgpt-auth.ts`는 플랫폼 인증 헤더용 헬퍼입니다. 현재 호출하는 화면·API는 없고 외부 클라이언트용 API 키 인증도 없습니다.

외부 API를 제공하려면 실제 라우트와 응답 계약, 인증 방식, 배포 접근 정책을 먼저 정해야 합니다. 다른 출처의 브라우저에서 호출하려면 CORS와 OPTIONS 응답도 필요합니다. 예제 notes API를 활성화할 경우 D1 바인딩·테이블·마이그레이션과 입력 검증도 함께 구현해야 합니다.

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

현재 소유자 전용 접근 정책입니다. 인증 없는 curl 요청으로 화면·SVG·API를 사용할 수 없습니다. 배포본의 인증된 화면 동작은 이번 로컬 검증과 별개입니다.
