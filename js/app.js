/* The Moonlit Evening Mystery — prototype engine */
(function () {
  "use strict";

  var CLUES = window.CLUES;
  var SCENES = window.STORY.scenes;
  var SUSPECTS = window.SUSPECTS;
  var SAVE_KEY = "bmh_save_v1";

  var $ = function (id) { return document.getElementById(id); };
  var els = {
    title: $("titleScreen"), game: $("gameScreen"), end: $("endScreen"),
    btnStart: $("btnStart"), btnContinue: $("btnContinue"), btnAbout: $("btnAbout"),
    about: $("aboutModal"), btnAboutClose: $("btnAboutClose"),
    bg: $("bg"), sprites: $("sprites"), hotspots: $("hotspots"),
    chapterLabel: $("chapterLabel"), chapterCard: $("chapterCard"),
    dialogue: $("dialogue"), nameplate: $("nameplate"), lineText: $("lineText"),
    lineRu: $("lineRu"), btnNext: $("btnNext"),
    choices: $("choices"),
    topbar: $("topbar"),
    btnHome: $("btnHome"), btnNotebook: $("btnNotebook"),
    btnWatsonTop: $("btnWatsonTop"), btnLang: $("btnLang"), btnMusic: $("btnMusic"),
    watsonPopup: $("watsonPopup"), watsonText: $("watsonText"), watsonClose: $("watsonClose"),
    cluePopup: $("cluePopup"), clueImg: $("clueImg"), clueTitle: $("clueTitle"),
    clueText: $("clueText"), clueTextRu: $("clueTextRu"), clueClose: $("clueClose"),
    notebook: $("notebookPanel"), notebookBody: $("notebookBody"), notebookClose: $("notebookClose"),
    taskPanel: $("taskPanel"), taskTitle: $("taskTitle"), taskBody: $("taskBody"), taskHint: $("taskHint"),
    toast: $("toast"),
    endBadges: $("endBadges"), btnRestart: $("btnRestart"), btnEndTitle: $("btnEndTitle")
  };

  var state = {
    scene: 0, pos: 0,
    clues: [],
    wrongChoices: 0, wrongTasks: 0,
    lang: "en",
    hint: "",
    typeTimer: null,
    typing: false,
    dialogCtx: null
  };

  /* dialogue frame preload: the box must never appear before its parchment frame */
  var frameReady = false;
  var frameQueue = [];
  function whenFrameReady(fn) {
    if (frameReady) { fn(); return; }
    frameQueue.push(fn);
  }
  function preloadDialogueUi() {
    var markReady = function () {
      if (frameReady) { return; }
      frameReady = true;
      var q = frameQueue.splice(0);
      q.forEach(function (f) { f(); });
    };
    var frame = new Image();
    frame.onload = markReady;
    frame.onerror = markReady;
    frame.src = "assets/UI_dialogue_frame.png";
    if (frame.complete) { markReady(); }
    setTimeout(markReady, 2500);
    var plate = new Image();
    plate.src = "assets/UI_name_plate.png";
  }

  /* ---------------- persistence ---------------- */

  var memSave = null;

  function save() {
    var data = {
      scene: state.scene, pos: state.pos, clues: state.clues,
      wrongChoices: state.wrongChoices, wrongTasks: state.wrongTasks, lang: state.lang
    };
    memSave = data;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
  }
  function loadSave() {
    try {
      var s = localStorage.getItem(SAVE_KEY);
      if (s) { return JSON.parse(s); }
    } catch (e) { /* ignore */ }
    return memSave;
  }
  function clearSave() {
    memSave = null;
    try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
  }

  function resetState() {
    state.scene = 0; state.pos = 0; state.clues = [];
    state.wrongChoices = 0; state.wrongTasks = 0;
    state.hint = ""; state.typing = false;
    if (state.typeTimer) { clearInterval(state.typeTimer); state.typeTimer = null; }
  }

  /* ---------------- screens ---------------- */

  function showScreen(name) {
    els.title.hidden = name !== "title";
    els.game.hidden = name !== "game";
    els.end.hidden = name !== "end";
  }

  function initTitle() {
    var sv = loadSave();
    els.btnContinue.hidden = !sv;
    els.btnStart.onclick = function () {
      clearSave(); resetState(); save(); startGame();
    };
    els.btnContinue.onclick = function () {
      var s = loadSave();
      if (s) {
        resetState();
        state.scene = s.scene || 0; state.pos = s.pos || 0;
        state.clues = s.clues || [];
        state.wrongChoices = s.wrongChoices || 0;
        state.wrongTasks = s.wrongTasks || 0;
        state.lang = s.lang || "en";
        startGame();
      }
    };
    els.btnAbout.onclick = function () { els.about.hidden = false; };
    els.btnAboutClose.onclick = function () { els.about.hidden = true; };
  }

  /* ---------------- game flow ---------------- */

  function startGame() {
    showScreen("game");
    updateLangLabel();
    renderScene();
  }

  function renderScene() {
    var sc = SCENES[state.scene];
    if (!sc) { endGame(); return; }
    els.chapterLabel.textContent = sc.chapter + " · " + sc.title;
    chapterCard(sc.chapter + " — " + sc.title);
    playMusic(sc.music, 1400);
    clearHotspots();
    els.taskPanel.hidden = true;
    els.choices.innerHTML = "";
    els.dialogue.hidden = true;
    clearSprites();
    sc.cast = sc.cast || {};
    var srcs = [sc.bg];
    Object.keys(sc.cast).forEach(function (name) { srcs.push(sc.cast[name].img); });
    loadSceneAssets(srcs, function () {
      els.bg.src = sc.bg;
      clearSprites();
      Object.keys(sc.cast).forEach(function (name) { setSprite(name, sc.cast[name]); });
      renderItem();
      warmScene(state.scene + 1);
    });
  }

  function chapterCard(text) {
    els.chapterCard.textContent = text;
    els.chapterCard.classList.add("show");
    setTimeout(function () { els.chapterCard.classList.remove("show"); }, 1800);
  }

  function setSprite(name, c) {
    var img = document.createElement("img");
    img.className = "sprite sprite-" + (c.side || "right");
    img.src = c.img;
    img.alt = name;
    img.dataset.id = c.img.split("/").pop().replace(".png", "");
    img.dataset.charName = name;
    els.sprites.appendChild(img);
  }

  function clearSprites() { els.sprites.innerHTML = ""; }

  function fitBgOverflow() {
    var iw = els.bg.naturalWidth || 1920;
    var ih = els.bg.naturalHeight || 1080;
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var scale = Math.max(vw / iw, vh / ih);
    var overflow = Math.max(0, ih * scale - vh) / 2;
    document.documentElement.style.setProperty("--bg-overflow", overflow.toFixed(1) + "px");
  }

  /* ---------------- asset preloading ---------------- */

  var flowToken = 0;

  function preload(src, done) {
    var settled = false;
    var finish = function () {
      if (settled) { return; }
      settled = true;
      done();
    };
    if (!src) { finish(); return; }
    var im = new Image();
    im.onload = finish;
    im.onerror = finish;
    im.src = src;
    if (im.complete) { finish(); }
    setTimeout(finish, 2500);
  }

  function loadSceneAssets(srcs, cb) {
    var token = ++flowToken;
    var left = srcs.length;
    if (!left) { cb(); return; }
    srcs.forEach(function (src) {
      preload(src, function () {
        left--;
        if (!left && token === flowToken) { cb(); }
      });
    });
  }

  function warmScene(idx) {
    var sc = SCENES[idx];
    if (!sc || !sc.bg) { return; }
    var im = new Image();
    im.src = sc.bg;
  }

  /* ---------------- music ---------------- */

  var MUSIC = {
    dread: "assets/music/dread.mp3",
    mystery: "assets/music/mystery.mp3",
    warm: "assets/music/warm.mp3",
    tension: "assets/music/tension.mp3",
    cold: "assets/music/cold.mp3",
    climax: "assets/music/climax.mp3",
    dawn: "assets/music/dawn.mp3"
  };
  var MUSIC_KEY = "bmh_music_v1";
  var MUSIC_VOL = 0.42;
  var musicEls = null;
  var musicIdx = 0;
  var musicSrc = null;
  var musicKey = null;
  var lastChoiceSlot = null;
  var lastQuizSlot = null;

  function musicEnabled() {
    try { return localStorage.getItem(MUSIC_KEY) !== "off"; } catch (e) { return true; }
  }

  function ensureAudio() {
    if (musicEls) { return; }
    musicEls = [document.createElement("audio"), document.createElement("audio")];
    musicEls[0].preload = "auto";
    musicEls[1].preload = "auto";
  }

  function fadeTo(el, target, ms, done) {
    if (el._fadeTimer) { clearInterval(el._fadeTimer); el._fadeTimer = null; }
    var start = el.volume;
    var t0 = Date.now();
    el._fadeTimer = setInterval(function () {
      var k = Math.min(1, (Date.now() - t0) / ms);
      el.volume = Math.max(0, Math.min(1, start + (target - start) * k));
      if (k >= 1) {
        clearInterval(el._fadeTimer);
        el._fadeTimer = null;
        if (done) { done(); }
      }
    }, 50);
  }

  function playMusic(key, fadeMs) {
    musicKey = key || null;
    var src = MUSIC[key];
    if (!src || !musicEnabled()) { return; }
    ensureAudio();
    if (musicSrc === src && !musicEls[musicIdx].paused) { return; }
    var cur = musicEls[musicIdx];
    var nxt = musicEls[1 - musicIdx];
    musicIdx = 1 - musicIdx;
    musicSrc = src;
    nxt.src = src;
    nxt.loop = true;
    nxt.volume = 0;
    try {
      var p = nxt.play();
      if (p && p.catch) { p.catch(function () {}); }
    } catch (e) {}
    fadeTo(nxt, MUSIC_VOL, fadeMs || 1200);
    fadeTo(cur, 0, fadeMs || 1200, function () { cur.pause(); });
  }

  function stopMusic(fadeMs) {
    musicKey = null;
    musicSrc = null;
    if (!musicEls) { return; }
    musicEls.forEach(function (el) {
      fadeTo(el, 0, fadeMs || 700, function () { el.pause(); });
    });
  }

  function setMusicEnabled(on) {
    try { localStorage.setItem(MUSIC_KEY, on ? "on" : "off"); } catch (e) {}
    if (els.btnMusic) { els.btnMusic.classList.toggle("off", !on); }
    if (on) {
      musicSrc = null;
      if (musicKey) { playMusic(musicKey, 600); }
    } else {
      stopMusic(400);
    }
  }

  function renderItem() {
    var sc = SCENES[state.scene];
    if (!sc || state.pos >= sc.items.length) { nextScene(); return; }
    if (state.typeTimer) { clearInterval(state.typeTimer); state.typeTimer = null; state.typing = false; }
    var item = sc.items[state.pos];
    state.dialogCtx = item;

    if (item.bg) {
      els.dialogue.hidden = true;
      loadSceneAssets([item.bg], function () {
        els.bg.src = item.bg;
        state.pos++;
        renderItem();
      });
      return;
    }
    if (item.clearChars) { clearSprites(); sc.cast = {}; state.pos++; renderItem(); return; }
    if (item.dropChars) {
      item.dropChars.forEach(function (n) {
        var el = els.sprites.querySelector('[data-char-name="' + n + '"]');
        if (el && el.parentNode) { el.parentNode.removeChild(el); }
        delete sc.cast[n];
      });
      state.pos++;
      renderItem();
      return;
    }
    if (item.cast) {
      Object.keys(item.cast).forEach(function (n) {
        sc.cast[n] = item.cast[n];
        setSprite(n, item.cast[n]);
      });
    }
    if (item.note) {
      addClue(item.note.clue, true);
      if (item.t) { showCluePopup(item); return; }
      state.pos++;
      renderItem();
      return;
    }
    if (item.vocab) { showVocab(item.vocab); return; }
    if (item.prompt && item.opts) { renderChoice(item); return; }
    if (item.clues) { startClueMode(item.clues); return; }
    if (item.task) { startTask(item.task); return; }
    if (item.end) { endGame(); return; }
    renderDialogue(item);
  }

  function renderDialogue(item) {
    whenFrameReady(function () {
      els.choices.innerHTML = "";
      els.dialogue.hidden = false;
      var sc = SCENES[state.scene];
      if (item.sp && sc.cast && sc.cast[item.sp]) {
        /* sprite already present; ensure it is visible */
      }
      els.nameplate.hidden = !item.sp;
      els.nameplate.textContent = item.sp || "";
      els.lineText.className = item.sp ? "line" : "line narration";
      els.lineRu.hidden = !(item.ru && state.lang === "both");
      els.lineRu.textContent = item.ru || "";
      state.hint = item.hint || sc.objective || "";
      typeText(item.t || "");
    });
  }

  function typeText(text) {
    if (state.typeTimer) { clearInterval(state.typeTimer); state.typeTimer = null; }
    state.typing = true;
    els.btnNext.hidden = true;
    var i = 0;
    els.lineText.textContent = "";
    state.typeTimer = setInterval(function () {
      i += 2;
      els.lineText.textContent = text.slice(0, i);
      if (i >= text.length) {
        clearInterval(state.typeTimer);
        state.typeTimer = null;
        state.typing = false;
        els.btnNext.hidden = els.choices.children.length > 0;
      }
    }, 18);
  }

  function advance() {
    state.pos++;
    save();
    renderItem();
  }

  function nextScene() {
    state.scene++;
    state.pos = 0;
    save();
    if (state.scene >= SCENES.length) { endGame(); return; }
    renderScene();
  }

  /* ---------------- choices ---------------- */

  function shuffleOrder(n) {
    var order = [];
    for (var i = 0; i < n; i++) { order.push(i); }
    for (var k = n - 1; k > 0; k--) {
      var j = Math.floor(Math.random() * (k + 1));
      var t = order[k]; order[k] = order[j]; order[j] = t;
    }
    return order;
  }

  function avoidSameSlot(order, correctIdx, avoidSlot) {
    var slot = order.indexOf(correctIdx);
    if (order.length < 2 || avoidSlot == null || slot !== avoidSlot) { return slot; }
    var other = (slot + 1 + Math.floor(Math.random() * (order.length - 1))) % order.length;
    order[slot] = order[other];
    order[other] = correctIdx;
    return other;
  }

  function renderChoice(item) {
    renderDialogue({ sp: item.prompt.sp, t: item.prompt.t, ru: item.prompt.ru, hint: item.prompt.hint });
    els.btnNext.hidden = true;
    els.choices.innerHTML = "";
    var order = shuffleOrder(item.opts.length);
    var correctIdx = -1;
    item.opts.forEach(function (o, i) { if (o.ok && correctIdx === -1) { correctIdx = i; } });
    if (correctIdx !== -1) { lastChoiceSlot = avoidSameSlot(order, correctIdx, lastChoiceSlot); }
    order.forEach(function (oi) {
      var opt = item.opts[oi];
      var b = document.createElement("button");
      b.className = "choice-btn";
      b.dataset.opt = String(oi);
      b.innerHTML = '<span class="choice-en"></span><span class="choice-ru"></span>';
      b.querySelector(".choice-en").textContent = opt.t;
      if (opt.ru && state.lang === "both") { b.querySelector(".choice-ru").textContent = opt.ru; }
      b.onclick = function () {
        if (opt.ok) {
          if (opt.fb) { toast(opt.fb, "good"); }
          advance();
        } else {
          state.wrongChoices++;
          save();
          openWatson(opt.fb || "Think about the rules and the grammar. Try again!");
        }
      };
      els.choices.appendChild(b);
    });
  }

  /* ---------------- tasks ---------------- */

  function startTask(task) {
    els.taskPanel.hidden = false;
    els.taskTitle.textContent = task.title || "Task";
    els.taskHint.textContent = "";
    els.taskHint.hidden = true;
    els.taskBody.innerHTML = "";

    if (task.kind === "tf") renderTF(task);
    else if (task.kind === "quiz") renderQuiz(task);
    else if (task.kind === "multi") renderMulti(task);
    else if (task.kind === "order") renderOrder(task);
  }

  function taskDone(msg) {
    els.taskPanel.hidden = true;
    els.watsonPopup.hidden = true;
    watsonOnClose = null;
    toast(msg || "Correct! Well done.", "good");
    advance();
  }

  function renderTF(task) {
    var answered = 0;
    task.stmts.forEach(function (st) {
      var row = document.createElement("div");
      row.className = "tf-row";
      var p = document.createElement("p");
      p.textContent = st.t;
      row.appendChild(p);
      var wrap = document.createElement("div");
      wrap.className = "tf-btns";
      [["True", true], ["False", false]].forEach(function (pair) {
        var b = document.createElement("button");
        b.textContent = pair[0];
        b.className = "mini-btn";
        b.onclick = function () {
          if (row.dataset.done) { return; }
          row.dataset.done = "1";
          if (pair[1] === st.a) {
            b.classList.add("ok");
          } else {
            b.classList.add("bad");
            state.wrongTasks++;
            save();
            openWatson("Not quite. Read the scene once more — the answer is in the dialogue.");
          }
          answered++;
          if (answered === task.stmts.length) {
            var finish = function () { setTimeout(function () { taskDone(); }, 400); };
            if (!els.watsonPopup.hidden) { watsonOnClose = finish; }
            else { finish(); }
          }
        };
        wrap.appendChild(b);
      });
      row.appendChild(wrap);
      els.taskBody.appendChild(row);
    });
  }

  function renderQuiz(task) {
    var q = document.createElement("p");
    q.className = "task-q";
    q.textContent = task.q;
    els.taskBody.appendChild(q);
    var order = shuffleOrder(task.opts.length);
    lastQuizSlot = avoidSameSlot(order, task.a, lastQuizSlot);
    order.forEach(function (oi) {
      var opt = task.opts[oi];
      var b = document.createElement("button");
      b.className = "mini-btn wide";
      b.dataset.idx = String(oi);
      b.textContent = opt;
      b.onclick = function () {
        if (oi === task.a) {
          b.classList.add("ok");
          taskDone("Correct!");
        } else {
          b.classList.add("bad");
          state.wrongTasks++;
          save();
          openWatson(task.why || "Try again. Read the options carefully.");
        }
      };
      els.taskBody.appendChild(b);
    });
  }

  function renderMulti(task) {
    var picked = [];
    var order = task.opts.map(function (_, i) { return i; });
    for (var i = order.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = order[i]; order[i] = order[j]; order[j] = tmp;
    }
    order.forEach(function (i) {
      var opt = task.opts[i];
      var b = document.createElement("button");
      b.className = "mini-btn wide";
      b.dataset.idx = String(i);
      b.textContent = opt;
      b.onclick = function () {
        if (b.classList.contains("picked")) {
          b.classList.remove("picked");
          picked = picked.filter(function (x) { return x !== i; });
        } else {
          b.classList.add("picked");
          picked.push(i);
        }
      };
      els.taskBody.appendChild(b);
    });
    var check = document.createElement("button");
    check.className = "mini-btn wide check";
    check.textContent = "Check";
    check.onclick = function () {
      var ok = picked.length === task.a.length && task.a.every(function (x) { return picked.indexOf(x) !== -1; });
      if (ok) { taskDone("Strong evidence!"); }
      else {
        state.wrongTasks++;
        save();
        openWatson(task.why || "Pick exactly three correct clues.");
      }
    };
    els.taskBody.appendChild(check);
  }

  function renderOrder(task) {
    var sentenceMode = task.answer.indexOf("|") !== -1;
    var correctSentences = sentenceMode
      ? task.answer.split("|").map(function (s) { return s.trim(); })
      : null;
    var shuffled = shuffleOrder(task.words.length).map(function (i) { return task.words[i]; });
    var stillInOrder = shuffled.length > 2 && shuffled.every(function (w, i) { return w === task.words[i]; });
    if (stillInOrder) { var swapTmp = shuffled[0]; shuffled[0] = shuffled[1]; shuffled[1] = swapTmp; }
    var built = [];
    var norm = function (s) { return s.toLowerCase().replace(/\s+/g, " ").trim(); };

    var builtBox = document.createElement("div");
    builtBox.className = "order-built";
    var poolBox = document.createElement("div");
    poolBox.className = "order-pool";

    function redraw() {
      builtBox.innerHTML = "";
      built.forEach(function (w, i) {
        var c = document.createElement("button");
        c.className = "chip built";
        c.textContent = w;
        c.onclick = function () {
          built.splice(i, 1);
          if (!sentenceMode) { shuffled.push(w); }
          redraw();
        };
        builtBox.appendChild(c);
      });
      poolBox.innerHTML = "";
      shuffled.forEach(function (w) {
        if (built.indexOf(w) !== -1) { return; }
        var c = document.createElement("button");
        c.className = "chip";
        c.textContent = w;
        c.onclick = function () {
          built.push(w);
          if (!sentenceMode) { shuffled.splice(shuffled.indexOf(w), 1); }
          redraw();
        };
        poolBox.appendChild(c);
      });
    }
    redraw();

    var check = document.createElement("button");
    check.className = "mini-btn wide check";
    check.textContent = "Check";
    check.onclick = function () {
      var ok;
      if (sentenceMode) {
        ok = built.length === correctSentences.length;
        if (ok) {
          for (var i = 0; i < correctSentences.length; i++) {
            if (norm(built[i]) !== norm(correctSentences[i])) { ok = false; break; }
          }
        }
      } else {
        ok = built.length > 0 && norm(built.join(" ")) === norm(task.answer);
      }
      if (ok) { taskDone("Perfect order!"); }
      else {
        state.wrongTasks++;
        save();
        openWatson("Not yet. Think about the correct order — you can click a word to remove it.");
      }
    };

    els.taskBody.appendChild(builtBox);
    els.taskBody.appendChild(poolBox);
    els.taskBody.appendChild(check);
  }

  /* ---------------- vocabulary ---------------- */

  function showVocab(v) {
    els.taskPanel.hidden = false;
    els.taskTitle.textContent = "Mini-dictionary";
    els.taskHint.textContent = "New words from this scene";
    els.taskHint.hidden = false;
    els.taskBody.innerHTML = "";
    var list = document.createElement("div");
    list.className = "vocab-list";
    v.words.forEach(function (pair) {
      var row = document.createElement("div");
      row.className = "vocab-row";
      row.innerHTML = '<span class="vocab-en"></span><span class="vocab-ru"></span>';
      row.querySelector(".vocab-en").textContent = pair[0];
      row.querySelector(".vocab-ru").textContent = pair[1];
      list.appendChild(row);
    });
    els.taskBody.appendChild(list);
    var cont = document.createElement("button");
    cont.className = "mini-btn wide check";
    cont.textContent = "Continue";
    cont.onclick = function () { els.taskPanel.hidden = true; advance(); };
    els.taskBody.appendChild(cont);
  }

  /* ---------------- clue scenes ---------------- */

  function clearHotspots() {
    els.hotspots.innerHTML = "";
    els.hotspots.classList.remove("searching");
  }

  function startClueMode(cfg) {
    els.dialogue.hidden = true;
    els.choices.innerHTML = "";
    els.hotspots.innerHTML = "";
    els.hotspots.classList.add("searching");
    var found = 0;
    var total = cfg.hotspots.length;

    function finishClues() {
      whenFrameReady(function () {
        els.dialogue.hidden = false;
        els.nameplate.hidden = true;
        els.lineRu.hidden = true;
        els.lineText.className = "line narration";
        els.lineText.textContent = "You found everything. Time to continue.";
        els.btnNext.hidden = false;
        els.hotspots.innerHTML = "";
        els.hotspots.classList.remove("searching");
      });
    }

    function place(x, y, w, h, cls, handler) {
      var d = document.createElement("div");
      d.className = "hotspot " + (cls || "");
      d.style.left = (x * 100) + "%";
      d.style.top = (y * 100) + "%";
      d.style.width = (w * 100) + "%";
      d.style.height = (h * 100) + "%";
      d.onclick = handler;
      els.hotspots.appendChild(d);
      return d;
    }

    function markFound(d, clue) {
      d.dataset.found = "1";
      d.classList.add("found");
      if (clue && clue.img) {
        var ic = document.createElement("img");
        ic.className = "found-icon";
        ic.src = clue.img;
        d.appendChild(ic);
      }
    }

    cfg.hotspots.forEach(function (hs) {
      var clue = CLUES[hs.id];
      var d = place(hs.x, hs.y, hs.w, hs.h, "clue", function () {
        if (d.dataset.found) { return; }
        markFound(d, clue);
        addClue(hs.id, false);
        found++;
        if (found === total) {
          setTimeout(finishClues, 900);
        }
      });
      if (state.clues.indexOf(hs.id) !== -1) {
        markFound(d, clue);
        found++;
      }
    });

    (cfg.duds || []).forEach(function (dud) {
      place(dud.x, dud.y, dud.w, dud.h, "dud", function () {
        toast(dud.msg, "info");
      });
    });

    if (total > 0 && found === total) {
      finishClues();
    }
  }

  /* ---------------- notebook & clues ---------------- */

  function addClue(id, silent) {
    var c = CLUES[id];
    if (!c) { return; }
    if (state.clues.indexOf(id) === -1) { state.clues.push(id); save(); }
    if (!silent) { toast("Clue added: " + c.name, "good"); }
    else { toast("Notebook updated: " + c.name, "info"); }
  }

  function openNotebook() {
    var body = els.notebookBody;
    body.innerHTML = "";
    var h1 = document.createElement("h3");
    h1.textContent = "Clues (" + state.clues.length + "/" + Object.keys(CLUES).length + ")";
    body.appendChild(h1);
    if (state.clues.length === 0) {
      var non = document.createElement("p");
      non.textContent = "No clues yet. Explore the east wing!";
      body.appendChild(non);
    }
    state.clues.forEach(function (id) {
      var c = CLUES[id];
      var row = document.createElement("div");
      row.className = "clue-row";
      if (c.img) {
        var im = document.createElement("img");
        im.src = c.img;
        row.appendChild(im);
      }
      var tx = document.createElement("div");
      tx.innerHTML = "<b>" + c.name + "</b> <span class='ru'>" + c.ru + "</span><br><small>" + (c.note || "") + "</small>";
      row.appendChild(tx);
      body.appendChild(row);
    });
    var h2 = document.createElement("h3");
    h2.textContent = "Suspects";
    body.appendChild(h2);
    SUSPECTS.forEach(function (s) {
      var row = document.createElement("div");
      row.className = "clue-row";
      var im = document.createElement("img");
      im.src = s.img;
      row.appendChild(im);
      var tx = document.createElement("div");
      tx.innerHTML = "<b>" + s.name + "</b> <span class='ru'>" + s.ru + "</span><br><small>" + s.note + "</small>";
      row.appendChild(tx);
      body.appendChild(row);
    });
    els.notebook.hidden = false;
  }

  /* ---------------- Watson ---------------- */

  var watsonOnClose = null;

  function openWatson(text) {
    els.watsonText.textContent = text;
    els.watsonPopup.style.zIndex = "90";
    els.watsonPopup.hidden = false;
  }

  /* ---------------- clue card ---------------- */

  function showCluePopup(item) {
    var c = CLUES[item.note.clue] || {};
    var img = item.note.img || c.img;
    if (img) { els.clueImg.src = img; els.clueImg.hidden = false; }
    else { els.clueImg.hidden = true; }
    els.clueTitle.textContent = item.note.title || c.name || "";
    els.clueText.textContent = item.t || "";
    els.clueTextRu.textContent = item.ru || "";
    els.clueTextRu.hidden = !(item.ru && state.lang === "both");
    els.cluePopup.hidden = false;
  }

  /* ---------------- toast ---------------- */

  var toastTimer = null;
  function toast(msg, kind) {
    els.toast.textContent = msg;
    els.toast.className = "toast " + (kind || "");
    els.toast.hidden = false;
    if (toastTimer) { clearTimeout(toastTimer); }
    toastTimer = setTimeout(function () { els.toast.hidden = true; }, 2600);
  }

  /* ---------------- language ---------------- */

  function updateLangLabel() {
    els.btnLang.title = state.lang === "both" ? "Show English only" : "Show Russian translation";
    els.btnLang.classList.toggle("on", state.lang === "both");
  }

  function toggleLang() {
    state.lang = state.lang === "both" ? "en" : "both";
    save();
    updateLangLabel();
    var item = state.dialogCtx;
    els.lineRu.hidden = !(item && item.ru && state.lang === "both");
    els.lineRu.textContent = (item && item.ru && state.lang === "both") ? item.ru : "";
    var sc = SCENES[state.scene];
    var cur = sc && sc.items[state.pos];
    if (cur && cur.opts) {
      var btns = els.choices.querySelectorAll(".choice-btn");
      for (var i = 0; i < btns.length; i++) {
        var oi = parseInt(btns[i].dataset.opt || "0", 10);
        var span = btns[i].querySelector(".choice-ru");
        var opt = cur.opts[oi];
        if (span) { span.textContent = state.lang === "both" ? ((opt && opt.ru) || "") : ""; }
      }
    }
  }

  /* ---------------- end screen ---------------- */

  function endGame() {
    clearSave();
    var allClues = state.clues.length === Object.keys(CLUES).length;
    var badges = [
      { img: "assets/UI_badge_case_closed.png", name: "Survived the Night", ru: "Пережила эту ночь", got: true },
      { img: "assets/UI_ash_hint.png", name: "Curious Cat", ru: "Любопытный кот", got: allClues },
      { img: "assets/UI_name_plate.png", name: "Smooth Talker", ru: "Спокойный голос", got: state.wrongChoices === 0 },
      { img: "assets/UI_logo_emblem.png", name: "Iron Grammar", ru: "Железная грамматика", got: state.wrongTasks === 0 }
    ];
    els.endBadges.innerHTML = "";
    playMusic("dawn", 1600);
    badges.forEach(function (b) {
      var d = document.createElement("div");
      d.className = "badge " + (b.got ? "got" : "missed");
      var im = document.createElement("img");
      im.src = b.img;
      im.alt = b.name;
      d.appendChild(im);
      var t = document.createElement("div");
      t.innerHTML = "<b>" + b.name + "</b><br><span class='ru'>" + b.ru + "</span><br><small>" + (b.got ? "Earned" : "Not earned this time") + "</small>";
      d.appendChild(t);
      els.endBadges.appendChild(d);
    });
    showScreen("end");
  }

  /* ---------------- wire up ---------------- */

  function wire() {
    els.btnNext.onclick = function () {
      if (!state.typing && els.choices.children.length > 0) { return; }
      if (state.typing) {
        if (state.typeTimer) { clearInterval(state.typeTimer); state.typeTimer = null; }
        state.typing = false;
        els.lineText.textContent = (state.dialogCtx && state.dialogCtx.t) || "";
        els.btnNext.hidden = els.choices.children.length > 0;
        return;
      }
      els.btnNext.hidden = true;
      advance();
    };
    els.btnHome.onclick = function () {
      flowToken++;
      save();
      stopMusic(600);
      if (state.typeTimer) { clearInterval(state.typeTimer); state.typeTimer = null; }
      els.taskPanel.hidden = true;
      els.notebook.hidden = true;
      els.watsonPopup.hidden = true;
      els.cluePopup.hidden = true;
      clearHotspots();
      showScreen("title");
      initTitle();
    };
    els.btnNotebook.onclick = openNotebook;
    els.notebookClose.onclick = function () { els.notebook.hidden = true; };
    els.btnWatsonTop.onclick = function () {
      openWatson(state.hint || "Read the dialogue and choose the best answer.");
    };
    els.watsonClose.onclick = function () {
      els.watsonPopup.hidden = true;
      if (watsonOnClose) {
        var f = watsonOnClose;
        watsonOnClose = null;
        f();
      }
    };
    els.btnLang.onclick = toggleLang;
    els.clueClose.onclick = function () {
      els.cluePopup.hidden = true;
      advance();
    };
    if (els.btnMusic) { els.btnMusic.onclick = function () { setMusicEnabled(!musicEnabled()); }; }
    els.btnRestart.onclick = function () { resetState(); clearSave(); startGame(); };
    els.btnEndTitle.onclick = function () { clearHotspots(); showScreen("title"); initTitle(); };
  }

  document.addEventListener("DOMContentLoaded", function () {
    preloadDialogueUi();
    wire();
    initTitle();
    showScreen("title");
    if (els.btnMusic) { els.btnMusic.classList.toggle("off", !musicEnabled()); }
    fitBgOverflow();
    window.addEventListener("resize", fitBgOverflow);
    els.bg.addEventListener("load", fitBgOverflow);
  });

  /* test/debug handle */
  window.__BMH__ = {
    state: state, scenes: SCENES, clues: CLUES,
    music: { current: function () { return musicKey; }, enabled: musicEnabled }
  };
})();
