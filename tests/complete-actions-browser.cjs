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
      { width: 1280, height: 800 },
      { width: 390, height: 844 },
      { width: 844, height: 390 },
    ]) {
      const page = await browser.newPage({ viewport }),
        errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(`http://127.0.0.1:${server.address().port}/?test=1`);
      await page.locator("#introSkip").click();
      assert.equal(
        await page.evaluate(() => __completeActions.open()),
        false,
        "No pre-ending unlock",
      );
      const result = await page.evaluate(() => {
        const t = __cozyTest,
          q = __completeActions,
          s = t.S();
        s.tut = 99;
        s.stage = 3;
        s.storySeen = { 1: 1, 2: 1, 3: 1 };
        s.coins = 100000;
        s.finaleDone = 1;
        document.querySelector("#ending").hidden = true;
        q.income(10000);
        const before = s.coins;
        q.reward(100000, 100, 400);
        q.reward(100000, 100, 400);
        const paid = s.coins - before;
        q.event("gather", 10);
        q.tick(3);
        q.state().chestWait = 0;
        q.state().orderWait = 0;
        q.tick(0.05);
        const chest = q.state().chest;
        const live = !!chest && t.walkable(chest.x, chest.y);
        q.open();
        q.move(270, 370);
        s.wh = { oak: 29, ingot: 100, smoked: 100 };
        const snapshot = JSON.stringify(s.wh);
        const insufficient =
          !q.repair("canal") && snapshot === JSON.stringify(s.wh);
        s.wh.oak = 300;
        const ok = q.repair("canal");
        q.move(150, 220);
        q.repair("boiler");
        q.move(830, 250);
        q.repair("lodge");
        q.move(510, 290);
        q.repair("spring");
        return { paid, live, insufficient, ok, level: q.aurora().canal };
      });
      assert.equal(result.paid, 1500);
      assert(result.live);
      assert(result.insufficient);
      assert(result.ok);
      assert.equal(result.level, 1);
      await page.waitForFunction(() => {
        let q = __cozyTest.spriteStatus();
        return !q.active && !q.queue;
      });
      let states = await page.evaluate(() => __cozyTest.spriteStatus().states);
      for (const n of [
        "hot_spring",
        "boiler",
        "lodge",
        "canal_segment",
        "aurora_lookout",
      ])
        assert.equal(states[n], "ready");
      await page.evaluate(() => {
        const q = __completeActions;
        q.move(150, 220);
        q.repair("boiler");
        q.move(270, 370);
        q.repair("canal");
        q.move(830, 250);
        q.repair("lodge");
        q.hire();
        q.hire();
        q.hire();
        q.tick(0.1);
        q.move(840, 450);
        q.repair("lookout");
        q.tick(60);
      });
      await page.waitForFunction(
        () => __cozyTest.spriteStatus().states.aurora_keeper === "ready",
      );
      assert(await page.evaluate(() => __completeActions.aurora().dailyReady));
      await page.evaluate(() => {
        var s = __cozyTest.S(),
          q = __completeActions;
        s.wh = { oak: 1000, ingot: 1000, smoked: 1000 };
        q.move(150, 220);
        if (!q.repair("boiler")) throw Error("Lv3 repair failed");
        if (q.repair("boiler")) throw Error("Cap purchased again");
      });
      assert.equal(
        await page.evaluate(() => __completeActions.aurora().boiler),
        3,
      );
      assert.equal(await page.evaluate(() => __cozyTest.errs().n), 0);
      await page.screenshot({
        path: `/tmp/cozy-all-actions-${viewport.width}.png`,
      });
      await page.evaluate(() => {
        var q = __completeActions;
        for (var goal of [
          [400, 280],
          [650, 230],
          [510, 200],
        ]) {
          q.move(goal[0] === 400 ? 650 : 400, 280);
          q.target(goal[0], goal[1]);
          for (var n = 0; n < 200; n++) {
            q.tick(0.05);
            if (!q.position().walkable) throw Error("Entered pool");
          }
          if (
            Math.hypot(q.position().x - goal[0], q.position().y - goal[1]) > 2
          )
            throw Error("Pool route failed");
        }
      });
      const z = await page.evaluate(() => __completeActions.view().z);
      await page.locator("#auroraCanvas").evaluate((c) => {
        c.dispatchEvent(
          new PointerEvent("pointerdown", {
            pointerId: 1,
            clientX: 120,
            clientY: 300,
            bubbles: true,
          }),
        );
        c.dispatchEvent(
          new PointerEvent("pointerdown", {
            pointerId: 2,
            clientX: 220,
            clientY: 300,
            bubbles: true,
          }),
        );
        c.dispatchEvent(
          new PointerEvent("pointermove", {
            pointerId: 2,
            clientX: 260,
            clientY: 300,
            bubbles: true,
          }),
        );
        c.dispatchEvent(
          new PointerEvent("pointerup", { pointerId: 1, bubbles: true }),
        );
        c.dispatchEvent(
          new PointerEvent("pointerup", { pointerId: 2, bubbles: true }),
        );
      });
      assert((await page.evaluate(() => __completeActions.view().z)) > z);
      await page.locator("#auroraClose").click();
      assert(await page.locator("#auroraJourney").evaluate((e) => e.hidden));
      await page.reload();
      await page.waitForFunction(() => !!window.__cozyTest);
      assert.equal(
        await page.evaluate(() => __completeActions.aurora().canal),
        2,
      );
      assert.equal(
        await page.evaluate(
          () =>
            __completeActions.state().paid <=
            __completeActions.state().income * 0.15,
        ),
        true,
      );
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log(
      "PASS: three viewports; ending-only journey; original repair art; exact/atomic materials; all facilities; 3 keepers; warmth/guests; reload persistence; reward cap; walkable chest; order and combo state; no runtime errors.",
    );
  } finally {
    await browser.close();
    server.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
