# 게임 코드 지도

index.html은 화면 구조, styles/game.css는 화면 디자인이다. 40개 기능 소스와
시작 오류 처리 파일을 runtime-manifest.json 순서로 합쳐 runtime.js 하나를 제공한다.
기존 IIFE·함수 호이스팅·초기화 순서를 유지하며 별도 npm 패키지가 필요 없다.
브라우저에서 수십 개 스크립트를 차례로 요청하지 않는다. 빌드 단계의 기능 모듈화이며
현재 모듈은 내부 상태를 공유한다. 독립 ES 모듈로 전환한 것은 아니다.

## 요청별 최소 탐색 범위

| 요청 | 먼저 읽을 game/src 파일 | 필요할 때 추가 | 검사 그룹 |
|---|---|---|---|
| 튜토리얼·새로고침 | tutorial.js | agents.js의 dropAt, save-progression.js | tutorial |
| 이동·탭·벽 충돌 | input.js, movement.js | agents.js의 findPath, sites.js, defence.js | movement |
| 가게 일손·단골 | customers.js, upgrades.js | save-progression.js의 shopStaff, render-market.js | shop |
| 발판·울타리 수리 | pads.js | defence.js, upgrades.js, input.js | movement |
| 저장·마을 해금 | save-progression.js | world.js, sites.js, upgrades.js | all |
| 채집·일꾼·납품 | agents.js, sites.js | gear-economy.js, movement.js | all |
| 벨트·생산·트럭 | conveyors.js, production.js | goods.js, upgrades.js, render-logistics.js | all |
| 곰·전투·방어 | raids.js, combat.js, defence.js | ending.js, save-progression.js | combat |
| 인트로·대사 | film-player.js, story-intro.js, game/intro-scenes.js | loop.js, game/styles/game.css | story |
| 모바일·줌 | viewport.js, input.js | loop.js, panels.js, game/styles/game.css | movement |
| 도감·일일 과제·레이더 | panels.js | goods.js, input.js, render-scene.js | all |
| 그림·색감·애니메이션 | art-palette.js, render-motion3d.js, 해당 render-*.js | render-primitives.js, effects.js | all + 관련 browser 검사 |
| 프레임·정지 | loop.js | ambient.js, 해당 update 함수 모듈 | movement |
| 음악·효과음 | audio.js | input.js | all |

```sh
node scripts/game-code.cjs --list
node scripts/game-code.cjs tutorial
node scripts/game-code.cjs --symbol findPath
rg -n 'findPath|goTile' game/src/agents.js game/src/input.js
node scripts/build-game.cjs
node tests/run-code.cjs movement
node scripts/build-game.cjs --check
```

game-code는 파일·크기·함수/변수의 행번호만 출력한다. module-map.json은 자동 생성된
색인이다. 최상위 함수와 각 var 선언의 첫 변수만 색인하므로 다른 이름은 관련 소스에서
rg로 찾는다. 브라우저 개발자 도구는 runtime.js.map으로 원본 모듈 위치를 표시한다.

## 계속 확장할 마을과 후속 버전

현재 세 마을의 고정 좌표·규칙은 보존했다. 이번 분리는 마을 4 구현이 아니다.
확장 시 아래 묶음을 순서대로 처리하며 무관한 모듈은 재검토하지 않는다.

1. 저장/해금: save-progression.js의 STAGE_W, GOALS, areaW, expandStage,
   구형 저장 복원, HV/HPOW/HNAME. 현재 Math.min(3, ...) 경계가 있다.
   기존 ID는 재사용하지 말고 선택 필드를 추가한다. 필요할 때 SAVE_VER와 이관을 변경한다.
2. 지도/자원: world.js의 GC/MX/worldX, sites.js의 SITES/SITE, market-config.js,
   conveyors.js, production.js의 좌표·생산 연결을 함께 확장한다.
3. 가격/고용/방어: upgrades.js, pads.js, defence.js의 villageAt·탑·벽·사냥꾼.
   ambient.js와 panels.js에는 세 마을 시간/과제 배열이 있으므로 새 단계 기본값을 명시한다.
4. 이야기/엔딩: story-intro.js에 새 장을 추가하고 ending.js의 allMaxed/보스 조건을
   제품 결정에 따라 유지/확장한다. 기존 읽음·엔딩 기록을 지우지 않는다.
5. 표현/검증: 해당 render 모듈만 변경한다. 구형/새 저장·잠금/해금·경계 이동·
   발판·가격·최종 조건을 검사하고 실제 화면·기기 검증을 별도로 진행한다.

다음 확장에서는 이 고정값을 검증된 마을 정의 데이터로 순차 이전한다.
아직 사용하지 않는 마을 JSON을 중복 유지하지 않는다. 후속 버전은 같은 소스/빌드를
재사용하고 차이를 해당 모듈에 한정한다. 저장 키 분리·새 제품·엔딩은 호환 정책과 검사부터 정한다.

## 빌드와 검증

- tests/run-code.cjs 그룹: all, tutorial, story, shop, movement, village, combat.
- 방어 손상은 선택 필드 S.defenseState로 저장한다. 새 진행 플래그는 런타임 실체 유실 시 복구 경로를 함께 검사한다.
- build-game.cjs --check는 오래된 번들·소스맵·색인·캐시 버전을 실패 처리한다.
- HTML의 runtime/CSS URL은 내용 해시를 포함해 변경 뒤 이전 캐시를 피한다.
- tests/static-server.cjs는 실제 JS/CSS/이미지를 제공한다. 모든 요청에 HTML을 반환하지 않는다.
- 업로드 시 index.html, runtime.js, runtime.js.map, styles/, src/, manifest와 색인을 함께 보존한다.
- 코드 검사 통과는 실기기·경제 균형·전체 보스 플레이 통과가 아니다.

3D 모션은 render-motion3d.js의 정점/투영/광원/관절과 시설 회전 부품에서 조정한다. Canvas 출력의 소프트웨어 3D이며 WebGL 엔진은 아니다. 표현 함수는 저장/시뮬레이션 상태를 수정하지 않는다. 움직임 감소 설정은 장식 모션을 멈춘다.

이미지 연출은 film-player.js 하나에서 관리한다. 확정 인트로 4장/엔딩 3장은 intro-scenes.js 데이터로 분리하며 엔딩은 필요할 때만 로드한다. 엔딩 완료 저장 부팅은 이미지 재생을 건너뛰고 트로피 화면을 복원한다.

Claude 원천 에셋 표현은 sprite-atlas.js에서 관리한다. sprite-data.js는 build-game.cjs가 atlas.json/WebP 내용 해시에서 생성하며 직접 수정하지 않는다. sprites는 화면에서 필요할 때 2개 동시 로드, 실패 시 기존 렌더 fallback. 상위 특수 외형과 상품·가방·HP·강화 오버레이를 함께 보존한다.

Claude 원천 에셋 카탈로그는 art-source/gpt/asset-catalog.json. 원본 48종과 슈퍼 일꾼 몸체 파생 2종은 game/assets/sprites에 있으며 sprite-data는 빌드가 atlas/이미지 해시에서 생성한다. 슈퍼 몸체는 원본 모델의 팔/도구를 숨기고 기존 Canvas 팔로 큰 도끼/전체 호수 그물을 잡는다. 차량의 Lv 표시, 손님 요청/인내/단골 표시, 창고 재고는 기존 오버레이를 유지한다. 온천마을 6개 모델은 엔딩 이후 이야기책의 다음 여정에서 지연 로드한다. 기존 3마을의 경계·보스 진행을 유지하고 별도 이동·복구·운영 화면을 사용한다.
영상은 intro-scenes.js의 해시 URL로 인트로/엔딩 때만 로드. 거절/오류/5초 지연·데이터 절약·움직임 감소는 기존 이미지 재생으로 이어진다. 영화 종료/건너뛰기는 video 소스·타이머·콜백을 해제한다. 검사: tests/claude-assets-browser.cjs(실제 영상/자료 및 실패 대체), film-browser.cjs(이미지), super-actions-browser.cjs(전체 호수 운반), design-browser.cjs(실제 시트 로드 후 레벨/배치).

complete-actions.js는 전체 동작 연결·강아지 동행·콤보/피버·긴급 주문/황금상자 및 엔딩 이후 온천 운영을 관리한다. 저장 버전 12, 키는 그대로 cozy-village-v6. S.actions는 정상 수입/추가 보상 원장과 남은 이벤트 시간을 저장하고 추가 보상 합계는 정상 수입의 15% 이내다. S.aurora는 선택 진입·시설 0~3·온기·관리인·여관 서비스 진행을 저장한다. 기존 stage를 4로 자동 승급하지 않는다. 재료 부족이면 어떤 재고도 차감하지 않으며, 시설 가까이에서만 수리한다. 모바일 핀치와 전체 보기·카메라 이동을 지원한다.
검사: tests/complete-actions-browser.cjs — 엔딩 전 차단, 재료 원자적 차감, 시설 복구·인력·온기·저장 복구, 보상 상한·이벤트 상태, 3화면·핀치. 기존 design/film/super/browser 검사도 함께 수행한다. 원본 슈퍼의 모든 작업 프레임은 몸체 파생에 재사용하고 Canvas 팔이 큰 도끼/전체 호수 그물을 잡는다.
