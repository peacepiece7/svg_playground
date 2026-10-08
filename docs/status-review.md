# SVG Motion Playground 진행 상태와 외부 API 리뷰

검증일: 2026-10-08 KST. 검증 대상: 커밋 `3b07258`의 로컬 코드와 현재 배포 접근 설정. 애플리케이션 코드와 배포 권한은 변경하지 않았습니다.

화면과 SVG 생성 파이프라인은 동작합니다. 외부 호출용 API는 미구현이고 배포본도 소유자 전용이므로, 외부 API 제공 준비는 완료되지 않았습니다.

## 구현 상태

| 기능 | 상태 | 근거 |
| --- | --- | --- |
| 원본 SVG 분석 및 재생성 | 구현 | `scripts/annotate-svg.mjs`: 별 2개·종잇조각 10개에 ID 부여 |
| 원본 path 애니메이션 | 구현 | 생성 SVG에 CSS 애니메이션과 필터 포함 |
| 재생·스퀴글·강도·다시 재생 UI | 구현 | Chrome에서 토글 상태, 강도 3.5→5.0, object 재생성 확인 |
| JSON API | 미구현 | `app/api` 없음, `/api/notes` 로컬 404 |
| D1 및 R2 | 비활성 | 호스팅 바인딩 null, DB 스키마 비어 있음 |
| 외부 API 인증 및 CORS | 미구현 | 활성 API 및 관련 처리 없음 |
| 배포 사이트 | active | Sites 조회: 최신 버전 4, 소유자 전용 custom 접근 정책 |

화면 데이터 흐름은 `/` → `/vectorized-animated.svg` 로딩 → React 상태 변경 → SVG DOM 갱신입니다. 서버 API나 DB를 거치지 않습니다. `worker/index.ts`의 `/_vinext/image`는 프레임워크 이미지 최적화 경로로, 프로젝트의 업무 API가 아닙니다.

## 실행 검증

점검 시작 시 프로젝트 서버는 실행 중이지 않았습니다. 기본 셸의 Node는 20.19.0으로 요구 버전보다 낮아, 이미 설치된 Node 22.14.0으로 아래 검사를 실행했습니다.

| 검사 | 결과 | 상세 |
| --- | --- | --- |
| `npm test` | 통과 | 프로덕션 빌드 성공, 테스트 2개 통과 |
| `npm run lint` | 경고 | 오류 0개, `app/page.tsx` fallback img 경고 1개 |
| `npx tsc --noEmit --incremental false` | 실패 | `cloudflare:workers`, `Fetcher`, `D1Database` 타입 누락 |
| 개발 서버 3000 | 정상 | `/` 200, SVG 200 / image/svg+xml |
| 개발 서버 LAN 바인딩 | 정상 | `--hostname 0.0.0.0` 실행 후 LAN IP에 대한 HTTP 요청 200 |
| 프로덕션 서버 3001 | 정상 | `npm start -- --port 3001`, `/`와 SVG 200 |
| `/api/notes` GET | 미구현 | 개발·프로덕션 모두 404 / HTML |
| 개발 서버 외부 Origin OPTIONS | 거부 | Origin `https://example.com`, `/api/notes` 403 |
| 프로덕션 외부 Origin OPTIONS | 라우트 없음 | `/api/notes` 404, Access-Control-Allow-Origin 없음 |
| 배포본 인증 없는 요청 | 접근 제한 | `/`, `/api/notes`, SVG 모두 401 |

LAN 검사는 동일 컴퓨터에서 자신의 LAN IP로 호출한 결과입니다. 별도 기기·공유기·방화벽·인터넷 경로의 접근 가능 여부까지 입증하지 않습니다. 개발 서버의 403은 개발용 Origin 제한이며, 배포 API의 CORS 검증 결과로 해석하면 안 됩니다.

배포 URL: https://svg-motion-playground.scv7282.chatgpt.site

배포본의 401은 플랫폼 접근 제한에서 나온 응답이므로 API 라우트 존재 여부를 증명하지 않습니다. 활성 API 부재는 로컬 라우트 구조와 프로덕션 서버 404로 확인했습니다. 인증된 배포 화면과 Worker의 실제 처리 상태는 이번 점검에서 검증하지 않았습니다.

## 리뷰 발견 사항

1. **외부 API의 첫 경계가 없음.** `examples/d1/app/api/notes/route.ts`는 `app` 밖의 참고 코드입니다. CORS만 추가하거나 사이트 접근 권한만 공개로 바꾸어도 API가 생기지 않습니다. 필요한 작업·메서드·요청/응답을 정의한 뒤 활성 라우트를 구현해야 합니다.
2. **TypeScript 검사가 실패함.** Worker 코드와 DB 헬퍼에서 Cloudflare 타입이 필요하지만 프로젝트에 런타임 타입 선언이 없습니다. 실제 Worker 구성에 맞는 타입을 생성·포함한 뒤 typecheck를 필수 검사로 추가하는 것이 다음 작업입니다. 현재 빌드 성공은 타입 검사 통과를 뜻하지 않습니다.
3. **정지 제어 범위가 불완전함.** 코드상 `.is-paused *`는 CSS 애니메이션만 멈춥니다. 필터의 `<animate attributeName="seed">`는 SMIL이므로 `pauseAnimations()` / `unpauseAnimations()`도 연결해야 전체 효과가 정지합니다. 브라우저에서는 버튼 상태 전환을 확인했으며 SMIL의 실제 정지 여부는 별도 계측하지 않았습니다.
4. **테스트 범위가 이름보다 좁음.** `tests/rendered-html.test.mjs`는 파일의 문자열만 검사합니다. 서버 응답·브라우저 상태 동기화·필터 정지는 검증하지 않으므로, 실제 HTML 렌더링 통과로 해석하면 안 됩니다.
5. **스타터 코드와 과거 효과가 남아 있음.** 비활성 DB 예제·인증 헬퍼와 `app/globals.css`의 오버레이 효과가 남아 있습니다. `app/layout.tsx` 및 배포 설명도 이전 폭죽 실험을 설명합니다. 현재 화면은 원본 path 실험이므로 다음 정리에서 사용 코드와 설명을 맞출 수 있습니다.

## 외부 API 준비를 위한 순서

1. 외부에서 필요한 기능을 확정합니다. 현재 SVG 파일 제공만 필요한지, SVG 변환·저장·조회 API가 필요한지에 따라 구현이 달라집니다.
2. 실제 `app/api/.../route.ts`에 요청 검증, JSON 오류, 허용 메서드와 응답 계약을 구현합니다. notes 예제를 사용한다면 문자열이 아닌 title/content와 잘못된 JSON을 명시적으로 처리해야 합니다.
3. 인증 방식과 배포 접근 정책을 맞춥니다. 현재 ChatGPT 인증 헤더 헬퍼를 외부 클라이언트의 API 키 검증으로 사용할 수 없습니다. 접근 대상 확대는 인증·데이터 범위를 정한 뒤 진행합니다.
4. 브라우저 호출이 필요하면 허용 Origin, 메서드, 헤더에 맞춘 CORS와 OPTIONS를 구현합니다. curl·서버 간 호출도 라우트와 인증은 필요하지만 브라우저 CORS 적용 대상은 아닙니다.
5. 저장 기능이 필요할 때 D1 바인딩과 실제 스키마를 설정하고 마이그레이션을 적용합니다.
6. 배포 후 인증 성공·실패, 잘못된 입력, GET/POST/OPTIONS 응답을 외부 클라이언트에서 검증합니다.

## 재현 명령

Node 22.13 이상에서 실행합니다.

```bash
npm ci
npm test
npm run lint
npx tsc --noEmit --incremental false
npm run dev -- --hostname 0.0.0.0 --port 3000
```

다른 터미널에서:

```bash
curl -i http://localhost:3000/
curl -I http://localhost:3000/vectorized-animated.svg
curl -i http://localhost:3000/api/notes
curl -i -X OPTIONS http://localhost:3000/api/notes \
  -H 'Origin: https://example.com' \
  -H 'Access-Control-Request-Method: GET'
```

프로덕션 실행 확인은 `npm run build` 후 `npm start -- --port 3001`로 수행하고 위 명령의 포트를 3001로 바꿉니다. 이번 점검용 개발·프로덕션 프로세스는 확인 후 종료하며, 상시 운영 서비스로 등록하지 않습니다.
