/* The First Time Iko Broke His Arm — script.js
 * Elapsed time is ALWAYS recomputed from the fixed start timestamp below.
 * Nothing is stored in localStorage and the page-load time is never used as a start.
 */
(function () {
  "use strict";

  // ---- Authoritative, permanent start: 29 Oct 2026, 1:30:00 PM Bangladesh (UTC+06:00) ----
  var START_ISO = "2026-10-29T13:30:00+06:00";
  var START_MS = BigInt(Date.parse(START_ISO)); // 1793259000000n — BigInt so days never overflow
  var MS_PER_SEC = 1000n, SEC_PER_MIN = 60n, MIN_PER_HR = 60n, HR_PER_DAY = 24n;

  /** Pure calculation: returns {started, days (BigInt), hours, minutes, seconds}. */
  function computeElapsed(nowMs) {
    var diff = BigInt(nowMs) - START_MS;
    if (diff < 0n) return { started: false, days: 0n, hours: 0, minutes: 0, seconds: 0 };
    var totalSec = diff / MS_PER_SEC;
    var totalMin = totalSec / SEC_PER_MIN;
    var totalHr = totalMin / MIN_PER_HR;
    return {
      started: true,
      days: totalHr / HR_PER_DAY,
      hours: Number(totalHr % HR_PER_DAY),
      minutes: Number(totalMin % MIN_PER_HR),
      seconds: Number(totalSec % SEC_PER_MIN)
    };
  }

  // Allow tests in Node without a DOM.
  if (typeof document === "undefined") {
    if (typeof module !== "undefined") module.exports = { computeElapsed: computeElapsed, START_MS: START_MS };
    return;
  }

  var $ = function (id) { return document.getElementById(id); };
  var elDays = $("days"), elWrap = $("daysWrap"), elLabel = $("daysLabel");
  var elH = $("hours"), elM = $("minutes"), elS = $("seconds");
  var elNotice = $("notice"), elSr = $("srSummary");
  var elDate = $("liveDate"), elTime = $("liveTime");
  var pad = function (n) { return n < 10 ? "0" + n : String(n); };

  var lastDaysText = "", lastMinuteKey = "", timer = null;

  // Shrink the day number only when it would not fit its container (huge counts, narrow phones).
  function fitDays() {
    elDays.style.fontSize = "";
    var avail = elWrap.clientWidth, need = elDays.scrollWidth;
    if (need > avail && need > 0) {
      var base = parseFloat(getComputedStyle(elDays).fontSize);
      elDays.style.fontSize = Math.max(14, Math.floor(base * avail / need * 0.97)) + "px";
    }
  }

  var dhaka = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka", weekday: "long", day: "numeric", month: "long", year: "numeric"
  });
  var dhakaTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka", hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true
  });

  function render() {
    var now = Date.now();
    var e = computeElapsed(now);

    var daysText = e.days.toLocaleString("en-US"); // BigInt-safe, with thousands separators
    if (daysText !== lastDaysText) {
      elDays.textContent = daysText;
      elLabel.textContent = e.days === 1n ? "Day" : "Days";
      lastDaysText = daysText;
      fitDays();
    }
    elH.textContent = pad(e.hours);
    elM.textContent = pad(e.minutes);
    elS.textContent = pad(e.seconds);
    elNotice.hidden = e.started;

    var key = e.days + ":" + e.hours + ":" + e.minutes;
    if (key !== lastMinuteKey) {
      lastMinuteKey = key;
      elSr.textContent = e.started
        ? daysText + " days, " + e.hours + " hours and " + e.minutes + " minutes since the incident."
        : "The counting has not begun yet.";
    }

    var d = new Date(now);
    try {
      elDate.textContent = dhaka.format(d);
      elTime.textContent = dhakaTime.format(d).toUpperCase();
    } catch (err) {
      // Very old browsers without Intl time zones: derive UTC+6 manually.
      var b = new Date(now + 6 * 3600 * 1000);
      elDate.textContent = b.toUTCString().slice(0, 16);
      elTime.textContent = pad(b.getUTCHours()) + ":" + pad(b.getUTCMinutes()) + ":" + pad(b.getUTCSeconds());
    }
  }

  // Tick aligned to wall-clock seconds; each tick recomputes from START_MS so drift cannot accumulate.
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(function () { render(); schedule(); }, 1000 - (Date.now() % 1000) + 5);
  }
  function start() { render(); schedule(); }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { clearTimeout(timer); timer = null; }   // no background work
    else start();                                                  // catch up instantly on return
  });
  window.addEventListener("pageshow", start);
  window.addEventListener("resize", fitDays);
  start();

  // ---- Photo fallback: raw GitHub URL first, then bundled copy, then a message ----
  var img = $("memoryPhoto"), fb = $("photoFallback"), triedLocal = false;
  img.addEventListener("error", function () {
    if (!triedLocal) { triedLocal = true; img.src = "photo-fallback.jpg"; return; }
    img.hidden = true; fb.hidden = false;
  });

  // ---- Gentle particles (skipped for reduced motion; few dots to stay light on budget phones) ----
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cv = $("particles");
  if (!reduce && cv.getContext) {
    var ctx = cv.getContext("2d"), W = 0, H = 0, dots = [], raf = null;
    var N = Math.min(40, Math.round(window.innerWidth / 30));
    function size() {
      W = cv.width = window.innerWidth; H = cv.height = window.innerHeight;
    }
    function init() {
      size(); dots = [];
      for (var i = 0; i < N; i++) dots.push({
        x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.4 + .4,
        v: Math.random() * .18 + .05, c: Math.random() < .35 ? "192,23,45" : "185,188,194"
      });
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < dots.length; i++) {
        var p = dots[i]; p.y -= p.v; if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
        ctx.fillStyle = "rgba(" + p.c + ",.45)";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    init(); frame();
    window.addEventListener("resize", init);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { cancelAnimationFrame(raf); raf = null; }
      else if (!raf) frame();
    });
  }
})();
