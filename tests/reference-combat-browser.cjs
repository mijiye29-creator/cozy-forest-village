const { chromium } = require("playwright"),
  http = require("node:http"),
  path = require("node:path"),
  assert = require("node:assert/strict");
(async () => {
  const server = http.createServer(
    require("./static-server.cjs")(path.resolve(__dirname, "..")),
  );
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const browser = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  try {
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 844, height: 390 },
      { width: 1280, height: 800 },
    ]) {
      const page = await browser.newPage({ viewport }),
        errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(`http://127.0.0.1:${server.address().port}/?test=1`);
      await page.locator("#introSkip").click();
      await page.evaluate(() => {
        let t = __cozyTest,
          s = t.S();
        Object.assign(s, {
          stage: 1,
          tut: 99,
          coins: 100000,
          auto: false,
          season: 0,
          fence: 1,
          fenceDown: 0,
          storySeen: { 1: 1, 2: 1, 3: 1 },
        });
        t.bears().splice(0);
        s.cv.f1 = 1;
        t.hero(342, 260);
        s.manualZoom = t.camera().range.min;
        t.run(0.1);
        t.loadSprites([
          "reference_hero",
          "reference_lumberjack",
          "reference_fisher",
          "reference_customer",
          "reference_pine",
          "reference_pine_small",
          "reference_fence",
          "reference_hunter",
          "reference_staff",
          "reference_bear",
        ]);
      });
      await page.waitForFunction(() => {
        let q = __cozyTest.spriteStatus();
        return !q.active && !q.queue;
      });
      let states = await page.evaluate(() => __cozyTest.spriteStatus().states);
      for (let n of Object.keys(states).filter((n) =>
        n.startsWith("reference_"),
      ))
        assert.equal(states[n], "ready", n);
      await page.waitForTimeout(80);
      const layout = await page.evaluate(() => {
        var t = __cozyTest,
          p = t.pads().find((p) => p.id === "fence"),
          sign = t.nextSign();
        return { p, sign, edge: t.geo().fenceX };
      });
      assert(layout.p);
      assert(layout.edge - layout.p.x >= 85);
      assert(
        layout.edge - layout.sign.x >= 85,
        "Next village stays inside, away from wall",
      );
      const before = await page.evaluate(() => {
        var t = __cozyTest,
          s = t.S();
        t.hero(338, 260);
        t.spawnBear("right");
        var b = t.bears()[0];
        Object.assign(b, {
          x: 342,
          y: 260,
          hp: 100000,
          max: 100000,
          state: "in",
        });
        t.run(0.01, 0.01);
        var camera = t.camera(),
          r = document.querySelector("#c").getBoundingClientRect();
        return {
          coins: s.coins,
          fence: s.fence,
          point: {
            x: r.left + ((b.x - camera.x) * camera.z * r.width) / t.geo().W,
            y: r.top + ((b.y - camera.y) * camera.z * r.width) / t.geo().W,
          },
          pads: t.pads().filter((p) => p.id === "fence"),
        };
      });
      assert.equal(
        before.pads.length,
        0,
        "Upgrade hidden during nearby combat",
      );
      await page.mouse.click(before.point.x, before.point.y);
      let after = await page.evaluate(() => {
        var t = __cozyTest;
        return {
          chasing: !!t.agents()[0].chaseBear,
          coins: t.S().coins,
          fence: t.S().fence,
          goalHidden: document.querySelector("#goalList").hidden,
          escrow: Object.values(t.S().pads || {}).reduce((a, b) => a + b, 0),
        };
      });
      assert(after.chasing, "Real bear tap takes priority");
      assert.equal(after.coins, before.coins);
      assert.equal(after.fence, before.fence);
      assert(after.goalHidden);
      assert.equal(after.escrow, 0);
      await page.evaluate(() => {
        var t = __cozyTest,
          sign = t.nextSign();
        t.hero(sign.x - 12, sign.y);
        t.agents()[0].chaseBear = null;
        t.S().manualZoom = t.camera().range.max;
        t.run(1);
      });
      await page.waitForTimeout(150);
      const signPoint = await page.evaluate(() => {
        var t = __cozyTest,
          sign = t.nextSign(),
          b = t.bears()[0];
        t.hero(sign.x - 12, sign.y);
        b.x = sign.x;
        b.y = sign.y;
        b.state = "in";
        b.entered = true;
        var cam = t.camera(),
          r = document.querySelector("#c").getBoundingClientRect();
        return {
          tappedAt: t.agents()[0].tapAtkT || 0,
          x: r.left + ((sign.x - cam.x) * cam.z * r.width) / t.geo().W,
          y: r.top + ((sign.y - cam.y) * cam.z * r.width) / t.geo().W,
        };
      });
      await page.mouse.click(signPoint.x, signPoint.y);
      assert(
        await page.locator("#goalList").evaluate((e) => e.hidden),
        "A bear over the next-village tile must not open goals",
      );
      assert(
        await page.evaluate(() => __cozyTest.combatBusy()),
        "Overlapping sign click enters combat",
      );
      assert(
        (await page.evaluate(() => __cozyTest.agents()[0].tapAtkT)) >
          signPoint.tappedAt,
        "Sign overlap tap triggers an actual martial attack",
      );
      // Deliberately stand over a regular upgrade while a live bear is close.
      const stationary = await page.evaluate(() => {
        var t = __cozyTest,
          p = t.pads().find((p) => p.id === "beltup_wood"),
          b = t.bears()[0];
        t.hero(p.x, p.y);
        b.x = p.x + 30;
        b.y = p.y;
        t.agents()[0].mv = false;
        t.agents()[0].moving = false;
        var before = t.S().coins;
        t.run(0.6);
        return {
          before,
          after: t.S().coins,
          escrow: Object.values(t.S().pads || {}).reduce((a, b) => a + b, 0),
        };
      });
      assert.equal(stationary.after, stationary.before);
      assert.equal(
        stationary.escrow,
        0,
        "Fighting on a tile cannot spend money",
      );
      const resumed = await page.evaluate(() => {
        var t = __cozyTest;
        t.bears().splice(0);
        t.agents()[0].chaseBear = null;
        t.hero(18, 260);
        t.run(1);
        var p = t.pads().find((p) => p.id === "fence"),
          before = t.S().fence;
        t.perimeterSlot().armed = true;
        t.hero(p.x, p.y);
        t.run(1.4);
        return { before, after: t.S().fence };
      });
      assert.equal(
        resumed.after,
        resumed.before + 1,
        "Upgrade resumes normally after combat",
      );
      await page.evaluate(() => {
        var t = __cozyTest;
        t.bears().splice(0);
        t.hero(180, 300);
        t.agents()[0].bag = { oak: 30 };
        t.S().piles.f1 = { oak: 24 };
        t.S().cv.f1 = 1;
        t.S().sites.f1 = 3;
        t.S().manualZoom = null;
        t.run(1);
      });
      await page.waitForTimeout(250);
      await page.screenshot({
        path: `/tmp/cozy-reference-${viewport.width}.png`,
      });
      assert.equal(await page.evaluate(() => __cozyTest.errs().n), 0);
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log(
      "PASS: original reference derivatives decode; three viewports; interior village sign; 85px wall separation; real bear-pointer priority; combat suppresses upgrade/escrow; timber count and playable winter scene.",
    );
  } finally {
    await browser.close();
    server.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
