console.log("[LD] FILE PARSED");
window.__LD_FILE_PARSED__ = true;

(function () {
  function startWhenReady() {
    let tries = 0;
    const maxTries = 120;

    const timer = setInterval(() => {
      const app = document.getElementById("ld_app");
      if (app) {
        clearInterval(timer);
        initLifeDecode();
      } else {
        tries++;
        if (tries >= maxTries) {
          clearInterval(timer);
          console.error("[LD] #ld_app not found. Script stopped.");
        }
      }
    }, 100);
  }

  function initLifeDecode() {
    if (window.__LD_RECOVERY_INIT__) return;
    window.__LD_RECOVERY_INIT__ = true;

    const CFG = {
      VERSION: "v3.0 • Account Mode",
      API_BASE: "https://YOUR-BACKEND-DOMAIN.com/api/lifedecode",
      MAKE_WEBHOOK_URL: "https://hook.eu2.make.com/PASTE_YOUR_MAKE_WEBHOOK",
      MAKE_POLL_URL: "",
      STRIPE_PAYMENT_LINK: "https://buy.stripe.com/PASTE_YOUR_PAYMENT_LINK",
      FREE_PREVIEW_PER_24H: 1,
      XP: { CHECKIN: 120, TRIGGER: 60, RESCUE: 40, JOURNAL: 30 }
    };

    const $ = (sel, root = document) => {
      try {
        if (typeof root === "string") root = document.querySelector(root) || document;
        return root.querySelector(sel);
      } catch (e) {
        return null;
      }
    };

    const $$ = (sel, root = document) => {
      try {
        if (typeof root === "string") root = document.querySelector(root) || document;
        return Array.from(root.querySelectorAll(sel));
      } catch (e) {
        return [];
      }
    };

    const now = () => Date.now();
    const uid = () =>
      window.crypto && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(16).slice(2) + Date.now().toString(16);

    function fmtDate(ts) {
      try {
        const d = new Date(ts);
        const pad = (n) => String(n).padStart(2, "0");
        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      } catch (e) {
        return "";
      }
    }

    function clamp(n, min, max) {
      return Math.max(min, Math.min(max, n));
    }

    function ymd(d = new Date()) {
      const pad = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }

    function getSheetEls() {
      return {
        backdrop: $("#ld_sheet_backdrop"),
        sheet: $("#ld_sheet"),
        title: $("#ld_sheet_title"),
        body: $("#ld_sheet_body")
      };
    }

    function getOnboardEls() {
      return {
        backdrop: $("#ld_ob_backdrop"),
        box: $("#ld_ob"),
        body: $("#ld_ob_body"),
        hint: $("#ld_ob_hint"),
        next: $("#ld_ob_next"),
        back: $("#ld_ob_back"),
        close: $("#ld_ob_close")
      };
    }

    function setStatus(kind, text) {
      const dot = $("#ld_status_dot");
      const t = $("#ld_status_text");
      if (!dot || !t) return;
      dot.classList.remove("ok", "warn", "bad");
      dot.classList.add(kind);
      t.textContent = text;
    }

    const DEFAULT_STATE = {
      v: 4,
      onboard: { done: false, step: 0, focus: "Recovery" },
      profile: { id: null, name: "Member", email: "" },
      premium: { unlocked: false, plan: "free" },
      xp: 0,
      streak: 0,
      lastCheckInDay: null,
      lastCheckInDayPrevious: null,
      lastMood: null,
      lastTrigger: null,
      triggers: [],
      urges: { count: 0, last: null, completedRescues: 0 },
      journal: [],
      coach: { lastUpdated: null, preview: "No plan yet.", saved: [] },
      freePreview: { used: 0, windowStart: 0 }
    };

    let STATE = JSON.parse(JSON.stringify(DEFAULT_STATE));
    let SESSION_FALLBACK = JSON.parse(JSON.stringify(DEFAULT_STATE));
    let HAS_SERVER = false;
    let rescueTimer = null;
    let rescueEndsAt = null;

    function clone(obj) {
      return JSON.parse(JSON.stringify(obj));
    }

    function getAuthToken() {
      try {
        if (window.LD_AUTH_TOKEN) return window.LD_AUTH_TOKEN;
        const meta = document.querySelector('meta[name="ld-auth-token"]');
        if (meta && meta.content) return meta.content;
        return "";
      } catch (e) {
        return "";
      }
    }

    async function api(path, opts = {}) {
      if (!CFG.API_BASE || CFG.API_BASE.includes("YOUR-BACKEND-DOMAIN")) {
        throw new Error("API base not configured.");
      }

      const token = getAuthToken();
      const headers = {
        "Content-Type": "application/json",
        ...(opts.headers || {})
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(CFG.API_BASE + path, {
        method: opts.method || "GET",
        headers,
        body: opts.body ? JSON.stringify(opts.body) : undefined,
        credentials: "include"
      });

      if (!res.ok) {
        let msg = `API ${res.status}`;
        try {
          const j = await res.json();
          if (j && j.error) msg = j.error;
        } catch (e) {}
        throw new Error(msg);
      }

      if (res.status === 204) return null;
      return await res.json().catch(() => null);
    }

    function mergeState(s) {
      const m = {
        ...DEFAULT_STATE,
        ...(s || {}),
        v: 4,
        onboard: { ...DEFAULT_STATE.onboard, ...((s && s.onboard) || {}) },
        profile: { ...DEFAULT_STATE.profile, ...((s && s.profile) || {}) },
        premium: { ...DEFAULT_STATE.premium, ...((s && s.premium) || {}) },
        urges: { ...DEFAULT_STATE.urges, ...((s && s.urges) || {}) },
        coach: { ...DEFAULT_STATE.coach, ...((s && s.coach) || {}) },
        freePreview: { ...DEFAULT_STATE.freePreview, ...((s && s.freePreview) || {}) }
      };

      m.profile.name = (m.profile.name || "Member").trim() || "Member";
      if (!Array.isArray(m.triggers)) m.triggers = [];
      if (!Array.isArray(m.journal)) m.journal = [];
      if (!Array.isArray(m.coach.saved)) m.coach.saved = [];
      return m;
    }

    async function loadState() {
      try {
        const data = await api("/state");
        if (data && data.state) {
          HAS_SERVER = true;
          STATE = mergeState(data.state);
          return;
        }
        throw new Error("No state payload.");
      } catch (err) {
        console.warn("[LD] server state unavailable, using session fallback:", err.message);
        HAS_SERVER = false;
        STATE = mergeState(SESSION_FALLBACK);
      }
    }

    async function saveState() {
      if (HAS_SERVER) {
        await api("/state", { method: "POST", body: { state: STATE } });
      } else {
        SESSION_FALLBACK = clone(STATE);
      }
    }

    function syncNameUI() {
      const name = (STATE.profile.name || "Member").trim() || "Member";
      const a = $("#ld_name_label");
      const b = $("#ld_name_big");
      if (a) a.textContent = name;
      if (b) b.textContent = name;
    }

    function syncFocusUI() {
      const sub = $("#ld_subline");
      if (!sub) return;
      const f = STATE.onboard && STATE.onboard.focus ? STATE.onboard.focus : "Recovery";
      const map = {
        Recovery:
          "Daily check-ins, fast urge rescue, trigger decoding, and a clean 12-hour plan. Built for accounts and database sync.",
        Anxiety:
          "Fast calm-down flows, trigger decoding, and structured micro-actions for the next 12 hours. Built for accounts and database sync.",
        Custom:
          "Pick your own pattern: check-ins, rescue flows, decoding, and clean 12-hour planning. Built for accounts and database sync."
      };
      sub.textContent = map[f] || map.Recovery;
    }

    function getLevel(xp) {
      const tiers = [
        { name: "Aware Seeker", at: 0, next: 1000 },
        { name: "Disciplined Builder", at: 1000, next: 2500 },
        { name: "Loop Breaker", at: 2500, next: 4500 },
        { name: "Self-Master", at: 4500, next: 7000 },
        { name: "Recovery Architect", at: 7000, next: 10000 }
      ];
      let cur = tiers[0];
      for (const t of tiers) if (xp >= t.at) cur = t;
      return { name: cur.name, at: cur.at, nextXP: cur.next || cur.at + 3000 };
    }

    async function addXP(amount) {
      STATE.xp = Math.max(0, (STATE.xp || 0) + amount);
      await saveState();
      renderStats();
    }

    function renderStats() {
      const level = getLevel(STATE.xp || 0);

      if ($("#ld_xp")) $("#ld_xp").textContent = String(STATE.xp || 0);
      if ($("#ld_xp_next")) $("#ld_xp_next").textContent = String(level.nextXP);
      if ($("#ld_level")) $("#ld_level").textContent = level.name;
      if ($("#ld_streak")) $("#ld_streak").textContent = String(STATE.streak || 0);

      const xpBar = $("#ld_xp_bar");
      if (xpBar) {
        const pct = clamp(((STATE.xp || 0) - level.at) / Math.max(1, level.nextXP - level.at), 0, 1);
        xpBar.style.width = `${Math.round(pct * 100)}%`;
      }

      const doneToday = STATE.lastCheckInDay === ymd();
      const badge = $("#ld_checkin_status_badge");
      if (badge) {
        badge.innerHTML = doneToday
          ? `<span class="ld_dot ok"></span> Done`
          : `<span class="ld_dot warn"></span> Not done`;
      }

      const coachMeta = $("#ld_coach_meta");
      if (coachMeta) {
        coachMeta.textContent = STATE.coach.lastUpdated
          ? `Updated ${fmtDate(STATE.coach.lastUpdated)}`
          : `Press “Generate Plan” to get your next 12-hour plan.`;
      }

      if ($("#ld_coach_preview")) $("#ld_coach_preview").textContent = STATE.coach.preview || "No plan yet.";
      if ($("#ld_last_trigger")) $("#ld_last_trigger").textContent = STATE.lastTrigger ? `Last trigger: ${STATE.lastTrigger}` : "Last trigger: none";

      const tCount = (STATE.triggers || []).length;
      const uCount = STATE.urges && STATE.urges.count ? STATE.urges.count : 0;
      const control = Math.max(0, Math.min(100, 50 + (STATE.streak || 0) - Math.floor(uCount / 2)));

      if ($("#ld_ins_triggers")) $("#ld_ins_triggers").textContent = tCount ? `↓ ${Math.max(0, 20 - Math.min(20, tCount))}%` : "—";
      if ($("#ld_ins_urges")) $("#ld_ins_urges").textContent = uCount ? `↓ ${Math.max(0, 30 - Math.min(30, uCount))}%` : "—";
      if ($("#ld_ins_control")) $("#ld_ins_control").textContent = `↑ ${control}%`;

      const nextMil = Math.max(30, Math.ceil(Math.max(1, STATE.streak || 0) / 30) * 30);
      if ($("#ld_milestone_days")) $("#ld_milestone_days").textContent = String(nextMil);

      const paywall = $("#ld_paywall_hint");
      if (paywall) {
        paywall.textContent = STATE.premium.unlocked
          ? "Unlocked: Full Plan + AI Mentor."
          : "Some outputs can be locked behind upgrade (Stripe).";
      }

      const badgeText = $("#ld_badge_text");
      if (badgeText) badgeText.textContent = `LD Recovery • ${CFG.VERSION}`;
    }

    function initParticles() {
      const c = $("#ld_particles");
      if (!c) return;
      const ctx = c.getContext("2d");
      let W = 0;
      let H = 0;
      let pts = [];

      function resize() {
        const dpr = window.devicePixelRatio || 1;
        W = c.width = Math.floor(window.innerWidth * dpr);
        H = c.height = Math.floor(window.innerHeight * dpr);
        c.style.width = window.innerWidth + "px";
        c.style.height = window.innerHeight + "px";
        const n = Math.floor(Math.min(70, Math.max(26, window.innerWidth / 18)));
        pts = Array.from({ length: n }).map(() => ({
          x: Math.random() * W,
          y: Math.random() * H,
          r: (Math.random() * 1.8 + 0.8) * dpr,
          vx: (Math.random() - 0.5) * 0.18 * dpr,
          vy: (Math.random() - 0.5) * 0.18 * dpr,
          t: Math.random() * Math.PI * 2
        }));
      }

      resize();
      window.addEventListener("resize", resize, { passive: true });

      function draw() {
        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, W, H);
        ctx.globalCompositeOperation = "lighter";

        for (const p of pts) {
          p.t += 0.01;
          p.x += p.vx + Math.cos(p.t) * 0.03 * dpr;
          p.y += p.vy + Math.sin(p.t) * 0.03 * dpr;
          if (p.x < 0) p.x = W;
          if (p.x > W) p.x = 0;
          if (p.y < 0) p.y = H;
          if (p.y > H) p.y = 0;

          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 18 * dpr);
          g.addColorStop(0, "rgba(34,211,238,.12)");
          g.addColorStop(0.5, "rgba(138,91,255,.08)");
          g.addColorStop(1, "rgba(255,61,214,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 18 * dpr, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.globalCompositeOperation = "source-over";
        requestAnimationFrame(draw);
      }

      requestAnimationFrame(draw);
    }

    function openSheet(title, html) {
      const els = getSheetEls();
      if (!els.backdrop || !els.sheet || !els.title || !els.body) {
        console.error("[LD] sheet elements missing");
        return;
      }

      els.title.textContent = title;
      els.body.innerHTML = html;
      els.backdrop.style.display = "block";
      els.sheet.style.display = "block";
      document.body.style.overflow = "hidden";
    }

    function closeSheet() {
      const els = getSheetEls();
      if (!els.backdrop || !els.sheet || !els.body) return;
      els.backdrop.style.display = "none";
      els.sheet.style.display = "none";
      els.body.innerHTML = "";
      document.body.style.overflow = "";
    }

    function moduleDashboard() {
      closeSheet();
    }

    function openAccountInfo() {
      alert(`Account: ${STATE.profile.name || "Member"}${STATE.profile.email ? "\nEmail: " + STATE.profile.email : ""}\nPlan: ${STATE.premium.plan || "free"}`);
    }

    function updateUrgeBadge(text, kind = "ok") {
      const b = $("#ld_urge_badge");
      if (!b) return;
      b.innerHTML = `<span class="ld_dot ${kind}"></span> ${text}`;
    }

    async function startRescue() {
      if (rescueTimer) return;

      STATE.urges.count = (STATE.urges.count || 0) + 1;
      STATE.urges.last = now();
      await saveState();
      renderStats();

      rescueEndsAt = now() + 90 * 1000;
      setStatus("warn", "RESCUE RUNNING");
      updateUrgeBadge("Running", "warn");

      rescueTimer = setInterval(() => {
        const left = Math.max(0, rescueEndsAt - now());
        const sec = Math.ceil(left / 1000);
        const b = $("#ld_urge_badge");
        if (b) b.innerHTML = `<span class="ld_dot warn"></span> ${sec}s`;
        if (left <= 0) stopRescue(true);
      }, 250);
    }

    async function stopRescue(completed = false) {
      if (rescueTimer) {
        clearInterval(rescueTimer);
        rescueTimer = null;
      }
      rescueEndsAt = null;
      updateUrgeBadge("Ready", "ok");
      setStatus("ok", "READY");

      if (completed) {
        STATE.urges.completedRescues = (STATE.urges.completedRescues || 0) + 1;
        await addXP(CFG.XP.RESCUE);
        await saveState();
        renderStats();
        setStatus("ok", `RESCUE COMPLETE +${CFG.XP.RESCUE} XP`);
        setTimeout(() => setStatus("ok", "READY"), 1200);
      }
    }

    function moduleCheckIn() {
      const doneToday = STATE.lastCheckInDay === ymd();
      const mood = STATE.lastMood || "—";

      openSheet(
        "DAILY CHECK-IN",
        `
        <div class="ld_grid2">
          <div>
            <div class="ld_kv"><span>Status today</span><b>${doneToday ? "Done ✅" : "Not done"}</b></div>
            <div class="ld_kv"><span>Last mood</span><b>${mood}</b></div>
            <div class="ld_hr"></div>
            <div class="ld_hint">Choose mood (optional), add 1–2 actions, then save.</div>
            <div class="ld_chiprow" id="ld_sheet_moods">
              ${["OK", "STABLE", "ANXIOUS", "NUMB", "URGES"].map((m) => `<div class="ld_chip ${STATE.lastMood === m ? "active" : ""}" data-mood="${m}">${m}</div>`).join("")}
            </div>
            <div class="ld_hr"></div>
            <input class="ld_field" id="ld_ci_action1" placeholder="Action #1 (clean + small, doable in 2–5 min)">
            <input class="ld_field" id="ld_ci_action2" placeholder="Action #2 (optional)">
            <textarea class="ld_field" id="ld_ci_note" placeholder="Optional note: what’s the risk today? what’s the win?"></textarea>
            <div class="ld_row" style="margin-top:10px;">
              <button class="ld_btn primary" id="ld_ci_save">Save Check-In</button>
              <button class="ld_btn ghost" id="ld_ci_cancel">Cancel</button>
            </div>
          </div>
          <div>
            <div class="ld_panel" style="border-radius:22px;">
              <div class="hd">
                <div>
                  <div class="kicker">QUICK RULE</div>
                  <h3 style="margin:6px 0 0;">One clean action now</h3>
                </div>
              </div>
              <div class="bd">
                <div class="ld_out">If you’re tempted: reduce the problem to a 2-minute step. Then do a friction action (water / walk / message someone).</div>
                <div class="ld_hr"></div>
                <div class="ld_kv"><span>XP for check-in</span><b>+${CFG.XP.CHECKIN}</b></div>
              </div>
            </div>
          </div>
        </div>
      `
      );
    }

    function moduleUrge() {
      openSheet(
        "URGE EMERGENCY (90s)",
        `
        <div class="ld_grid2">
          <div>
            <div class="ld_kv"><span>Timer</span><b id="ld_urge_sheet_timer">Ready</b></div>
            <div class="ld_hr"></div>
            <div class="ld_out">Step 1 (10s): Name it. “This is an urge, not an order.”
Step 2 (40s): Breathe 4–2–6. Slow.
Step 3 (40s): Do ONE friction action (stand up, water, walk).</div>
            <div class="ld_hr"></div>
            <div class="ld_row">
              <button class="ld_btn danger" id="ld_urge_sheet_start">Start Rescue</button>
              <button class="ld_btn" id="ld_urge_sheet_stop">Stop</button>
            </div>
          </div>
          <div>
            <div class="ld_panel" style="border-radius:22px;">
              <div class="hd">
                <div>
                  <div class="kicker">FAST RESET</div>
                  <h3 style="margin:6px 0 0;">What you do next</h3>
                </div>
              </div>
              <div class="bd">
                <div class="ld_out">After 90 seconds: do a “seal action”. Examples: move phone away • drink water • go outside for 2 minutes • message accountability.</div>
                <div class="ld_hr"></div>
                <div class="ld_kv"><span>Rescues completed</span><b>${STATE.urges.completedRescues || 0}</b></div>
                <div class="ld_kv"><span>Urges logged</span><b>${STATE.urges.count || 0}</b></div>
              </div>
            </div>
          </div>
        </div>
      `
      );

      const update = () => {
        const timerEl = $("#ld_urge_sheet_timer");
        if (!timerEl) return;
        if (!rescueTimer || !rescueEndsAt) timerEl.textContent = "Ready";
        else timerEl.textContent = `${Math.ceil(Math.max(0, rescueEndsAt - now()) / 1000)}s`;
      };

      update();
      const localTick = setInterval(update, 300);

      const cleanup = () => clearInterval(localTick);
      $("#ld_sheet_close")?.addEventListener("click", cleanup, { once: true });
      $("#ld_sheet_backdrop")?.addEventListener("click", cleanup, { once: true });
    }

    function moduleTrigger() {
      openSheet(
        "TRIGGER DECODER",
        `
        <div class="ld_grid2">
          <div>
            <div class="ld_hint">Write it raw. Short is fine.</div>
            <input class="ld_field" id="ld_trig_event" placeholder="What happened? (event)">
            <input class="ld_field" id="ld_trig_feel" placeholder="What did you feel? (emotion/body)">
            <input class="ld_field" id="ld_trig_thought" placeholder="What thought showed up?">
            <input class="ld_field" id="ld_trig_action" placeholder="What did you do / want to do?">
            <div class="ld_hr"></div>
            <div class="ld_hint">Pick a label (optional):</div>
            <div class="ld_chiprow" id="ld_trig_labels">
              ${["Stress", "Boredom", "Lonely", "Angry", "Tired", "Social", "Money", "Alcohol", "Scrolling", "Sex"].map((x) => `<div class="ld_chip" data-l="${x}">${x}</div>`).join("")}
            </div>
            <div class="ld_hr"></div>
            <div class="ld_row">
              <button class="ld_btn primary" id="ld_trig_save">Save Trigger</button>
              <button class="ld_btn ghost" id="ld_trig_cancel">Cancel</button>
            </div>
          </div>
          <div>
            <div class="ld_panel" style="border-radius:22px;">
              <div class="hd">
                <div>
                  <div class="kicker">OUTPUT</div>
                  <h3 style="margin:6px 0 0;">Clean counter-move</h3>
                </div>
              </div>
              <div class="bd">
                <div class="ld_out" id="ld_trig_out">Fill the fields → save → you’ll get a clean counter-move suggestion.</div>
                <div class="ld_hr"></div>
                <div class="ld_kv"><span>Triggers logged</span><b>${(STATE.triggers || []).length}</b></div>
              </div>
            </div>
          </div>
        </div>
      `
      );
    }

    async function callMake(payload) {
      if (!CFG.MAKE_WEBHOOK_URL || CFG.MAKE_WEBHOOK_URL.includes("PASTE_")) {
        throw new Error("Make webhook URL not set.");
      }

      const r = await fetch(CFG.MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (r.status === 202 && CFG.MAKE_POLL_URL) {
        const data = await r.json().catch(() => ({}));
        const request_id = data.request_id || payload.request_id;

        for (let i = 0; i < 18; i++) {
          await new Promise((res) => setTimeout(res, 900));
          const pr = await fetch(CFG.MAKE_POLL_URL + "?request_id=" + encodeURIComponent(request_id));
          if (pr.ok) {
            const pj = await pr.json().catch(() => null);
            if (pj && (pj.reply || pj.result)) return pj.reply || pj.result;
          }
        }
        throw new Error("Timed out waiting for Make reply.");
      }

      const j = await r.json().catch(() => null);
      if (!j) throw new Error("Invalid Make response.");
      return j.reply || j.result || j.text || JSON.stringify(j);
    }

    function freePreviewAllowed() {
      const fp = STATE.freePreview || { used: 0, windowStart: 0 };
      const windowMs = 24 * 60 * 60 * 1000;

      if (!fp.windowStart || now() - fp.windowStart > windowMs) {
        fp.windowStart = now();
        fp.used = 0;
      }

      const ok = fp.used < CFG.FREE_PREVIEW_PER_24H;
      return { ok, fp };
    }

    async function commitFreePreviewUse(fp) {
      fp.used += 1;
      STATE.freePreview = fp;
      await saveState();
    }

    function moduleCoach() {
      openSheet(
        "COACH OUTPUT (12 HOURS)",
        `
        <div class="ld_grid2">
          <div>
            <div class="ld_hint">Describe what’s happening right now (short is fine).</div>
            <textarea class="ld_field" id="ld_coach_input" placeholder="Example: I feel cravings after work. Stress + boredom. I want a plan for the next 12 hours."></textarea>
            <div class="ld_hr"></div>
            <div class="ld_hint">Tone:</div>
            <div class="ld_chiprow" id="ld_tone_row">
              ${["Recovery", "Savage", "Calm", "Strict", "Supportive"].map((t) => `<div class="ld_chip ${t === "Recovery" ? "active" : ""}" data-tone="${t}">${t}</div>`).join("")}
            </div>
            <div class="ld_hr"></div>
            <div class="ld_row">
              <button class="ld_btn primary" id="ld_coach_gen">Generate Plan</button>
              <button class="ld_btn" id="ld_coach_copy">Copy</button>
              <button class="ld_btn ghost" id="ld_coach_save">Save</button>
            </div>
            <div class="ld_hint" id="ld_coach_lock_hint"></div>
          </div>
          <div>
            <div class="ld_panel" style="border-radius:22px;">
              <div class="hd">
                <div>
                  <div class="kicker">OUTPUT</div>
                  <h3 style="margin:6px 0 0;">Next 12 hours</h3>
                </div>
              </div>
              <div class="bd">
                <div class="ld_out" id="ld_coach_out"></div>
                <div class="ld_hr"></div>
                <div class="ld_kv"><span>Last updated</span><b>${STATE.coach.lastUpdated ? fmtDate(STATE.coach.lastUpdated) : "—"}</b></div>
                <div class="ld_kv"><span>Saved plans</span><b>${(STATE.coach.saved || []).length}</b></div>
              </div>
            </div>
          </div>
        </div>
      `
      );

      const outEl = $("#ld_coach_out");
      const lockHint = $("#ld_coach_lock_hint");
      if (outEl) outEl.textContent = STATE.coach.preview || "No plan yet.";
      if (lockHint) {
        lockHint.textContent = STATE.premium.unlocked
          ? "Unlocked: full plan generation."
          : `Free preview: ${CFG.FREE_PREVIEW_PER_24H} / 24h. Upgrade unlocks full plan + mentor.`;
      }
    }

    function moduleJournal() {
      const items = (STATE.journal || []).slice(0, 20);

      openSheet(
        "JOURNAL",
        `
        <div class="ld_grid2">
          <div>
            <textarea class="ld_field" id="ld_j_text" placeholder="Quick journal entry…"></textarea>
            <div class="ld_row" style="margin-top:10px;">
              <button class="ld_btn primary" id="ld_j_save">Save Entry</button>
              <button class="ld_btn ghost" id="ld_j_clear">Clear</button>
            </div>
          </div>
          <div>
            <div class="ld_panel" style="border-radius:22px;">
              <div class="hd"><div><div class="kicker">RECENT</div><h3 style="margin:6px 0 0;">Last entries</h3></div></div>
              <div class="bd">
                <div class="ld_out" id="ld_j_list">${
                  items.length
                    ? items.map((x) => `• ${fmtDate(x.ts)} — ${(x.note || x.a1 || x.text || x.type || "").slice(0, 120)}`).join("\n")
                    : "No entries yet."
                }</div>
              </div>
            </div>
          </div>
        </div>
      `
      );
    }

    function moduleInsights() {
      const tCount = (STATE.triggers || []).length;
      const uCount = STATE.urges && STATE.urges.count ? STATE.urges.count : 0;
      const resc = STATE.urges && STATE.urges.completedRescues ? STATE.urges.completedRescues : 0;

      openSheet(
        "INSIGHTS",
        `
        <div class="ld_grid2">
          <div>
            <div class="ld_panel" style="border-radius:22px;">
              <div class="hd"><div><div class="kicker">STATS</div><h3 style="margin:6px 0 0;">Account data</h3></div></div>
              <div class="bd">
                <div class="ld_kv"><span>Streak</span><b>${STATE.streak || 0} days</b></div>
                <div class="ld_kv"><span>XP</span><b>${STATE.xp || 0}</b></div>
                <div class="ld_kv"><span>Triggers logged</span><b>${tCount}</b></div>
                <div class="ld_kv"><span>Urges logged</span><b>${uCount}</b></div>
                <div class="ld_kv"><span>Rescues completed</span><b>${resc}</b></div>
              </div>
            </div>
          </div>
          <div>
            <div class="ld_panel" style="border-radius:22px;">
              <div class="hd"><div><div class="kicker">NOTES</div><h3 style="margin:6px 0 0;">Pattern clues</h3></div></div>
              <div class="bd">
                <div class="ld_out">• If urges spike after meals or after work → pre-plan 1 replacement ritual.
• If boredom is the trigger → schedule friction actions (walk, shower, tidy).
• If loneliness → send one “I’m choosing clean” message before the craving peaks.</div>
              </div>
            </div>
          </div>
        </div>
      `
      );
    }

    function moduleProgress() {
      const level = getLevel(STATE.xp || 0);
      openSheet(
        "PROGRESS",
        `
        <div class="ld_grid2">
          <div>
            <div class="ld_panel" style="border-radius:22px;">
              <div class="hd"><div><div class="kicker">LEVEL</div><h3 style="margin:6px 0 0;">${level.name}</h3></div></div>
              <div class="bd">
                <div class="ld_kv"><span>Current XP</span><b>${STATE.xp || 0}</b></div>
                <div class="ld_kv"><span>Next level at</span><b>${level.nextXP}</b></div>
                <div class="ld_hr"></div>
                <div class="ld_out">Reward ideas:
• Unlock “Custom Panic Mode”
• Unlock “Daily plan templates”
• Unlock “Mentor voice” (later)</div>
              </div>
            </div>
          </div>
          <div>
            <div class="ld_panel" style="border-radius:22px;">
              <div class="hd"><div><div class="kicker">MILESTONES</div><h3 style="margin:6px 0 0;">Streak</h3></div></div>
              <div class="bd">
                <div class="ld_out">Next big milestone: ${Math.max(30, Math.ceil(Math.max(1, STATE.streak || 0) / 30) * 30)} days clean.
Smaller wins: 1 day, 3 days, 7 days, 14 days.</div>
              </div>
            </div>
          </div>
        </div>
      `
      );
    }

    function moduleTools() {
      openSheet(
        "TOOLS",
        `
        <div class="ld_grid2">
          <div>
            <div class="ld_panel" style="border-radius:22px;">
              <div class="hd"><div><div class="kicker">UTIL</div><h3 style="margin:6px 0 0;">Quick actions</h3></div></div>
              <div class="bd">
                <button class="ld_btn" style="width:100%;" id="ld_tool_export">Export account state (JSON)</button>
                <div class="ld_hr"></div>
                <button class="ld_btn ghost" style="width:100%;" id="ld_tool_reload">Reload from backend</button>
              </div>
            </div>
          </div>
          <div>
            <div class="ld_panel" style="border-radius:22px;">
              <div class="hd"><div><div class="kicker">SAFETY</div><h3 style="margin:6px 0 0;">Emergency plan</h3></div></div>
              <div class="bd">
                <div class="ld_out">If you feel unsafe or at risk:
1) Step away from the trigger.
2) Contact a trusted person.
3) If immediate danger: call local emergency services.</div>
              </div>
            </div>
          </div>
        </div>
      `
      );
    }

    function moduleSettings() {
      openSheet(
        "SETTINGS",
        `
        <div class="ld_grid2">
          <div>
            <div class="ld_hint">Account mode settings.</div>
            <div class="ld_hr"></div>
            <div class="ld_kv"><span>Name</span><b>${STATE.profile.name || "Member"}</b></div>
            <div class="ld_kv"><span>Email</span><b>${STATE.profile.email || "—"}</b></div>
            <div class="ld_hr"></div>
            <div class="ld_kv"><span>Focus mode</span><b>${STATE.onboard && STATE.onboard.focus ? STATE.onboard.focus : "Recovery"}</b></div>
            <div class="ld_row" style="margin-top:10px;">
              <button class="ld_btn" id="ld_set_focus">Change focus</button>
            </div>
            <div class="ld_hr"></div>
            <div class="ld_kv"><span>Premium unlock</span><b>${STATE.premium.unlocked ? "YES" : "NO"}</b></div>
            <div class="ld_kv"><span>Plan</span><b>${STATE.premium.plan || "free"}</b></div>
            <div class="ld_row" style="margin-top:10px;">
              <button class="ld_btn primary" id="ld_set_upgrade">Open Upgrade</button>
            </div>
          </div>
          <div>
            <div class="ld_panel" style="border-radius:22px;">
              <div class="hd"><div><div class="kicker">ABOUT</div><h3 style="margin:6px 0 0;">${CFG.VERSION}</h3></div></div>
              <div class="bd">
                <div class="ld_out">No localStorage persistence.
State is expected from backend account/database.
If backend is unavailable, app falls back to session memory for testing only.</div>
              </div>
            </div>
          </div>
        </div>
      `
      );
    }

    function moduleHelp() {
      openSheet(
        "HELP / QUICK GUIDE",
        `
        <div class="ld_grid2">
          <div>
            <div class="ld_panel" style="border-radius:22px;">
              <div class="hd"><div><div class="kicker">START HERE</div><h3 style="margin:6px 0 0;">What this app does</h3></div></div>
              <div class="bd">
                <div class="ld_out">LifeDecode Recovery is a fast system for:
• urges/cravings (break the loop)
• daily structure (streak + XP)
• trigger awareness (pattern decoding)
• simple plans (next 12 hours)

Rule: keep it short. One clean action > perfect plan.</div>
              </div>
            </div>
          </div>
          <div>
            <div class="ld_panel" style="border-radius:22px;">
              <div class="hd"><div><div class="kicker">EXAMPLES</div><h3 style="margin:6px 0 0;">Copy & paste prompts</h3></div></div>
              <div class="bd">
                <div class="ld_out">• “After work I crave alcohol. Stress + boredom. I need a plan until sleep.”
• “I’m anxious and doomscrolling. I need a calm plan for 2 hours.”
• “I feel lonely and I want to text my ex / relapse. Help me interrupt the loop.”</div>
              </div>
            </div>
          </div>
        </div>
      `
      );
    }

    const OPENERS = {
      dashboard: moduleDashboard,
      checkin: moduleCheckIn,
      urge: moduleUrge,
      trigger: moduleTrigger,
      coach: moduleCoach,
      journal: moduleJournal,
      insights: moduleInsights,
      progress: moduleProgress,
      tools: moduleTools,
      settings: moduleSettings,
      help: moduleHelp
    };

    function setActiveNav(key) {
      $$("#ld_nav button").forEach((b) => b.classList.toggle("active", b.dataset.open === key));
      $$("#ld_mnav .ld_mbtn").forEach((b) => b.classList.toggle("active", b.dataset.open === key));
    }

    function openModule(key) {
      setActiveNav(key);
      if (key === "dashboard") {
        closeSheet();
        return;
      }
      const fn = OPENERS[key];
      if (fn) fn();
    }

    function openUpgrade() {
      if (!CFG.STRIPE_PAYMENT_LINK || CFG.STRIPE_PAYMENT_LINK.includes("PASTE_")) {
        alert("Stripe payment link not set yet.");
        return;
      }
      window.location.href = CFG.STRIPE_PAYMENT_LINK;
    }

    function obShow() {
      const els = getOnboardEls();
      if (!els.backdrop || !els.box) return;
      els.backdrop.style.display = "block";
      els.box.style.display = "flex";
      document.body.style.overflow = "hidden";
    }

    function obHide() {
      const els = getOnboardEls();
      if (!els.backdrop || !els.box) return;
      els.backdrop.style.display = "none";
      els.box.style.display = "none";
      document.body.style.overflow = "";
    }

    function openOnboarding(force = false) {
      if (!force && STATE.onboard && STATE.onboard.done) return;
      STATE.onboard = STATE.onboard || { done: false, step: 0, focus: "Recovery" };
      STATE.onboard.step = 0;
      renderOnboard();
      obShow();
    }

    function renderOnboard() {
      const els = getOnboardEls();
      if (!els.body || !els.hint || !els.next || !els.back) return;

      const step = STATE.onboard ? STATE.onboard.step : 0;
      els.back.style.display = step === 0 ? "none" : "inline-flex";
      els.next.textContent = step === 2 ? "Finish" : "Next";

      if (step === 0) {
        const name = (STATE.profile.name || "Member").trim() || "Member";
        els.body.innerHTML = `
          <div class="ld_ob_title">Let’s set this up in 20 seconds.</div>
          <p class="ld_ob_sub">This version is built for accounts and backend sync.</p>
          <div class="ld_hr"></div>
          <div class="ld_hint">Display name:</div>
          <input class="ld_field" id="ld_ob_name" value="${name.replace(/"/g, "&quot;")}" placeholder="Your name">
          <div class="ld_hr"></div>
          <div class="ld_ob_cards">
            <div class="ld_ob_card"><b>✅ Daily Check-In</b><p>Streak + XP. One clean action.</p></div>
            <div class="ld_ob_card"><b>⏱ Urge Rescue</b><p>90 seconds. Break the loop.</p></div>
            <div class="ld_ob_card"><b>✨ 12-Hour Plan</b><p>Simple steps. No overwhelm.</p></div>
          </div>
        `;
        els.hint.textContent = "Backend/account mode • session fallback only if API is unavailable.";
        return;
      }

      if (step === 1) {
        const f = STATE.onboard && STATE.onboard.focus ? STATE.onboard.focus : "Recovery";
        els.body.innerHTML = `
          <div class="ld_ob_title">Choose your focus mode</div>
          <p class="ld_ob_sub">This changes wording so it feels natural for the user.</p>
          <div class="ld_chiprow" id="ld_ob_focus">
            ${["Recovery", "Anxiety", "Custom"].map((x) => `<div class="ld_chip ${x === f ? "active" : ""}" data-f="${x}">${x}</div>`).join("")}
          </div>
          <div class="ld_hr"></div>
          <div class="ld_out" id="ld_ob_focus_desc"></div>
        `;
        const descEl = $("#ld_ob_focus_desc");
        const setDesc = (mode) => {
          const map = {
            Recovery: "Recovery = cravings/urges/habits. Focus on removing access + replacing the ritual.",
            Anxiety: "Anxiety = panic/overthinking. Focus on nervous system reset + tiny controllables.",
            Custom: "Custom = same modules, your own framing."
          };
          if (descEl) descEl.textContent = map[mode] || map.Recovery;
        };
        setDesc(f);
        els.hint.textContent = "You can change focus anytime in Settings.";
        return;
      }

      els.body.innerHTML = `
        <div class="ld_ob_title">Done. Pick your first action.</div>
        <p class="ld_ob_sub">Rule: one clean step now. Don’t negotiate with the loop.</p>
        <div class="ld_hr"></div>
        <div class="ld_row">
          <button class="ld_btn primary" id="ld_ob_go_checkin">Start Check-In</button>
          <button class="ld_btn danger" id="ld_ob_go_urge">Start Rescue</button>
          <button class="ld_btn" id="ld_ob_go_coach">Generate Plan</button>
        </div>
      `;
      els.hint.textContent = "Server-first app • fallback only if backend is unavailable.";
    }

    async function obFinish() {
      STATE.onboard.done = true;
      await saveState();
      syncNameUI();
      syncFocusUI();
      obHide();
      setStatus("ok", "READY");
    }

    function bindDelegatedClicks() {
      document.addEventListener("click", async (e) => {
        const navBtn = e.target.closest("#ld_nav button[data-open], #ld_mnav .ld_mbtn[data-open], #ld_center [data-open], #ld_right [data-open]");
        if (navBtn) {
          e.preventDefault();
          openModule(navBtn.dataset.open);
          return;
        }

        if (e.target.closest("#ld_sheet_close, #ld_sheet_backdrop")) {
          closeSheet();
          return;
        }

        if (e.target.closest("#ld_btn_upgrade")) {
          openUpgrade();
          return;
        }

        if (e.target.closest("#ld_btn_help")) {
          openModule("help");
          return;
        }

        if (e.target.closest("#ld_btn_name")) {
          openAccountInfo();
          return;
        }

        if (e.target.closest("#ld_btn_genplan")) {
          openModule("coach");
          return;
        }

        if (e.target.closest("#ld_btn_copyplan")) {
          try {
            await navigator.clipboard.writeText($("#ld_coach_preview")?.textContent || "");
            setStatus("ok", "COPIED");
            setTimeout(() => setStatus("ok", "READY"), 800);
          } catch (e2) {
            alert("Copy not allowed.");
          }
          return;
        }

        if (e.target.closest("#ld_btn_saveplan")) {
          const text = ($("#ld_coach_preview")?.textContent || "").trim();
          if (!text) return;
          STATE.coach.saved.unshift({ id: uid(), ts: now(), tone: "Recovery", text });
          await saveState();
          renderStats();
          setStatus("ok", "SAVED");
          setTimeout(() => setStatus("ok", "READY"), 900);
          return;
        }

        if (e.target.closest("#ld_btn_startrescue")) {
          await startRescue();
          return;
        }

        if (e.target.closest("#ld_btn_stoprescue")) {
          await stopRescue(false);
          return;
        }

        if (e.target.closest("#ld_btn_quicktrigger")) {
          openModule("trigger");
          return;
        }

        if (e.target.closest("#ld_badge_close")) {
          const badge = $("#ld_badge");
          if (badge) badge.style.display = "none";
          return;
        }

        if (e.target.closest("#ld_ci_cancel")) {
          closeSheet();
          return;
        }

        const moodSheetChip = e.target.closest("#ld_sheet_moods .ld_chip");
        if (moodSheetChip) {
          $$("#ld_sheet_moods .ld_chip").forEach((x) => x.classList.remove("active"));
          moodSheetChip.classList.add("active");
          STATE.lastMood = moodSheetChip.dataset.mood;
          await saveState();
          renderStats();
          return;
        }

        if (e.target.closest("#ld_ci_save")) {
          const day = ymd();
          const already = STATE.lastCheckInDay === day;

          const action1 = ($("#ld_ci_action1")?.value || "").trim();
          const action2 = ($("#ld_ci_action2")?.value || "").trim();
          const note = ($("#ld_ci_note")?.value || "").trim();

          if (!action1 && !note) {
            alert("Write at least one action or note first.");
            return;
          }

          const prevDay = STATE.lastCheckInDayPrevious || null;
          STATE.lastCheckInDay = day;

          if (!already) {
            const today = new Date();
            const yest = new Date(today);
            yest.setDate(today.getDate() - 1);
            const yestStr = ymd(yest);
            if (prevDay === yestStr) STATE.streak = (STATE.streak || 0) + 1;
            else STATE.streak = 1;
            STATE.lastCheckInDayPrevious = day;
          }

          STATE.journal.unshift({
            id: uid(),
            ts: now(),
            type: "checkin",
            mood: STATE.lastMood || null,
            a1: action1,
            a2: action2,
            note
          });

          if (!already) await addXP(CFG.XP.CHECKIN);
          await saveState();
          renderStats();
          setStatus("ok", already ? "CHECK-IN UPDATED" : `CHECK-IN SAVED +${CFG.XP.CHECKIN} XP`);
          closeSheet();
          setTimeout(() => setStatus("ok", "READY"), 1100);
          return;
        }

        if (e.target.closest("#ld_urge_sheet_start")) {
          await startRescue();
          return;
        }

        if (e.target.closest("#ld_urge_sheet_stop")) {
          await stopRescue(false);
          return;
        }

        const trigLabel = e.target.closest("#ld_trig_labels .ld_chip");
        if (trigLabel) {
          $$("#ld_trig_labels .ld_chip").forEach((x) => x.classList.remove("active"));
          trigLabel.classList.add("active");
          return;
        }

        if (e.target.closest("#ld_trig_cancel")) {
          closeSheet();
          return;
        }

        if (e.target.closest("#ld_trig_save")) {
          const active = $("#ld_trig_labels .ld_chip.active");
          const picked = active ? active.dataset.l : null;

          const ev = ($("#ld_trig_event")?.value || "").trim();
          const feel = ($("#ld_trig_feel")?.value || "").trim();
          const th = ($("#ld_trig_thought")?.value || "").trim();
          const act = ($("#ld_trig_action")?.value || "").trim();

          if (!ev && !feel && !th && !act) {
            alert("Write at least something first.");
            return;
          }

          const summary = picked ? `${picked}: ${ev || "trigger"}` : ev || "trigger";
          STATE.lastTrigger = summary;
          STATE.triggers.unshift({ id: uid(), ts: now(), label: picked, ev, feel, th, act });

          const out = $("#ld_trig_out");
          if (out) {
            out.textContent = `Counter-move (2 min):
• Change state: water + stand up + 10 slow breaths.
• Reduce access: remove the risky thing from reach for 30 minutes.
• Replace: do ONE clean micro-task (shower, walk, message, tidy).
• Script: “I can feel this AND still choose the next right step.”`;
          }

          await addXP(CFG.XP.TRIGGER);
          await saveState();
          renderStats();
          setStatus("ok", `TRIGGER SAVED +${CFG.XP.TRIGGER} XP`);
          setTimeout(() => setStatus("ok", "READY"), 1200);
          return;
        }

        const toneChip = e.target.closest("#ld_tone_row .ld_chip");
        if (toneChip) {
          $$("#ld_tone_row .ld_chip").forEach((x) => x.classList.remove("active"));
          toneChip.classList.add("active");
          return;
        }

        if (e.target.closest("#ld_coach_copy")) {
          try {
            await navigator.clipboard.writeText($("#ld_coach_out")?.textContent || "");
            setStatus("ok", "COPIED");
            setTimeout(() => setStatus("ok", "READY"), 800);
          } catch (e2) {
            alert("Copy not allowed in this browser.");
          }
          return;
        }

        if (e.target.closest("#ld_coach_save")) {
          const activeTone = $("#ld_tone_row .ld_chip.active");
          const tone = activeTone ? activeTone.dataset.tone : "Recovery";
          const text = ($("#ld_coach_out")?.textContent || "").trim();
          if (!text) return;
          STATE.coach.saved.unshift({ id: uid(), ts: now(), tone, text });
          await saveState();
          renderStats();
          setStatus("ok", "SAVED");
          setTimeout(() => setStatus("ok", "READY"), 900);
          return;
        }

        if (e.target.closest("#ld_coach_gen")) {
          const input = ($("#ld_coach_input")?.value || "").trim();
          const activeTone = $("#ld_tone_row .ld_chip.active");
          const tone = activeTone ? activeTone.dataset.tone : "Recovery";
          const outEl = $("#ld_coach_out");

          if (!input) {
            alert("Write 1–2 lines about what’s happening first.");
            return;
          }

          const previewState = freePreviewAllowed();
          if (!STATE.premium.unlocked && !previewState.ok) {
            if (outEl) {
              outEl.textContent = `LOCKED: Full Plan + AI Mentor (Upgrade)

• You already used today’s free preview.
• Tap Upgrade to unlock.`;
            }
            return;
          }

          const request_id = uid();
          const payload = {
            request_id,
            mode: "LifeDecode Recovery",
            tone,
            user_name: STATE.profile.name || "Member",
            user_id: STATE.profile.id || null,
            focus: STATE.onboard && STATE.onboard.focus ? STATE.onboard.focus : "Recovery",
            streak: STATE.streak || 0,
            xp: STATE.xp || 0,
            last_mood: STATE.lastMood || null,
            last_trigger: STATE.lastTrigger || null,
            prompt: `Write a practical next-12-hours plan.

Rules:
- Max 6 steps, each step short and actionable.
- Include 1 “remove access” step, 1 “replacement activity”, 1 “social/accountability” step.
- End with a 1-line mantra.

Context: ${input}`
          };

          setStatus("warn", "GENERATING…");
          if (outEl) outEl.textContent = "Generating…";

          try {
            const reply = await callMake(payload);
            const text = String(reply || "").trim() || "No reply.";

            if (!STATE.premium.unlocked) await commitFreePreviewUse(previewState.fp);

            STATE.coach.preview = text;
            STATE.coach.lastUpdated = now();
            await saveState();
            renderStats();
            if (outEl) outEl.textContent = text;
            setStatus("ok", "READY");
          } catch (err) {
            if (outEl) {
              outEl.textContent = `NEXT 12 HOURS PLAN (fallback)

1) Remove access to the risky thing for 30 minutes.
2) Water + 10 slow breaths.
3) Do ONE 5-minute clean task (shower / walk / tidy).
4) Eat something simple + protein.
5) Message someone: “I’m choosing the next right step.”
6) Set a 30-minute timer and repeat step #3.

Mantra: “Urge ≠ order. I choose the next clean step.”

(Make webhook missing/failed: ${err.message})`;
            }
            setStatus("bad", "MAKE ERROR");
            setTimeout(() => setStatus("ok", "READY"), 1500);
          }
          return;
        }

        if (e.target.closest("#ld_j_clear")) {
          const inp = $("#ld_j_text");
          if (inp) inp.value = "";
          return;
        }

        if (e.target.closest("#ld_j_save")) {
          const text = ($("#ld_j_text")?.value || "").trim();
          if (!text) return;
          STATE.journal.unshift({ id: uid(), ts: now(), type: "journal", text });
          await addXP(CFG.XP.JOURNAL);
          await saveState();
          renderStats();
          setStatus("ok", `JOURNAL SAVED +${CFG.XP.JOURNAL} XP`);
          setTimeout(() => setStatus("ok", "READY"), 1200);
          closeSheet();
          return;
        }

        if (e.target.closest("#ld_tool_export")) {
          const blob = new Blob([JSON.stringify(STATE, null, 2)], { type: "application/json" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "ld_recovery_state.json";
          a.click();
          URL.revokeObjectURL(a.href);
          return;
        }

        if (e.target.closest("#ld_tool_reload")) {
          setStatus("warn", "RELOADING…");
          await loadState();
          syncNameUI();
          syncFocusUI();
          renderStats();
          setStatus("ok", "READY");
          closeSheet();
          return;
        }

        if (e.target.closest("#ld_set_focus")) {
          openOnboarding(true);
          return;
        }

        if (e.target.closest("#ld_set_upgrade")) {
          openUpgrade();
          return;
        }

        const moodMain = e.target.closest("#ld_mood_row .ld_chip");
        if (moodMain) {
          $$("#ld_mood_row .ld_chip").forEach((x) => x.classList.remove("active"));
          moodMain.classList.add("active");
          STATE.lastMood = moodMain.dataset.mood;
          await saveState();
          renderStats();
          return;
        }

        const obFocusChip = e.target.closest("#ld_ob_focus .ld_chip");
        if (obFocusChip) {
          $$("#ld_ob_focus .ld_chip").forEach((x) => x.classList.remove("active"));
          obFocusChip.classList.add("active");
          STATE.onboard.focus = obFocusChip.dataset.f;
          const descEl = $("#ld_ob_focus_desc");
          if (descEl) {
            const map = {
              Recovery: "Recovery = cravings/urges/habits. Focus on removing access + replacing the ritual.",
              Anxiety: "Anxiety = panic/overthinking. Focus on nervous system reset + tiny controllables.",
              Custom: "Custom = same modules, your own framing."
            };
            descEl.textContent = map[STATE.onboard.focus] || map.Recovery;
          }
          return;
        }

        if (e.target.closest("#ld_ob_go_checkin")) {
          await obFinish();
          openModule("checkin");
          return;
        }

        if (e.target.closest("#ld_ob_go_urge")) {
          await obFinish();
          openModule("urge");
          return;
        }

        if (e.target.closest("#ld_ob_go_coach")) {
          await obFinish();
          openModule("coach");
          return;
        }

        if (e.target.closest("#ld_ob_close, #ld_ob_backdrop")) {
          const el = $("#ld_ob_name");
          if (el) STATE.profile.name = (el.value || STATE.profile.name || "Member").trim() || "Member";
          STATE.onboard.done = true;
          await saveState();
          syncNameUI();
          syncFocusUI();
          obHide();
          return;
        }
      });

      const obEls = getOnboardEls();

      obEls.next?.addEventListener("click", async () => {
        const step = STATE.onboard ? STATE.onboard.step : 0;

        if (step === 0) {
          const el = $("#ld_ob_name");
          if (el) {
            STATE.profile.name = (el.value || "Member").trim() || "Member";
            syncNameUI();
          }
          STATE.onboard.step = 1;
          renderOnboard();
          return;
        }

        if (step === 1) {
          STATE.onboard.step = 2;
          renderOnboard();
          return;
        }

        await obFinish();
      });

      obEls.back?.addEventListener("click", () => {
        const step = STATE.onboard ? STATE.onboard.step : 0;
        STATE.onboard.step = Math.max(0, step - 1);
        renderOnboard();
      });
    }

    function handlePaid() {
      try {
        const u = new URL(window.location.href);
        const paid = u.searchParams.get("ld_paid");
        const plan = u.searchParams.get("ld_plan");
        if (paid === "1") {
          STATE.premium.unlocked = true;
          STATE.premium.plan = plan || "premium";
          saveState().catch(() => {});
          renderStats();
          u.searchParams.delete("ld_paid");
          u.searchParams.delete("ld_plan");
          window.history.replaceState({}, "", u.toString());
          setStatus("ok", "UNLOCKED");
          setTimeout(() => setStatus("ok", "READY"), 1200);
        }
      } catch (e) {}
    }

    async function boot() {
      try {
        setStatus("warn", "LOADING…");
        await loadState();
        syncNameUI();
        syncFocusUI();
        initParticles();
        bindDelegatedClicks();
        handlePaid();
        renderStats();
        setStatus("ok", "READY");
        openOnboarding(false);
        console.log("[LD] Recovery loaded:", CFG.VERSION);
      } catch (err) {
        console.error("[LD] boot error:", err);
        setStatus("bad", "BOOT ERROR");
      }
    }

    boot();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startWhenReady);
  } else {
    startWhenReady();
  }
})();
