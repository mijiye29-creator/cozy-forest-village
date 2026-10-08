# 카카오 레퍼런스 적용 · 2026-10-09

저장소의 카카오 사진 001/002/003을 직접 확인하고 공통 표현을 게임에 반영했다. 살구색 작업장과 청백색 눈밭, 층마다 흰 눈을 얹은 푸른 침엽수, 둥근 통나무와 밝은 절단면의 울타리, 청록색 겨울 외투·흰 털 장식·갈색 장갑/부츠, 실제 목재 운반 더미, 어두운 작업 발판과 초록/빨강 테두리를 사용한다. 사진의 광고·SNS UI는 게임 UI로 복제하지 않는다.

원본 48개 모델과 슈퍼 몸체 2개를 보존하고 reference_* 10개를 추가했다. GLB와 WebP를 같은 Three.js 제작기에서 생성한다. 남자아이 설정과 인트로는 유지한다. 일반 곰은 길어진 흰 몸통·어깨·주둥이를 사용하고 검은 대왕곰과 특수 영웅/슈퍼 동작은 기존 표현을 유지한다. 주인공의 도끼/낚싯대/곡괭이·주먹·발차기는 실제 작업/공격 상태를 따라 바뀐다. 등에 쌓인 목재와 투입 재고도 실제 수량이다.

재생성: 저장소 루트 정적 서버를 실행하고 다음 명령을 사용한다.

```sh
CHROMIUM_PATH=/usr/bin/chromium STUDIO_URL=http://127.0.0.1:8789/art-source/tools/studio.html python3 art-source/tools/build_3d.py reference_hero reference_lumberjack reference_fisher reference_customer reference_pine reference_pine_small reference_fence reference_hunter reference_staff reference_bear
node scripts/build-game.cjs
```

곰 클릭은 강화/다음 마을 클릭보다 우선한다. 전투 중 타일 자동 결제는 중지한다. 다음 마을은 내부 광장의 고정 위치, 울타리 강화는 벽에서 85~210px 떨어진 통로에 놓고 시설·다른 타일·다음 마을 안내·모닥불을 피한다. 이전 요청대로 건설/수리는 벽 위에 유지한다. 선택한 강화 위치는 접근 중 안정적으로 유지한다.

검사: reference-combat-browser는 실제 Chromium 3화면에서 새 시트 10개 로드, 타일/벽 간격, 실제 곰 클릭, 겹친 다음 마을 안내, 전투 중 결제 억제와 런타임 오류를 확인한다. perimeter-shop-browser는 각 마을의 벽 위치 탐색·실제 유료 수리·강화를 검사한다. design-browser는 4화면 HUD와 시설/인물 단계별 시각 차이를 확인한다. 게임 캡처는 테스트 상태이며 실기기 FPS나 전체 보스 완주 결과가 아니다.
