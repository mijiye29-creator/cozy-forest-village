# art-source — Claude가 만든 원천 에셋 (3D 모델 · 스프라이트 · 영상)

GPT/Codex가 게임에 바로 쓰거나 고쳐서 다시 뽑을 수 있도록 **원본 + 생성 스크립트 + 결과물**을 함께 둡니다.
게임 코드(`game/src`)는 이 폴더를 참조하지 않습니다. 통합은 이슈의 사양대로 GPT가 진행합니다.

| 종류 | 위치 | 비고 |
|---|---|---|
| 3D 모델 (glTF binary) | `art-source/models/*.glb` (48개) | 애니메이션 클립 포함, KHR_mesh_quantization, three.js `GLTFLoader`로 바로 로드 |
| 게임용 스프라이트 시트 | `game/assets/sprites/*.webp` + `atlas.json` | 위 모델을 게임 카메라 각도(정면 3/4, 30° 내려봄)로 렌더, 외곽선 포함 |
| 인트로/엔딩 영상 | `game/assets/video/intro.(mp4\|webm)`, `ending.(mp4\|webm)`, `*-poster.jpg` | 720×1280, 무문자, 장면당 4.5초, 0.8초 크로스페이드, Ken Burns |
| 동화 원화 원본 | `art-source/storybook/*.jpg` | 인트로 4 + 엔딩 3. 게임용 webp는 `game/assets/intro`, `game/assets/ending` |
| 생성 도구 | `art-source/tools/` | `models.js`(모델 정의), `studio.html`(렌더/내보내기), `build_3d.py`, `optimize_glb.mjs`, `make_story_video.py` |
| 통합 도우미 | `art-source/integration/sprite-atlas.js` | `drawSprite()` 등. manifest에 추가하면 바로 사용 가능 (아직 미연결) |
| 미리보기 | `art-source/previews/contact-sheet.png`, `animations.gif`, `in-game-prototype.jpg`, `aurora-village-sheet.png`, `turnarounds/*.png` | 리뷰용 (턴어라운드 = 정면·3/4·옆·뒤) |
| **GPT 인계 팩** | `art-source/gpt/GPT-HANDOFF.md`, `asset-catalog.json`, `model-info.json` | 기계 판독용 카탈로그·연결 순서·스타일 프롬프트. `build_gpt_pack.py`로 재생성 |

## 모델 목록과 애니메이션

- 캐릭터: `hero`(초록 털모자·빨간 목도리·가방, 인트로 아이와 동일), `lumberjack`, `fisher`, `miner`, `hunter`, `hunter_blue`, `hunter_violet`, `shopkeeper`, `villager` — `idle`, `walk`, `cheer`, `work`(도끼/낚싯대/곡괭이/활/창)
- 동물: `corgi`(인트로의 강아지) `idle/walk/happy`, `polar_bear` · `boss_bear`(얼음 가시·왕관, 2.1배) `idle/walk/attack/hurt`, `fish` `swim/flop`
- 자연물: `pine`, `pine_small`(`idle` 흔들림, `chop`), `stump`, `rock`, `ore_rock`, `log_pile`, `golden_chest`(`idle`, `open`)
- 시설: `cabin`, `shop_wood`, `shop_fish`, `watchtower`, `storage`, `sawmill`(톱날 회전), `smokehouse`, `smelter`(불빛), `power_plant`(풍차 회전), `fence_segment`, `truck`(`drive`)
- 2026-10 추가 — 사람: `customer`(happy), `shop_staff`(work=건네기), `master_lumber`·`master_fisher`(무지개 도구·망토) / 차량: `excavator`·`harvester`·`fish_rig` `idle/drive/work` / 시설: `workshop`(망치 불꽃), `warehouse`, `market_stall`, `notice_board`
- 4번째 오로라 온천마을(설계 전용, 런타임 미구현): `aurora_keeper`, `hot_spring`·`boiler`·`lodge`·`canal_segment`·`aurora_lookout` — 각각 `repaired`/`broken` 클립
- 간판은 비워 두었습니다. 한글 라벨은 게임이 기존처럼 그립니다.

## atlas.json 형식

```json
"hero": { "file": "hero.webp", "frameW": 88, "frameH": 144, "ppu": 64, "kind": "actor",
          "anchor": [46, 127],                       // 프레임 안에서 발/바닥 중심 픽셀
          "anims": { "walk": { "row": 1, "frames": 8, "fps": 10, "loop": true }, ... },
          "glb": "art-source/models/hero.glb" }
```
- 모든 모델은 같은 월드 축척(1 unit ≈ 1 m, 시트는 64 px/unit)으로 렌더했습니다. 게임에서 `SPRITE_PPU`(기본 19 px/unit) 하나로 크기를 맞추면 캐릭터·곰·시설 비율이 유지됩니다.
- 캐릭터는 **왼쪽 앞**을 봅니다. 오른쪽(`dir>0`)이면 좌우 반전해서 그립니다.

## 다시 만들기

```sh
cd art-source/tools && npm ci            # three, gltf-transform
cd ../.. && python3 -m http.server 8788 & # 저장소 루트에서
python3 art-source/tools/build_3d.py            # 전체 (또는: build_3d.py hero cabin — 그 모델만 최적화)
python3 art-source/tools/build_gpt_pack.py      # GPT 카탈로그·턴어라운드·시트 (glb 재출력 없음)
python3 art-source/tools/make_story_video.py    # 영상 (intro / ending 개별 가능)
```
브라우저에서 `http://localhost:8788/art-source/tools/studio.html?model=boss_bear&anim=attack` 로 3D 미리보기.
색은 `models.js`의 `PAL`, 형태/포즈는 각 모델 함수에서 고칩니다.

## 현재 게임 통합

원본 48종과 미리보기/턴어라운드를 보존하고 세 마을에서 손님·점원·채집 차량·생산/창고·진열대·게시판을 연결했다. 슈퍼 일꾼의 파생 몸체 `master_lumber_body`, `master_fisher_body` 2종은 원본 모델과 작업 애니메이션을 재사용하며, 원본 팔/도구를 숨겨 게임의 두 팔이 큰 도끼와 전체 호수 그물을 정확히 잡는다. 원본 두 모델은 변경하지 않았다.

파생 몸체 재생성: `cd art-source/tools && npm ci --cache /tmp/cozy-npm-cache --no-audit --no-fund` 후 저장소 루트의 HTTP 서버를 8788에서 실행하고 `CHROMIUM_PATH=/usr/bin/chromium python3 art-source/tools/build_3d.py master_lumber_body master_fisher_body`, 마지막으로 `node scripts/build-game.cjs`. 스프라이트는 필요할 때 최대 2개씩 로드하며 실패 시 기존 Canvas로 그린다. 영상은 필요한 인트로/엔딩만 로드하고 재생 거절·실패·데이터 절약·움직임 감소 시 원본 이미지로 이어진다. 4마을 자료는 미연결 디자인 자료다.
