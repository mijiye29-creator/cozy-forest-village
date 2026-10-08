/* Intro artwork in narrative order (exactly 4 entries, no captions or titles). 2026-10-09 Korean-history set,
 * rendered from art-source/tools/scenes.js (originals kept in art-source/storybook/).
 * 1. A 2026 Korean boy reads a Korean history book at night. 2. The book glows; a turtle ship, a king on horseback
 * and a hanok rise from the pages. 3. He steps into a glowing page. 4. He arrives in a snowy Joseon village.
 * Ending artwork loads on demand through the same wordless player.
 */
window.INTRO_SCENES = [
  {src: "assets/intro/01.webp", alt: "2026년 겨울밤, 책상에서 한국사 책을 읽는 아이"},
  {src: "assets/intro/02.webp", alt: "펼친 역사책에서 거북선과 말 탄 왕, 한옥이 빛과 함께 떠오른다"},
  {src: "assets/intro/03.webp", alt: "빛나는 책장 속으로 걸어 들어가는 아이"},
  {src: "assets/intro/04.webp", alt: "눈 덮인 조선 마을에 도착해 초가집과 한옥 불빛을 바라보는 아이"}
];

window.ENDING_SCENES = [
 {src:"assets/ending/01.webp",alt:"등불 축제에서 임꺽정·이순신·광개토대왕과 작별하는 아이"},
 {src:"assets/ending/02.webp",alt:"빛을 타고 역사책 속으로 돌아가는 아이"},
 {src:"assets/ending/03.webp",alt:"아침 햇살 속 책상에서 잠든 아이와 붉은 상모 기념품"}
];

// Claude source movies; source hashes avoid stale published media.
window.STORY_VIDEOS={"intro": {"webm": "assets/video/intro.webm?v=856e0bf2beaf", "mp4": "assets/video/intro.mp4?v=a740aba25935", "poster": "assets/video/intro-poster.jpg?v=67c75da4be1d"}, "ending": {"webm": "assets/video/ending.webm?v=946ca0065c15", "mp4": "assets/video/ending.mp4?v=ea87de1d7c49", "poster": "assets/video/ending-poster.jpg?v=d7e266e1dd27"}};
