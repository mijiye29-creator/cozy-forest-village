/* Live action states and optional post-ending journey. Original art is retained. */
var ACTION_STAFF = {};
var ACTION_DOG = { x: 110, y: 410, dir: 1, mv: false, happy: 0 },
  ACTION_CHEST = null,
  ACTION_COMBO = 0,
  ACTION_WINDOW = 0,
  ACTION_ORDER = null,
  ACTION_SLOW = 0,
  ACTION_STOP = 0,
  ACTION_HEART = 0;
function actionState() {
  var a = S.actions;
  if (!a || typeof a !== "object")
    a = S.actions = {
      income: 0,
      paid: 0,
      chestWait: 85,
      orderWait: 70,
      wins: 0,
      best: 0,
    };
  ["income", "paid", "chestWait", "orderWait", "wins", "best"].forEach(
    function (k) {
      if (!Number.isFinite(a[k]) || a[k] < 0)
        a[k] = k === "chestWait" ? 85 : k === "orderWait" ? 70 : 0;
    },
  );
  if (
    a.chest &&
    (!Number.isFinite(a.chest.x) ||
      !Number.isFinite(a.chest.y) ||
      !Number.isFinite(a.chest.left))
  )
    a.chest = null;
  if (
    a.order &&
    (!Number.isFinite(a.order.left) ||
      !Number.isFinite(a.order.got) ||
      !Number.isFinite(a.order.target))
  )
    a.order = null;
  a.elapsed = Number.isFinite(a.elapsed) ? Math.max(0, a.elapsed) : 0;
  if (!Array.isArray(a.recent)) a.recent = [];
  a.recent = a.recent
    .filter(function (r) {
      return (
        r &&
        Number.isFinite(r.t) &&
        Number.isFinite(r.n) &&
        r.n >= 0 &&
        a.elapsed - r.t < 60
      );
    })
    .slice(-256);
  a.fever = Number.isFinite(a.fever) ? Math.max(0, Math.min(10, a.fever)) : 0;
  if (
    a.order &&
    (!["gather", "serve", "truck", "bear"].includes(a.order.key) ||
      a.order.target < 3 ||
      a.order.left <= 0)
  )
    a.order = null;
  if (a.chest)
    a.chest.open = Number.isFinite(a.chest.open)
      ? Math.max(0, a.chest.open)
      : 0;
  return a;
}
function actionFeverPay(n) {
  var a = actionState();
  if (a.fever) {
    a.feverBank =
      (Number.isFinite(a.feverBank) ? Math.max(0, a.feverBank) : 0) + n * 0.2;
    var paid = actionReward(a.feverBank, agents[0].x, agents[0].y);
    a.feverBank -= paid;
  }
}
function actionIncome(n) {
  if (Number.isFinite(n) && n > 0) {
    var a = actionState();
    a.income += n;
    a.recent.push({ t: a.elapsed, k: "income", n: n });
  }
}
function actionRecent(k) {
  return actionState().recent.reduce(function (sum, r) {
    return sum + (r.k === k ? r.n : 0);
  }, 0);
}
function actionHit() {
  if (!MOTION3D_REDUCED.matches) ACTION_STOP = 0.06;
}
function actionBoss() {
  if (!MOTION3D_REDUCED.matches) ACTION_SLOW = 0.6;
}
function actionReward(n, x, y) {
  var a = actionState(),
    budget = Math.max(0, Math.floor((a.income * 0.15 - a.paid) / 50) * 50),
    pay = Math.min(budget, Math.max(0, Math.floor(n / 50) * 50));
  if (pay) {
    S.coins += pay;
    a.paid += pay;
    addFloat(x, y - 25, "보너스 +" + fmt(pay), "#ffe27a", true);
    burst(x, y, "#ffce54", 18, true);
  }
  return pay;
}
function actionEvent(k, n) {
  var a = actionState();
  a.recent.push({ t: a.elapsed, k: k, n: n });
  if (["gather", "serve", "truck", "bear"].indexOf(k) < 0 || n <= 0) return;
  if (k === "gather")
    agents.forEach(function (w) {
      if (w.role !== "player" && w.working) w.cheerUntil = time + 1;
    });
  var oldCombo = ACTION_COMBO;
  ACTION_COMBO += n;
  ACTION_WINDOW = 2.5;
  a.best = Math.max(a.best, ACTION_COMBO);
  [10, 25, 50].forEach(function (mark) {
    if (oldCombo < mark && ACTION_COMBO >= mark)
      actionReward(a.income * 0.005, agents[0].x, agents[0].y);
  });
  if (oldCombo < 20 && ACTION_COMBO >= 20) a.fever = 10;
  if (a.order && a.order.key === k) {
    a.order.got += n;
    if (a.order.got >= a.order.target) {
      a.wins++;
      a.streak = (a.streak || 0) + 1;
      actionReward(
        (actionRecent("income") / 60) * 25 * (1 + 0.25 * (a.streak || 0)),
        agents[0].x,
        agents[0].y,
      );
      a.order = null;
      a.orderWait = 75;
      ACTION_DOG.happy = 1;
      celebrate(agents[0].x, agents[0].y, "긴급 주문 성공!", true);
      save();
    }
  }
}
function drawStaffAction(g, line, i, x, y, side) {
  var key = line + ":" + i,
    w = ACTION_STAFF[key];
  if (!w)
    w = ACTION_STAFF[key] = {
      x: x,
      y: y,
      homeX: x,
      homeY: y,
      line: line,
      cheerUntil: 0,
    };
  return drawSprite(
    g,
    "shop_staff",
    actorSpriteAnim(w),
    time + i * 0.3,
    w.x,
    w.y + 6,
    SPRITE_PPU * 0.65,
    side > 0,
  );
}
function updateCompleteActions(dt) {
  Object.keys(ACTION_STAFF).forEach(function (key) {
    var w = ACTION_STAFF[key],
      busy = customers.some(function (c) {
        return c.seller === w.line && c.state === "serve";
      }),
      happy = customers.some(function (c) {
        return c.seller === w.line && c.cheerUntil > time;
      });
    if (happy) w.cheerUntil = time + 0.2;
    var targetY = w.homeY - (busy ? 25 : 0),
      dy = targetY - w.y;
    w.mv = Math.abs(dy) > 1;
    w.working = busy && !w.mv;
    if (w.mv) w.y += Math.sign(dy) * Math.min(Math.abs(dy), 35 * dt);
  });
  var p = agents[0],
    a = actionState(),
    dog = ACTION_DOG;
  a.elapsed += dt;
  ACTION_HEART = Math.max(0, ACTION_HEART - dt);
  if (
    !MOTION3D_REDUCED.matches &&
    !ACTION_HEART &&
    BEARS.some(function (b) {
      return b.state !== "dead" && Math.hypot(b.x - p.x, b.y - p.y) < 120;
    })
  ) {
    sfx("tap", 0.12);
    ACTION_HEART = 0.8;
  }
  ACTION_WINDOW = Math.max(0, ACTION_WINDOW - dt);
  if (!ACTION_WINDOW) ACTION_COMBO = 0;
  a.fever = Math.max(0, (a.fever || 0) - dt);
  dog.happy = Math.max(0, dog.happy - dt);
  var target = { x: p.x - p.dir * 25, y: p.y + 16 },
    d = Math.hypot(target.x - dog.x, target.y - dog.y);
  dog.mv = false;
  if (d > 12) {
    var step = Math.min(d, 85 * dt),
      nx = dog.x + ((target.x - dog.x) / d) * step,
      ny = dog.y + ((target.y - dog.y) / d) * step;
    if (walkXY(nx, ny)) {
      dog.dir = nx > dog.x ? 1 : -1;
      dog.x = nx;
      dog.y = ny;
      dog.mv = true;
    } else if (d > 180) {
      dog.x = p.x;
      dog.y = p.y;
    }
  }
  if (tutOn()) return;
  a.chestWait -= dt;
  if (!a.chest && a.chestWait <= 0) {
    for (var i = 0; i < 24; i++) {
      var x = p.x + (Math.random() - 0.5) * 300,
        y = p.y + (Math.random() - 0.5) * 260;
      if (
        walkXY(x, y) &&
        res.every(function (q) {
          return !q.alive || Math.hypot(q.x - x, q.y - y) > 25;
        }) &&
        PLOTS.every(function (pl) {
          return (
            x < pl.x - 22 ||
            x > pl.x + pl.w + 22 ||
            y < pl.y - 22 ||
            y > pl.y + pl.h + 22
          );
        }) &&
        PADLIST.every(function (q) {
          return Math.hypot(q.x - x, q.y - y) > 38;
        })
      ) {
        a.chest = { x: x, y: y, left: 12, open: 0 };
        break;
      }
    }
    a.chestWait = 70 + Math.random() * 50;
  }
  if (a.chest) {
    var c = a.chest;
    c.left -= dt;
    if (!c.open && Math.hypot(c.x - p.x, c.y - p.y) < 22) {
      c.open = 0.001;
      actionReward((actionRecent("income") / 60) * 15, c.x, c.y);
      dog.happy = 1;
      save();
    }
    if (c.open) c.open += dt;
    if (c.left <= 0 || c.open > 0.85) {
      a.chest = null;
      save();
    }
  }
  a.orderWait -= dt;
  if (!a.order && a.orderWait <= 0) {
    var choices = ["gather"];
    if (S.h2) choices.push("serve");
    if (S.h3) choices.push("truck");
    if (S.bears) choices.push("bear");
    var key = choices[Math.floor(Math.random() * choices.length)];
    a.order = {
      key: key,
      target:
        key === "truck" || key === "bear"
          ? 3
          : Math.max(3, Math.ceil((actionRecent(key) / 60) * 40 * 1.3)),
      got: 0,
      left: 40,
    };
    a.orderWait = 60 + Math.random() * 30;
  }
  if (a.order) {
    a.order.left -= dt;
    if (a.order.left <= 10 && a.order.warned !== Math.ceil(a.order.left)) {
      a.order.warned = Math.ceil(a.order.left);
      if (!MOTION3D_REDUCED.matches) sfx("tap", 0.08);
    }
    if (a.order.left <= 0) {
      a.order = null;
      a.streak = 0;
      a.orderWait = 75;
      addFloat(p.x, p.y - 40, "긴급 주문 종료", "#ffb3bf", true);
    }
  }
  ACTION_CHEST = a.chest;
  ACTION_ORDER = a.order;
}
function drawCompleteActions() {
  if (!MOTION3D_REDUCED.matches && ACTION_HEART > 0.4) {
    ctx.strokeStyle = "rgba(205,44,51,.35)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(agents[0].x, agents[0].y, 30 + Math.sin(time * 10) * 4, 0, 7);
    ctx.stroke();
  }
  var d = ACTION_DOG;
  if (spriteVisible(d.x, d.y, 55))
    drawSprite(
      ctx,
      "corgi",
      d.happy ? "happy" : d.mv ? "walk" : "idle",
      time,
      d.x,
      d.y + 6,
      SPRITE_PPU * 0.7,
      d.dir > 0,
    );
  var c = ACTION_CHEST;
  if (c && !spriteVisible(c.x, c.y, 70)) {
    var ax = Math.max(camX + 30, Math.min(camX + W / Z - 30, c.x)),
      ay = Math.max(camY + 70, Math.min(camY + SH / Z - 30, c.y));
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#925515";
    ctx.fillText("◆ 상자 " + Math.ceil(c.left) + "초", ax, ay);
  }
  if (c && spriteVisible(c.x, c.y, 70)) {
    if (c.left > 3 || MOTION3D_REDUCED.matches || Math.floor(time * 6) % 2)
      drawSprite(
        ctx,
        "golden_chest",
        c.open ? "open" : "idle",
        c.open || time,
        c.x,
        c.y + 8,
        SPRITE_PPU * 0.85,
        false,
      );
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#76511e";
    ctx.fillText(c.open ? "획득!" : Math.ceil(c.left) + "초", c.x, c.y - 29);
  }
  if (ACTION_COMBO >= 2 || ACTION_ORDER) {
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#2b463e";
    ctx.fillText(
      ACTION_ORDER
        ? "긴급 " +
            { gather: "채집", serve: "판매", truck: "납품", bear: "방어" }[
              ACTION_ORDER.key
            ] +
            " " +
            ACTION_ORDER.got +
            "/" +
            ACTION_ORDER.target +
            " · " +
            Math.ceil(ACTION_ORDER.left) +
            "초"
        : "",
      agents[0].x,
      agents[0].y - 78,
    );
    if (ACTION_COMBO >= 2)
      ctx.fillText(
        ACTION_COMBO + " COMBO" + (actionState().fever ? " · FEVER" : ""),
        agents[0].x,
        agents[0].y - 64,
      );
  }
}
function auroraWalk(x, y) {
  return (
    x >= 30 &&
    x <= 1050 &&
    y >= 95 &&
    y <= 565 &&
    !(x > 475 && x < 545 && y > 225 && y < 303)
  );
}
var AURORA_Z = window.innerWidth < 600 ? 2.5 : 1.2,
  AURORA_VIEW = { x: 0, y: 0, z: 1 },
  AURORA_TOUCH = {},
  AURORA_PINCH = null;
var AURORA_OPEN = false,
  AURORA_UI = null,
  AURORA_HERO = { x: 540, y: 500, tx: 540, ty: 500 },
  AURORA_TIME = 0,
  AURORA_GUESTS = [], AURORA_SAVE_T = 0;
var AURORA_FAC = [
  {
    key: "canal",
    model: "canal_segment",
    name: "온수 수로",
    x: 270,
    y: 370,
    cost: { oak: 30 },
  },
  {
    key: "boiler",
    model: "boiler",
    name: "보일러",
    x: 150,
    y: 220,
    cost: { ingot: 20 },
  },
  {
    key: "lodge",
    model: "lodge",
    name: "온천 여관",
    x: 830,
    y: 250,
    cost: { oak: 20, smoked: 10 },
  },
  {
    key: "spring",
    model: "hot_spring",
    name: "온천",
    x: 510,
    y: 290,
    cost: { oak: 20, ingot: 10 },
  },
  {
    key: "lookout",
    model: "aurora_lookout",
    name: "오로라 전망대",
    x: 840,
    y: 450,
    cost: { oak: 20, ingot: 10 },
  },
];
function auroraState() {
  var a = S.aurora;
  if (!a || typeof a !== "object")
    a = S.aurora = {
      unlocked: false,
      canal: 0,
      boiler: 0,
      lodge: 0,
      spring: 0,
      lookout: 0,
      warmth: 0,
      crew: 0,
      dailyReady: false,
    };
  AURORA_FAC.forEach(function (f) {
    a[f.key] = Math.max(0, Math.min(3, Math.floor(Number(a[f.key]) || 0)));
  });
  a.crew = Math.max(0, Math.min(3, Math.floor(Number(a.crew) || 0)));
  a.warmth = Math.max(0, Math.min(100, Number(a.warmth) || 0));
  a.service = Number.isFinite(a.service) ? Math.max(0, a.service) : 0;
  a.cheer = Number.isFinite(a.cheer) ? Math.max(0, Math.min(1, a.cheer)) : 0;
  return a;
}
function auroraInventory(id) {
  var list = [];
  function add(o, k) {
    if (o && Number.isFinite(o[k]) && o[k] > 0)
      list.push({ o: o, k: k, n: o[k] });
  }
  var keys =
    id === "oak"
      ? TREES.map(function (t) {
          return t.id;
        })
      : id === "smoked"
        ? ["smoked", "can", "gift"]
        : [id];
  keys.forEach(function (k) {
    add(agents[0].bag, k);
    add(S.wh, k);
    Object.keys(S.piles || {}).forEach(function (s) {
      add(S.piles[s], k);
    });
  });
  return list;
}
function auroraRepair(key) {
  if (!S.finaleDone || !auroraState().unlocked) return false;
  var a = auroraState(),
    f = AURORA_FAC.filter(function (f) {
      return f.key === key;
    })[0];
  if (
    !f ||
    a[key] >= 3 ||
    Math.hypot(AURORA_HERO.x - f.x, AURORA_HERO.y - f.y) >= 110
  )
    return false;
  if (key === "lookout" && !a.dailyReady) return false;
  var needs = Object.keys(f.cost).map(function (id) {
    return { id: id, n: f.cost[id] * (a[key] + 1), stock: auroraInventory(id) };
  });
  if (
    needs.some(function (n) {
      return (
        n.stock.reduce(function (t, s) {
          return t + s.n;
        }, 0) < n.n
      );
    })
  )
    return false;
  needs.forEach(function (n) {
    var left = n.n;
    n.stock.forEach(function (s) {
      var take = Math.min(left, s.n);
      s.o[s.k] -= take;
      left -= take;
    });
  });
  a[key]++;
  a.cheer = 1;
  save();
  return true;
}
function auroraHire() {
  var a = auroraState(),
    cost = money50(5000 * (a.crew + 1));
  if (!S.finaleDone || !a.unlocked || a.crew >= 3 || S.coins < cost)
    return false;
  S.coins -= cost;
  a.crew++;
  a.cheer = 1;
  save();
  return true;
}
function auroraOpen() {
  if (!S.finaleDone) return false;
  var a = auroraState();
  a.unlocked = true;
  save();
  cancelControl();
  storyBox.hidden = true;
  AURORA_OPEN = true;
  if (!AURORA_UI) {
    var box = document.createElement("section");
    box.id = "auroraJourney";
    box.setAttribute("aria-label", "오로라 온천마을");
    box.innerHTML =
      '<div class="aurora-head"><strong>오로라 온천마을</strong><span id="auroraStatus"></span><button id="auroraZoom">전체 보기</button><button id="auroraClose">기존 마을로</button></div><canvas id="auroraCanvas" width="1080" height="600" aria-label="클릭한 곳으로 이동"></canvas><div id="auroraControls"></div><p>바닥을 눌러 이동하세요. 시설에 가까이 가면 수리·강화할 수 있습니다. 재료는 기존 마을의 가방·창고·적재장에서 가져옵니다.</p>';
    document.body.appendChild(box);
    AURORA_UI = box;
    box.querySelector("#auroraZoom").onclick = function () {
      AURORA_Z = AURORA_Z === 1 ? 2.5 : 1;
    };
    box.querySelector("#auroraClose").onclick = function () {
      AURORA_OPEN = false;
      box.hidden = true;
      save();
      last = performance.now();
    };
    box.querySelector("canvas").onpointerdown = function (e) {
      e.preventDefault();
      try {
        this.setPointerCapture(e.pointerId);
      } catch (ignore) {}
      AURORA_TOUCH[e.pointerId] = { x: e.clientX, y: e.clientY };
      var keys = Object.keys(AURORA_TOUCH);
      if (keys.length === 2) {
        var one = AURORA_TOUCH[keys[0]],
          two = AURORA_TOUCH[keys[1]];
        AURORA_PINCH = {
          d: Math.hypot(one.x - two.x, one.y - two.y),
          z: AURORA_Z,
        };
        AURORA_HERO.tx = AURORA_HERO.x;
        AURORA_HERO.ty = AURORA_HERO.y;
        return;
      }
      var r = this.getBoundingClientRect();
      AURORA_HERO.tx = Math.max(
        30,
        Math.min(
          1050,
          ((e.clientX - r.left) * 1080) / r.width / AURORA_VIEW.z +
            AURORA_VIEW.x,
        ),
      );
      AURORA_HERO.ty = Math.max(
        95,
        Math.min(
          565,
          ((e.clientY - r.top) * this.height) / r.height / AURORA_VIEW.z +
            AURORA_VIEW.y,
        ),
      );
      if (!auroraWalk(AURORA_HERO.tx, AURORA_HERO.ty)) AURORA_HERO.ty = 325;
    };
    var canvas = box.querySelector("canvas");
    canvas.onpointermove = function (e) {
      if (!AURORA_TOUCH[e.pointerId]) return;
      AURORA_TOUCH[e.pointerId] = { x: e.clientX, y: e.clientY };
      var keys = Object.keys(AURORA_TOUCH);
      if (keys.length === 2 && AURORA_PINCH) {
        var one = AURORA_TOUCH[keys[0]],
          two = AURORA_TOUCH[keys[1]];
        AURORA_Z = Math.max(
          1,
          Math.min(
            4,
            (AURORA_PINCH.z * Math.hypot(one.x - two.x, one.y - two.y)) /
              Math.max(1, AURORA_PINCH.d),
          ),
        );
      }
    };
    canvas.onpointerup = canvas.onpointercancel = function (e) {
      delete AURORA_TOUCH[e.pointerId];
      AURORA_PINCH = null;
    };
    canvas.onwheel = function (e) {
      e.preventDefault();
      AURORA_Z = Math.max(
        1,
        Math.min(4, AURORA_Z * (e.deltaY > 0 ? 0.9 : 1.1)),
      );
    };
  }
  AURORA_UI.hidden = false;
  auroraControls();
  return true;
}
function auroraControls() {
  if (!AURORA_UI) return;
  var a = auroraState(),
    area = AURORA_UI.querySelector("#auroraControls");
  area.replaceChildren();
  AURORA_FAC.forEach(function (f) {
    var b = document.createElement("button"),
      near = Math.hypot(AURORA_HERO.x - f.x, AURORA_HERO.y - f.y) < 110;
    b.textContent =
      f.name +
      " " +
      (a[f.key] >= 3
        ? "최고 레벨"
        : (a[f.key] ? "강화" : "수리") +
          " · " +
          Object.keys(f.cost)
            .map(function (id) {
              return (
                (id === "oak"
                  ? "목재"
                  : id === "smoked"
                    ? "가공 식품"
                    : "철 주괴") +
                " " +
                f.cost[id] * (a[f.key] + 1)
              );
            })
            .join(" / "));
    var affordable = Object.keys(f.cost).every(function (id) {
      return (
        auroraInventory(id).reduce(function (sum, v) {
          return sum + v.n;
        }, 0) >=
        f.cost[id] * (a[f.key] + 1)
      );
    });
    b.style.background = affordable ? "#dcf2cf" : "#ffe0d8";
    b.disabled =
      !near || a[f.key] >= 3 || (f.key === "lookout" && !a.dailyReady);
    b.onclick = function () {
      if (!auroraRepair(f.key))
        AURORA_UI.querySelector("#auroraStatus").textContent =
          "재료가 부족합니다";
      auroraControls();
    };
    area.appendChild(b);
  });
  var hire = document.createElement("button");
  hire.textContent =
    "관리인 고용 " +
    a.crew +
    "/3 · " +
    fmt(money50(5000 * (a.crew + 1))) +
    "원";
  hire.disabled = a.crew >= 3;
  hire.onclick = function () {
    auroraHire();
    auroraControls();
  };
  area.appendChild(hire);
}
function updateAurora(dt) {
  AURORA_SAVE_T += dt; if (AURORA_SAVE_T >= 5) { AURORA_SAVE_T = 0; save(); }
  AURORA_TIME += dt;
  var a = auroraState(),
    p = AURORA_HERO,
    dx = p.tx - p.x,
    dy = p.ty - p.y,
    d = Math.hypot(dx, dy);
  p.mv = d > 1;
  if (d) {
    var step = Math.min(d, 90 * dt);
    var nx = p.x + (dx / d) * step,
      ny = p.y + (dy / d) * step;
    if (auroraWalk(nx, ny)) {
      p.x = nx;
      p.y = ny;
    } else {
      var turn = p.x < 510 ? 455 : 565;
      if (auroraWalk(p.x + (turn - p.x) * Math.min(1, dt * 4), p.y))
        p.x += (turn - p.x) * Math.min(1, dt * 4);
    }
  }
  a.cheer = Math.max(0, (a.cheer || 0) - dt);
  a.warmth = Math.min(
    100,
    Math.max(
      0,
      a.warmth + dt * (a.boiler && a.canal ? a.boiler * a.canal * 0.4 : -0.2),
    ),
  );
  a.dailyReady = a.canal >= 2 && a.boiler >= 2 && a.lodge >= 2 && a.crew === 3;
  var earning = a.lodge && a.spring && a.warmth > 20;
  a.service = (a.service || 0) + (earning ? dt * a.crew : 0);
  if (a.service >= 15) {
    a.service -= 15;
    var pay = money50(100 * a.lodge * a.spring);
    S.coins += pay;
    actionIncome(pay);
    a.cheer = 1;
    save();
  }
  if (Math.floor(AURORA_TIME * 4) !== Math.floor((AURORA_TIME - dt) * 4)) {
    auroraControls();
    AURORA_UI.querySelector("#auroraStatus").textContent =
      "온기 " +
      Math.floor(a.warmth) +
      "% · " +
      fmt(S.coins) +
      "원" +
      (a.dailyReady ? " · 전망대 수리 가능" : "");
  }
  drawAurora();
}
function drawAurora() {
  var canvas = AURORA_UI.querySelector("canvas"),
    height = Math.round(
      (1080 * Math.min(window.innerHeight * 0.58, 600)) /
        Math.max(1, canvas.clientWidth),
    );
  if (canvas.height !== height) canvas.height = height;
  var g = canvas.getContext("2d"),
    a = auroraState(),
    t = AURORA_TIME;
  g.fillStyle = "#e3edf4";
  g.fillRect(0, 0, 1080, height);
  AURORA_VIEW = {
    z: AURORA_Z,
    x: Math.max(
      0,
      Math.min(1080 - 1080 / AURORA_Z, AURORA_HERO.x - 540 / AURORA_Z),
    ),
    y:
      600 - height / AURORA_Z < 0
        ? (600 - height / AURORA_Z) / 2
        : Math.max(
            0,
            Math.min(
              600 - height / AURORA_Z,
              AURORA_HERO.y - height / AURORA_Z / 2,
            ),
          ),
  };
  g.save();
  g.scale(AURORA_VIEW.z, AURORA_VIEW.z);
  g.translate(-AURORA_VIEW.x, -AURORA_VIEW.y);
  g.fillStyle = "#e3edf4";
  g.fillRect(0, 0, 1080, 600);
  var sky = g.createLinearGradient(0, 0, 1080, 130);
  sky.addColorStop(0, "#17394b");
  sky.addColorStop(0.5, "#549d8c");
  sky.addColorStop(1, "#493b78");
  g.fillStyle = sky;
  g.fillRect(0, 0, 1080, 90);
  if (!MOTION3D_REDUCED.matches) {
    g.strokeStyle = "rgba(133,240,177,.25)";
    g.lineWidth = 9;
    for (var band = 0; band < 3; band++) {
      g.beginPath();
      for (var u = 0; u <= 1080; u += 30)
        g.lineTo(u, 38 + band * 12 + Math.sin(u * 0.012 + t * 0.3 + band) * 12);
      g.stroke();
    }
  }
  for (var tree = 0; tree < 14; tree++) {
    var tx = 40 + tree * 76;
    drawSprite(g, "pine_small", "idle", t, tx, 150, 20, false);
  }
  for (var side = 0; side < 2; side++)
    for (var row = 0; row < 4; row++)
      drawSprite(
        g,
        "pine",
        "idle",
        t,
        side ? 1035 : 45,
        245 + row * 85,
        22,
        !!side,
      );
  g.strokeStyle = "#e8c08a";
  g.lineWidth = 38;
  g.lineCap = "round";
  g.beginPath();
  g.moveTo(150, 510);
  g.lineTo(980, 510);
  g.moveTo(510, 510);
  g.lineTo(510, 160);
  g.stroke();
  AURORA_FAC.forEach(function (f) {
    if (
      !drawSprite(
        g,
        f.model,
        a[f.key] ? "repaired" : "broken",
        t,
        f.x,
        f.y,
        32 * (0.9 + 0.1 * a[f.key]),
        false,
      )
    ) {
      g.fillStyle = a[f.key] ? "#8baf9c" : "#968c87";
      g.fillRect(f.x - 45, f.y - 65, 90, 65);
    }
    g.font = "bold 17px sans-serif";
    g.textAlign = "center";
    g.fillStyle = "#29463f";
    g.fillText(
      f.name + " " + (a[f.key] ? "Lv" + a[f.key] : "수리 필요"),
      f.x,
      f.y + 35,
    );
  });
  for (var i = 0; i < a.crew; i++) {
    var phase = (t + i * 4) % 12,
      moving = phase < 4,
      x = 150 + (moving ? phase / 4 : 1) * 350,
      y = 440 + i * 25;
    drawSprite(
      g,
      "aurora_keeper",
      a.cheer
        ? "cheer"
        : moving
          ? "walk"
          : a.boiler && a.canal
            ? "work"
            : "idle",
      t,
      x,
      y,
      25,
      false,
    );
  }
  if (a.lodge) {
    for (var j = 0; j < 3; j++) {
      var ph = (t + j * 8) % 32,
        move = ph < 8 || ph > 24,
        x = ph < 8 ? 1080 - ph * 28 : ph > 24 ? 856 + (ph - 24) * 28 : 856;
      drawSprite(
        g,
        j === 0 ? "shopkeeper" : "villager",
        a.cheer ? "cheer" : move ? "walk" : "idle",
        t + j,
        x,
        350 + j * 32,
        24,
        ph > 24,
      );
    }
  }
  drawSprite(
    g,
    "hero",
    a.cheer ? "cheer" : AURORA_HERO.mv ? "walk" : "idle",
    t,
    AURORA_HERO.x,
    AURORA_HERO.y,
    30,
    AURORA_HERO.tx > AURORA_HERO.x,
  );
  g.restore();
}

if (/[?&]test=1/.test(location.search))
  window.__completeActions = {
    state: actionState,
    event: actionEvent,
    income: actionIncome,
    reward: actionReward,
    aurora: auroraState,
    open: auroraOpen,
    repair: auroraRepair,
    hire: auroraHire,
    move: function (x, y) {
      AURORA_HERO.x = x;
      AURORA_HERO.y = y;
      AURORA_HERO.tx = x;
      AURORA_HERO.ty = y;
    },
    view: function () {
      return { z: AURORA_Z, camera: AURORA_VIEW };
    },
    tick: function (dt) {
      if (AURORA_OPEN) updateAurora(dt);
      else updateCompleteActions(dt);
    },
  };
