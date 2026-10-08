# GPT/Codex 인계 — 포근한 숲속 마을 3D 캐릭터·시설 팩

이 폴더는 GPT/Codex가 3D 에셋을 **찾고, 게임에 연결하고, 같은 화풍으로 새로 만들 수 있게** 정리한 것이다.
Claude가 만들고 자체 렌더 검사만 했다. 게임 런타임(`game/src`)에는 **아직 연결되지 않았다** (`runtime_connected: false`).

## 1. 먼저 읽을 파일

| 파일 | 용도 |
|---|---|
| `asset-catalog.json` | 모델 48개의 기계 판독용 목록. 그룹, 마을, 제안 역할 키, 대체할 게임 그림 함수, 크기(m), 주요 색, 애니메이션 클립, glb·스프라이트·턴어라운드 경로 |
| `model-info.json` | 카탈로그의 사람이 쓴 설명 원본 (한/영). 모델을 추가하면 여기에도 한 줄 추가 |
| `../previews/contact-sheet.png` | 전체 48개 한눈에 보기 |
| `../previews/aurora-village-sheet.png` | 4번째 마을(오로라 온천) 시설의 고장/복구 상태 비교 |
| `../previews/turnarounds/<이름>.png` | 정면 · 3/4 · 옆 · 뒤 4방향 (모델링·2D 컨셉 참고용) |
| `../integration/sprite-atlas.js` | 게임에 넣을 `drawSprite()` 도우미 + `SPRITE_ROLE` 매핑 |

카탈로그 사용 예:
```js
const cat = require('./art-source/gpt/asset-catalog.json');
Object.entries(cat.models).filter(([, m]) => m.new_in_2026_10).map(([n, m]) => [n, m.replaces_game_draw]);
```

## 2. 이번에 새로 추가된 17개

| 구분 | 모델 | 클립 | 게임 대응 |
|---|---|---|---|
| 사람 | `customer` | idle, walk, cheer, happy | `drawCustomer` |
| 사람 | `shop_staff` | idle, walk, cheer, work(건네기) | `drawShopStaff` |
| 사람 | `master_lumber`, `master_fisher` | idle, walk, cheer, work | `drawMasterLumber`, `drawMasterFisher` |
| 차량 | `excavator`, `harvester`, `fish_rig` | idle, drive, work | `drawExcavator`, `drawHarvester`, `drawFishRig` |
| 시설 | `workshop`, `warehouse`, `market_stall`, `notice_board` | idle 또는 정지 | `drawWorkshop`, `drawWarehouse`, 진열대, `drawBoard` |
| 4마을 | `aurora_keeper` | idle, walk, cheer, work | 미구현 |
| 4마을 | `hot_spring`, `boiler`, `lodge`, `canal_segment`, `aurora_lookout` | **repaired**, **broken** | 미구현 |

4마을 시설의 `broken`은 설계 문서(`design/fourth-village-implementation.md`)의 "발견" 상태, `repaired`는 각 복구 단계 완료 상태다.
`sprite-atlas.js`의 기본 애니메이션 선택은 `idle`이 없으면 첫 클립(`repaired`)을 쓰므로 고장 상태는 `'broken'`을 직접 넘긴다.

## 3. 게임에 연결하는 순서 (GPT 작업)

1. `AGENTS.md`, `game/ARCHITECTURE.md`를 따른다. 그림 변경은 "그림·색감·애니메이션" 행, 검사 그룹은 all + 관련 browser 검사.
2. `art-source/integration/sprite-atlas.js`를 `game/src/`로 옮기고 `game/runtime-manifest.json`의 render 모듈 **앞**에 추가한다.
3. 각 `draw*` 함수 맨 앞에서 `if (drawSprite(ctx, name, anim, time, x, y, SPRITE_PPU, dir > 0)) return;` 형태로 시도하고,
   실패(로딩 전·실패) 시 기존 Canvas 그림을 그대로 그린다. 기존 그림을 지우지 않는다.
4. `SPRITE_PPU` 하나로 크기를 맞춘다(모든 모델은 같은 축척). 캐릭터는 왼쪽 앞을 보므로 `dir>0`이면 좌우 반전.
5. 표현 함수는 저장·시뮬레이션 상태를 바꾸지 않는다. 움직임 감소 설정(`MOTION3D_REDUCED`)이면 첫 프레임 고정.
6. `node scripts/build-game.cjs` → `node tests/run-code.cjs all` → 실제 브라우저 화면 확인. 소스와 생성 파일을 함께 커밋.
7. 4마을 시설은 4마을 런타임이 구현될 때까지 연결하지 않는다.

## 4. 같은 화풍으로 새 모델 만들기

`art-source/tools/models.js`에 함수 하나를 추가하고 `MODELS`에 등록한 뒤:
```sh
cd art-source/tools && npm ci && cd ../..
python3 -m http.server 8788 &
python3 art-source/tools/build_3d.py <새이름>          # glb + 스프라이트 + atlas (그 모델만 최적화)
python3 art-source/tools/build_gpt_pack.py             # 카탈로그·턴어라운드·시트 갱신
```
Playwright 브라우저가 이미 있으면 `CHROMIUM_PATH=<chrome 경로>`로 지정한다.

레시피:
- 단위 1 = 1m, +Y 위, 정면 +Z, 원점은 발/바닥 중심. 사람 키 약 1.5, 머리 1.25배(큰 머리 비율).
- 사람은 `character(name, {coat, scarf, hat, hatColor, hair, apron, extra, animKind}, toolKind)`. 도구: `axe, rod, pick, bow, spear, rainbowAxe, rainbowRod, ladle`.
- 시설은 `base()` 눈 받침 + `logWalls()` + `snowRoof()` + `windowGlow()` + `door()`. 움직이는 부분은 이름 있는 `pivot`.
- 상태 전환은 `hide(node)`(크기 0)로 한다. glTF 클립에 그대로 들어간다.
- 색은 `PAL`에서만 고른다. 기존 색 값은 바꾸지 않는다.

## 5. 스타일 규칙과 금지 사항

- 둥근 모서리 로우폴리, 따뜻한 등불 호박색 vs 차가운 푸른 눈, 지붕·받침에 눈, 어두운 갈색 외곽선(스프라이트).
- **간판·종이·화면에 글자를 넣지 않는다.** 한글 라벨은 게임이 그린다. 인트로는 무문자.
- 주인공 설정 유지: 부모님과 침대에서 책을 읽다 책 속 세계로 들어온 남자아이, 초록 털모자·빨간 목도리·가방.
- 원본 이미지가 없을 때 다른 이미지로 대체하지 않는다. `art-source/storybook/*` 원화를 AI 생성 이미지로 바꾸지 않는다.
- 저장 키 `cozy-village-v6`와 구형 저장 이관은 그림 작업에서 건드리지 않는다.

## 6. 이미지 생성 AI용 스타일 프롬프트 (2D 컨셉·설정화 초안용)

턴어라운드 PNG를 참고 이미지로 같이 넣는다. 결과물은 컨셉 참고용이며 게임 에셋은 위 3D 파이프라인으로 만든다.

```
Cozy storybook low-poly 3D diorama, chunky rounded-box shapes, big-head chibi proportions (head ~1/3 of body),
warm amber lamp light against cool blue snow, snow caps on roofs and bases, soft hemisphere light, thin dark-brown outline,
front 3/4 view looking down 30 degrees, plain light background, no text, no letters, no logos.
Palette: pine #1f6b4f, log #8b5a35, roof red #b8473a, roof blue #3f6f91, snow #f4f8fc, glow #ffb54a, hot-spring teal #3fc6c0.
```
```
포근한 동화책 로우폴리 3D 디오라마, 둥근 상자 형태, 머리가 큰 2.5등신, 따뜻한 등불 호박색과 차가운 푸른 눈의 대비,
지붕과 바닥에 쌓인 눈, 얇은 진갈색 외곽선, 30도 내려다보는 정면 3/4 시점, 밝은 단색 배경, 글자·로고 없음.
```

## 7. 외부 사본

- Canva / Figma / Dropbox 사본 링크는 `asset-catalog.json` 상단 `links`와 저장소 `team-dashboard.html`에 적는다(생성된 경우에만).
- 정본은 항상 이 저장소의 파일이다. 외부 사본을 고쳐도 저장소 파일이 바뀌지 않는다.
