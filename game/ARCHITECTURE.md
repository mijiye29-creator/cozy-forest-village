# 게임 코드 지도

index.html은 화면 구조, styles/game.css는 화면 디자인이다. 36개 기능 소스와
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
| 인트로·대사 | story-intro.js, game/intro-scenes.js | loop.js, game/styles/game.css | story |
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
