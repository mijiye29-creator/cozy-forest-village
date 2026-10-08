# 게임 실행 및 수정

현재 본편은 `index.html`이다. HTTP로 저장소를 제공한 뒤 `/game/`을 연다.
소스와 실행 파일을 함께 제공해야 한다.

수정 위치는 [ARCHITECTURE.md](ARCHITECTURE.md)를 먼저 확인한다.
`src/`의 해당 기능만 수정하며 `runtime.js`는 자동 생성 파일이다.

```sh
node scripts/game-code.cjs --symbol findPath
node scripts/build-game.cjs
node tests/run-code.cjs all
```

저장소 루트에서 실행한다. Node.js 내장 기능만 사용한다.
인트로 이미지 목록은 `intro-scenes.js`에 있으며 원본 확인 전 빈 목록을 유지한다.
