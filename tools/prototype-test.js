/* Headless playthrough test for The Moonlit Evening Mystery prototype.
 * Requires jsdom (installed outside the repo, see NODE_PATH).
 * Run:  node tools/prototype-test.js
 */
const path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");

const ROOT = path.resolve(__dirname, "..");
const INDEX = path.join(ROOT, "index.html");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let failures = [];
function check(name, cond, extra) {
  const status = cond ? "OK " : "FAIL";
  console.log(`[${status}] ${name}${extra ? " — " + extra : ""}`);
  if (!cond) failures.push(name);
}

async function boot() {
  const errors = [];
  const vc = new VirtualConsole();
  vc.on("jsdomError", (e) => {
    const msg = String(e.message || e);
    if (/Could not load img|Could not parse CSS|Not implemented/.test(msg)) return;
    errors.push(msg);
  });
  const dom = process.env.BMH_URL
    ? await JSDOM.fromURL(process.env.BMH_URL, {
        runScripts: "dangerously",
        resources: "usable",
        pretendToBeVisual: true,
        virtualConsole: vc
      })
    : await JSDOM.fromFile(INDEX, {
        runScripts: "dangerously",
        resources: "usable",
        pretendToBeVisual: true,
        virtualConsole: vc
      });
  const { window } = dom;
  window.Image = function () {
    this.complete = true;
    this.onload = null;
    this.onerror = null;
    let _src = "";
    Object.defineProperty(this, "src", { get() { return _src; }, set(v) { _src = v; } });
  };
  window.addEventListener("error", (e) => {
    errors.push(e.error ? (e.error.stack || e.error.message) : e.message);
  });
  await new Promise((resolve) => {
    if (window.document.readyState === "complete") { resolve(); return; }
    window.addEventListener("load", resolve);
  });
  await sleep(80);
  return { window, doc: window.document, errors };
}

function mkHelpers(window, doc) {
  const $ = (id) => doc.getElementById(id);
  const click = (el, what) => {
    if (!el) throw new Error("missing element: " + (what || "?"));
    el.click();
  };
  return { $, click };
}

async function waitFor(fn, timeoutMs, what) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    if (fn()) return true;
    await sleep(50);
  }
  throw new Error("timeout waiting for " + what);
}

async function solveTask(task, doc) {
  const body = doc.getElementById("taskBody");
  if (task.kind === "tf") {
    const rows = [...body.querySelectorAll(".tf-row")];
    rows.forEach((row, i) => {
      const btns = row.querySelectorAll(".mini-btn");
      (task.stmts[i].a ? btns[0] : btns[1]).click();
    });
  } else if (task.kind === "quiz") {
    const wide = [...body.querySelectorAll(".mini-btn.wide")];
    wide[task.a].click();
  } else if (task.kind === "multi") {
    const wide = [...body.querySelectorAll(".mini-btn.wide")];
    const optBtns = wide.filter((b) => b.dataset.idx !== undefined);
    task.a.forEach((i) => {
      const b = optBtns.find((x) => x.dataset.idx === String(i));
      if (!b) throw new Error("multi option not found: idx " + i);
      b.click();
    });
    wide[wide.length - 1].click();
  } else if (task.kind === "order") {
    let seq;
    if (task.answer.includes("|")) {
      seq = task.answer.split("|").map((s) => s.trim());
    } else {
      seq = task.words.slice().sort((a, b) => task.answer.indexOf(a) - task.answer.indexOf(b));
    }
    for (const token of seq) {
      const chips = [...body.querySelectorAll(".chip")];
      const chip = chips.find((c) => c.textContent === token);
      if (!chip) throw new Error("order chip not found: " + token);
      chip.click();
    }
    const checks = [...body.querySelectorAll(".mini-btn.check")];
    checks[checks.length - 1].click();
  }
  await sleep(30);
}

async function playthrough({ wrongFirstChoice = false, wrongFirstTask = false, stopAfterScenes = null } = {}) {
  const { window, doc, errors } = await boot();
  const { $, click } = mkHelpers(window, doc);
  const BMH = window.__BMH__;
  if (!BMH) throw new Error("__BMH__ not exposed — app scripts did not run");
  click($("btnStart"), "start");
  await sleep(30);

  const visited = new Set();
  let wrongChoiceDone = false;
  let wrongTaskDone = false;
  let vocabSeen = 0;
  let taskCyrillic = 0;
  let choiceCount = 0;
  let correctFirstCount = 0;
  let nextLeak = 0;
  let musicMismatch = 0;
  let steps = 0;

  while (steps++ < 6000) {
    if (!$("endScreen").hidden) break;
    if (stopAfterScenes && visited.size >= stopAfterScenes && BMH.state.scene > 0) break;

    if (!$("watsonPopup").hidden) { click($("watsonClose"), "watson close"); await sleep(20); continue; }
    if (!$("notebookPanel").hidden) { click($("notebookClose"), "notebook close"); continue; }

    const st = BMH.state;
    const sc = BMH.scenes[st.scene];
    if (!sc) throw new Error("bad scene index " + st.scene);
    visited.add(sc.id);
    if (BMH.music && sc.music && !$("gameScreen").hidden && BMH.music.current() !== sc.music) musicMismatch++;
    const item = sc.items[st.pos];

    if (!$("taskPanel").hidden) {
      const panelTitle = $("taskTitle").textContent;
      const isVocab = panelTitle === "Mini-dictionary";
      const hasCyr = /[\u0400-\u04FF]/.test($("taskPanel").textContent);
      if (isVocab) { vocabSeen++; }
      else if (hasCyr) { taskCyrillic++; }
      if (item && item.task) {
        if (wrongFirstTask && !wrongTaskDone && item.task.kind === "quiz") {
          const wide = [...doc.getElementById("taskBody").querySelectorAll(".mini-btn.wide")];
          const wrongIdx = item.task.a === 0 ? 1 : 0;
          wide[wrongIdx].click();
          await sleep(30);
          if (!$("watsonPopup").hidden) { click($("watsonClose"), "watson close"); wrongTaskDone = true; }
          await waitFor(() => $("watsonPopup").hidden && !$("taskPanel").hidden, 2000, "task panel back");
        }
        await solveTask(item.task, doc);
        await sleep(480);
      } else {
        const btns = [...doc.getElementById("taskBody").querySelectorAll(".mini-btn")];
        const cont = btns.find((b) => /Continue/.test(b.textContent));
        click(cont, "vocab continue");
        await sleep(30);
      }
      continue;
    }

    if ($("dialogue").hidden) {
      const hs = [...doc.querySelectorAll(".hotspot.clue")].filter((h) => h.dataset.found !== "1");
      if (hs.length) { hs[0].click(); await sleep(40); continue; }
      await sleep(150);
      continue;
    }

    const choiceBtns = [...$("choices").children];
    if (choiceBtns.length && item && item.opts) {
      choiceCount++;
      await waitFor(() => $("lineText").textContent === (item.prompt.t || ""), 5000, "choice prompt typed");
      if (!$("btnNext").hidden) nextLeak++;
      const correctOpt = item.opts.find((o) => o.ok);
      if (!correctOpt) throw new Error("choice without correct option in " + sc.id);
      const correctBtn = choiceBtns.find((b) => b.querySelector(".choice-en").textContent === correctOpt.t);
      if (!correctBtn) throw new Error("correct button not found in " + sc.id);
      if (choiceBtns.indexOf(correctBtn) === 0) correctFirstCount++;
      if (wrongFirstChoice && !wrongChoiceDone) {
        const wrongOpt = item.opts.find((o) => !o.ok);
        const wrongBtn = choiceBtns.find((b) => b.querySelector(".choice-en").textContent === wrongOpt.t);
        if (wrongBtn) {
          wrongBtn.click();
          await sleep(30);
          if (!$("watsonPopup").hidden) { click($("watsonClose"), "watson close"); wrongChoiceDone = true; }
          await waitFor(() => $("watsonPopup").hidden, 2000, "watson closed");
        }
      }
      correctBtn.click();
      await sleep(30);
      continue;
    }

    if (!$("btnNext").hidden) { click($("btnNext"), "next"); await sleep(20); continue; }
    click($("btnNext"), "next (skip typing)");
    await sleep(20);
  }

  return { window, doc, errors, BMH, visited, $, click, steps, vocabSeen, taskCyrillic, choiceCount, correctFirstCount, nextLeak, musicMismatch };
}

(async () => {
  console.log("=== Test 1: perfect playthrough ===");
  const run1 = await playthrough();
  check("end screen reached", !run1.$("endScreen").hidden);
  check("all 10 scenes visited", run1.visited.size === 10, "visited: " + [...run1.visited].join(","));
  check("no js errors", run1.errors.length === 0, run1.errors.slice(0, 3).join(" | "));
  check("all 7 clues collected", run1.BMH.state.clues.length === 7, "clues: " + run1.BMH.state.clues.join(","));
  const gotBadges = [...run1.doc.querySelectorAll(".badge.got")];
  const missedBadges = [...run1.doc.querySelectorAll(".badge.missed")];
  check("4 badges earned, 0 missed", gotBadges.length === 4 && missedBadges.length === 0,
    "got=" + gotBadges.length + " missed=" + missedBadges.length);
  check("perfect run has no wrong choices/tasks", run1.BMH.state.wrongChoices === 0 && run1.BMH.state.wrongTasks === 0,
    "wc=" + run1.BMH.state.wrongChoices + " wt=" + run1.BMH.state.wrongTasks);
  check("no Russian in tasks", run1.taskCyrillic === 0, "task panels with cyrillic: " + run1.taskCyrillic);
  check("mini-dictionaries seen and bilingual", run1.vocabSeen === 10, "vocab panels: " + run1.vocabSeen);
  check("choices shuffled (not always correct-first)", run1.choiceCount >= 9 && run1.correctFirstCount < run1.choiceCount,
    "choices=" + run1.choiceCount + " correctFirst=" + run1.correctFirstCount);
  check("Next hidden while choices active (no skip)", run1.nextLeak === 0, "leaks: " + run1.nextLeak);
  check("per-chapter music follows scene", run1.musicMismatch === 0, "mismatches: " + run1.musicMismatch);

  console.log("");
  console.log("=== Test 2: wrong choice + wrong task + badges ===");
  const run2 = await playthrough({ wrongFirstChoice: true, wrongFirstTask: true });
  check("end screen reached (run 2)", !run2.$("endScreen").hidden);
  check("wrong choice counted", run2.BMH.state.wrongChoices >= 1, "wc=" + run2.BMH.state.wrongChoices);
  check("wrong task counted", run2.BMH.state.wrongTasks >= 1, "wt=" + run2.BMH.state.wrongTasks);
  check("polite badge missed", [...run2.doc.querySelectorAll(".badge.missed")].length === 2,
    "missed badges: " + [...run2.doc.querySelectorAll(".badge.missed")].length);
  check("no js errors (run 2)", run2.errors.length === 0, run2.errors.slice(0, 3).join(" | "));

  console.log("");
  console.log("=== Test 3: translate toggle + notebook ===");
  {
    const { window, doc, errors } = await boot();
    const { $, click } = mkHelpers(window, doc);
    click($("btnStart"), "start");
    await sleep(60);
    // first item is narration (no sp) — advance to the line with ru
    click($("btnNext"), "next skip");
    await sleep(20);
    click($("btnNext"), "next");
    await sleep(20);
    check("dialogue visible", !$("dialogue").hidden);
    check("ru hidden by default", $("lineRu").hidden);
    click($("btnLang"), "lang");
    check("ru visible after toggle", !$("lineRu").hidden, "lineRu text: " + $("lineRu").textContent);
    click($("btnLang"), "lang");
    check("ru hidden after second toggle", $("lineRu").hidden);
    click($("btnNotebook"), "notebook");
    check("notebook opens", !$("notebookPanel").hidden);
    check("notebook has suspects", /Suspects/.test($("notebookBody").textContent));
    click($("notebookClose"), "notebook close");
    check("notebook closes", $("notebookPanel").hidden);
    check("no js errors (run 3)", errors.length === 0, errors.slice(0, 3).join(" | "));
  }

  console.log("");
  console.log("=== Test 4: home / continue ===");
  {
    const { window, doc } = await boot();
    const { $, click } = mkHelpers(window, doc);
    click($("btnStart"), "start");
    await sleep(60);
    for (let i = 0; i < 8; i++) { click($("btnNext"), "skip"); await sleep(15); }
    const scBefore = window.__BMH__.state.scene;
    const posBefore = window.__BMH__.state.pos;
    click($("btnHome"), "home");
    await sleep(30);
    check("title screen shown", !$("titleScreen").hidden);
    check("continue button visible", !$("btnContinue").hidden);
    click($("btnContinue"), "continue");
    await sleep(60);
    check("resumed scene", window.__BMH__.state.scene === scBefore && window.__BMH__.state.pos === posBefore,
      "before " + scBefore + ":" + posBefore + " after " + window.__BMH__.state.scene + ":" + window.__BMH__.state.pos);
  }

  console.log("");
  console.log("=== Test 5: save right after last clue (no soft-lock) ===");
  {
    const { window, doc, errors } = await boot();
    const { $, click } = mkHelpers(window, doc);
    const BMH = window.__BMH__;
    click($("btnStart"), "start");
    await sleep(40);
    let steps = 0;
    while (steps++ < 4000) {
      if (!BMH) throw new Error("no __BMH__");
      if (!$("watsonPopup").hidden) { click($("watsonClose")); continue; }
      if (!$("taskPanel").hidden) {
        const st = BMH.state;
        const it = BMH.scenes[st.scene].items[st.pos];
        if (it && it.task) { await solveTask(it.task, doc); await sleep(480); }
        else {
          const cont = [...doc.getElementById("taskBody").querySelectorAll(".mini-btn")].find((b) => /Continue/.test(b.textContent));
          click(cont); await sleep(30);
        }
        continue;
      }
      if ($("dialogue").hidden) {
        const hs = [...doc.querySelectorAll(".hotspot.clue")].filter((h) => h.dataset.found !== "1");
        if (hs.length) {
          const isLast = hs.length === 1;
          hs[0].click();
          if (isLast && doc.querySelectorAll(".hotspot").length) {
            // save & leave immediately, before the 900ms completion timer
            click($("btnHome"), "home");
            break;
          }
          await sleep(40);
          continue;
        }
        await sleep(80);
        continue;
      }
      const choiceBtns = [...$("choices").children];
      const st = BMH.state;
      const item = BMH.scenes[st.scene].items[st.pos];
      if (choiceBtns.length && item && item.opts) {
        const cOpt = item.opts.find((o) => o.ok);
        const cBtn = choiceBtns.find((b) => b.querySelector(".choice-en").textContent === cOpt.t);
        cBtn.click();
        await sleep(30);
        continue;
      }
      click($("btnNext"), "next");
      await sleep(15);
    }
    check("left game mid-clue-mode", !$("titleScreen").hidden);
    click($("btnContinue"), "continue");
    await sleep(400);
    check("clues after resume (4 = photo + 3 east wing)", BMH.state.clues.length === 4, "clues: " + BMH.state.clues.length);
    check("clue scene resumed with continue option", !$("dialogue").hidden && !$("btnNext").hidden);
    check("no js errors (run 5)", errors.length === 0, errors.slice(0, 3).join(" | "));
  }

  console.log("");
  console.log("=== Test 6: Ash popup over task panel (bug regression) ===");
  {
    const { window, doc, errors } = await boot();
    const { $, click } = mkHelpers(window, doc);
    const BMH = window.__BMH__;
    click($("btnStart"), "start");
    await sleep(40);
    let steps = 0;
    while (steps++ < 800) {
      if (!$("taskPanel").hidden) break;
      if (!$("watsonPopup").hidden) { click($("watsonClose")); continue; }
      const st = BMH.state;
      const item = BMH.scenes[st.scene].items[st.pos];
      const choiceBtns = [...$("choices").children];
      if (choiceBtns.length && item && item.opts) {
        const cOpt = item.opts.find((o) => o.ok);
        const cBtn = choiceBtns.find((b) => b.querySelector(".choice-en").textContent === cOpt.t);
        cBtn.click();
        await sleep(30);
        continue;
      }
      click($("btnNext"), "next");
      await sleep(20);
    }
    check("reached first task", !$("taskPanel").hidden);
    const task = BMH.scenes[BMH.state.scene].items[BMH.state.pos].task;
    check("first task is True/False", !!task && task.kind === "tf");
    const posBefore = BMH.state.pos;
    const rows = [...doc.getElementById("taskBody").querySelectorAll(".tf-row")];
    for (let i = 0; i < rows.length; i++) {
      const btns = rows[i].querySelectorAll(".mini-btn");
      (task.stmts[i].a ? btns[1] : btns[0]).click();
      await sleep(30);
    }
    check("watson popup visible after wrong last answer", !$("watsonPopup").hidden);
    check("watson popup above task panel (z>=90)", parseInt($("watsonPopup").style.zIndex || "0", 10) >= 90,
      "z=" + $("watsonPopup").style.zIndex);
    check("task waits for popup to close", BMH.state.pos === posBefore && !$("taskPanel").hidden);
    click($("watsonClose"), "close watson");
    await sleep(700);
    check("popup closed after click", $("watsonPopup").hidden);
    check("task proceeded after closing popup", BMH.state.pos > posBefore);
    check("no stale popup after task done", $("watsonPopup").hidden);
    check("no js errors (run 6)", errors.length === 0, errors.slice(0, 3).join(" | "));
  }

  console.log("");
  console.log("=== Test 7: scene transition waits for assets (no sprite-before-bg) ===");
  {
    const { window, doc } = await boot();
    const { $, click } = mkHelpers(window, doc);
    const pending = [];
    function FakeImage() {
      this.complete = false;
      this.onload = null;
      this.onerror = null;
      const self = this;
      let _src = "";
      Object.defineProperty(this, "src", {
        get() { return _src; },
        set(v) { _src = v; pending.push(self); }
      });
    }
    const fire = () => {
      let guard = 0;
      while (pending.length && guard++ < 50) {
        const im = pending.shift();
        if (im.onload) { im.onload(); }
      }
    };
    window.Image = FakeImage;

    click($("btnStart"), "start");
    await sleep(80);
    check("dialogue hidden while first scene assets load", $("dialogue").hidden);
    fire();
    await sleep(80);
    check("first scene rendered after assets ready", !$("dialogue").hidden);
    check("prologue bg applied after assets ready", /BG_causeway_night/.test($("bg").src),
      "bg src: " + $("bg").src);

    const BMH = window.__BMH__;
    BMH.state.scene = 4;
    BMH.state.pos = 0;
    BMH.state.clues = [];
    click($("btnHome"), "home");
    click($("btnContinue"), "continue");
    await sleep(80);
    check("sprites hidden while cast assets load", $("sprites").children.length === 0,
      "sprites: " + $("sprites").children.length);
    check("old bg kept while cast assets load", /BG_causeway_night/.test($("bg").src),
      "bg src: " + $("bg").src);
    fire();
    await sleep(80);
    check("cast shown only after assets ready", $("sprites").children.length === 2,
      "sprites: " + $("sprites").children.length);
    check("new bg applied after assets ready", /BG_eastwing/.test($("bg").src),
      "bg src: " + $("bg").src);
  }

  console.log("");
  console.log("=== Test 8: magnifier cursor in search mode ===");
  {
    const { window, doc } = await boot();
    const { $, click } = mkHelpers(window, doc);
    const BMH = window.__BMH__;
    const ch4 = BMH.scenes[4];
    const clueIdx = ch4.items.findIndex((i) => i.clues);
    BMH.state.scene = 4;
    BMH.state.pos = clueIdx;
    BMH.state.clues = [];
    click($("btnHome"), "home");
    click($("btnContinue"), "continue");
    await sleep(120);
    check("search mode class on hotspots", $("hotspots").classList.contains("searching"));
    const spots = [...doc.querySelectorAll("#hotspots .hotspot.clue")];
    check("three east wing hotspots placed", spots.length === 3, "spots: " + spots.length);
    for (const s of spots) { s.click(); await sleep(60); }
    await sleep(1100);
    check("clues collected via hotspots", BMH.state.clues.length === 3, "clues: " + BMH.state.clues.length);
    check("search mode class removed after search", !$("hotspots").classList.contains("searching"));
    check("dialogue visible after search", !$("dialogue").hidden && !$("btnNext").hidden);
  }

  console.log("");
  if (failures.length) {
    console.log("RESULT: " + failures.length + " failure(s): " + failures.join("; "));
    process.exit(1);
  } else {
    console.log("RESULT: all tests passed");
  }
})().catch((e) => {
  console.error("TEST CRASH:", e.stack || e.message);
  process.exit(2);
});
