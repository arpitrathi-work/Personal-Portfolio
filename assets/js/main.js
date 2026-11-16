/* Arpit Rathi · Portfolio interactions
   Uses GSAP + ScrollTrigger + Lenis from assets/vendor/ when available.
   Everything is visible and usable without them: animation is an enhancement only. */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  var Lenis = window.Lenis;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isPhone = window.matchMedia("(max-width: 767px)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var canAnimate = !reduceMotion && !!gsap && !!ScrollTrigger;

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Header border on scroll ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  function setNav(open) {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("open", open);
  }
  toggle.addEventListener("click", function () {
    setNav(toggle.getAttribute("aria-expanded") !== "true");
  });
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setNav(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setNav(false);
      toggle.focus();
    }
  });

  /* ---------- Smooth scrolling (Lenis) ----------
     Desktop with a mouse/trackpad only. Phones and touch devices keep native scrolling,
     and it is never used when the visitor prefers reduced motion. */
  var lenis = null;
  if (canAnimate && Lenis && !isPhone && finePointer) {
    lenis = new Lenis({ lerp: 0.14, smoothWheel: true, anchors: false, autoRaf: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  function focusTarget(target) {
    // Move keyboard focus to the section so the next Tab continues from there,
    // just like a native in-page link.
    var focusable = target.matches("a, button, input, select, textarea, summary, [tabindex]");
    if (!focusable) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }

  // In-page links: with Lenis on, scroll smoothly but keep real URL history,
  // so back/forward and shared #links behave like normal anchors.
  if (lenis) {
    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var hash = link.getAttribute("href");
      var target = hash.length > 1 ? document.getElementById(hash.slice(1)) : null;
      if (!target) return;
      e.preventDefault();
      if (location.hash !== hash) history.pushState(null, "", hash);
      // Measure from the real scroll position (not Lenis's cached one) and honour the
      // CSS scroll-padding-top that keeps sections clear of the sticky header.
      var pad = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
      var y = target.getBoundingClientRect().top + window.scrollY - pad;
      lenis.scrollTo(Math.max(0, y), { duration: 0.9 });
      focusTarget(target);
    });
    // Back/forward: the browser restores the scroll position itself; make sure Lenis
    // is not still animating toward the old target when that happens.
    window.addEventListener("popstate", function () { lenis.stop(); lenis.start(); });
  }

  /* ---------- Number formatting ---------- */
  function formatNumber(value, decimals, locale) {
    return value.toLocaleString(locale || "en-IN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  /* ---------- Case study: count-up + bars ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  var bars = document.getElementById("case-bars");
  var replay = document.getElementById("replay");

  function countUp(el, duration) {
    var target = parseFloat(el.dataset.count);
    var d = parseInt(el.dataset.decimals || "0", 10);
    var prefix = el.dataset.prefix || "";
    var suffix = el.dataset.suffix || "";
    var state = { v: 0 };
    gsap.to(state, {
      v: target,
      duration: duration,
      ease: "power2.out",
      overwrite: true,
      onUpdate: function () { el.textContent = prefix + formatNumber(state.v, d) + suffix; }
    });
  }

  function playCase() {
    var dur = isPhone ? 1 : 1.4;
    counters.forEach(function (el) { countUp(el, dur); });
    if (bars) {
      gsap.fromTo(bars.querySelectorAll(".bar"), { scaleX: 0 }, {
        scaleX: 1, duration: dur, ease: "power3.out", stagger: 0.15, overwrite: true
      });
    }
  }

  if (canAnimate) {
    // Screen readers get the final values; the animated text is hidden from them.
    counters.forEach(function (el) {
      var sr = document.createElement("span");
      sr.className = "visually-hidden";
      sr.textContent = el.textContent;
      el.setAttribute("aria-hidden", "true");
      el.parentNode.insertBefore(sr, el);
    });
    if (replay) {
      replay.hidden = false;
      replay.addEventListener("click", playCase);
    }
  }

  /* ---------- Scroll animations (GSAP) ---------- */
  if (canAnimate) {
    gsap.registerPlugin(ScrollTrigger);

    // Only things that start below the first screen are ever hidden, and only by JS,
    // so nothing is invisible while scripts load or if they fail.
    // A page opened at a #section link skips the hide-and-reveal entirely, because the
    // browser may jump there after this runs.
    var openedAtHash = location.hash.length > 1;
    function belowFold(el) { return !openedAtHash && el.getBoundingClientRect().top > window.innerHeight; }

    var mm = gsap.matchMedia();
    mm.add({ phone: "(max-width: 767px)", wide: "(min-width: 1001px)", desktop: "(min-width: 768px)" }, function (ctx) {
      var phone = ctx.conditions.phone;

      // Light reveal for headings, cards and steps. Opacity only drops to 0 (never
      // visibility:hidden), so links inside stay reachable by keyboard.
      var items = gsap.utils.toArray(".reveal").filter(belowFold);
      gsap.set(items, { opacity: 0, y: phone ? 12 : 24 });
      function show(batch) {
        gsap.to(batch, { opacity: 1, y: 0, duration: phone ? 0.4 : 0.55, ease: "power2.out", stagger: 0.06, overwrite: true });
      }
      ScrollTrigger.batch(items, { start: "top 92%", once: true, onEnter: show, onLeave: show, onEnterBack: show });

      // Moment 1: hero illustration drifts slightly slower than the page (desktop only).
      if (!phone) {
        gsap.to(".hero-art svg", {
          yPercent: 10, ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
        });
      }

      // Moment 2: case-study bars grow and numbers count up once, when they come into view.
      if (bars && belowFold(bars)) gsap.set(bars.querySelectorAll(".bar"), { scaleX: 0 });
      if (bars) {
        ScrollTrigger.create({ trigger: bars, start: "top 85%", once: true, onEnter: playCase, onLeave: playCase });
      }

      // Moment 3: the dashed line joining the four steps draws across as you scroll
      // (wide screens only; the line is not shown on smaller layouts).
      var steps = document.querySelector(".steps");
      if (ctx.conditions.wide && steps && belowFold(steps)) {
        gsap.fromTo(steps, { "--line-progress": 0 }, {
          "--line-progress": 1, ease: "none",
          scrollTrigger: { trigger: steps, start: "top 85%", end: "top 45%", scrub: 0.4 }
        });
      }

      return function () { gsap.set(items, { clearProps: "opacity,transform" }); };
    });

    // If keyboard focus lands inside something still faded out, show it at once.
    document.addEventListener("focusin", function (e) {
      var r = e.target.closest && e.target.closest(".reveal");
      if (r && parseFloat(getComputedStyle(r).opacity) < 1) {
        gsap.killTweensOf(r);
        gsap.set(r, { opacity: 1, y: 0 });
      }
    });

    // Opening the comparison table or an FAQ changes the page height.
    document.addEventListener("toggle", function () { ScrollTrigger.refresh(); }, true);
  }

  /* ---------- Active nav link ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav ul a[href^="#"]'));
  if ("IntersectionObserver" in window) {
    var sectionIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        // Back at the hero: no nav item is current.
        navLinks.forEach(function (a) {
          if (a.getAttribute("href") === "#" + entry.target.id) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    navLinks.forEach(function (a) {
      var s = document.querySelector(a.getAttribute("href"));
      if (s) sectionIO.observe(s);
    });
    var hero = document.querySelector(".hero");
    if (hero) sectionIO.observe(hero);
  }

  /* ---------- Sticky mobile CTA: hide when another booking button is on screen ---------- */
  var mobileCta = document.getElementById("mobile-cta");
  var ctaTargets = [document.getElementById("hero-cta"), document.getElementById("contact-cta")].filter(Boolean);
  if (mobileCta && "IntersectionObserver" in window) {
    var visible = new Set();
    var ctaIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visible.add(entry.target); else visible.delete(entry.target);
      });
      var hide = visible.size > 0;
      mobileCta.classList.toggle("hide", hide);
      // keep it out of the tab order and accessibility tree while hidden
      if (hide) mobileCta.setAttribute("inert", ""); else mobileCta.removeAttribute("inert");
    });
    ctaTargets.forEach(function (t) { ctaIO.observe(t); });
  }

  /* ---------- Calculator ---------- */
  var form = document.getElementById("calc-form");
  if (form) {
    var inputs = {
      budget: document.getElementById("budget"),
      price: document.getElementById("price"),
      cpp: document.getElementById("cpp")
    };
    var out = {
      purchases: document.getElementById("out-purchases"),
      revenue: document.getElementById("out-revenue"),
      roas: document.getElementById("out-roas"),
      error: document.getElementById("calc-error")
    };
    var curSymbols = form.querySelectorAll(".cur");
    var defaults = {
      INR: { budget: 100000, price: 999, cpp: 250 },
      USD: { budget: 2000, price: 97, cpp: 30 }
    };
    var currency = "INR";

    function money(v) {
      if (currency === "USD") {
        return "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 });
      }
      return "₹" + v.toLocaleString("en-IN", { maximumFractionDigits: 0 });
    }

    function calc() {
      var b = parseFloat(inputs.budget.value);
      var p = parseFloat(inputs.price.value);
      var c = parseFloat(inputs.cpp.value);
      var problems = [];
      [["budget", b], ["price", p], ["cpp", c]].forEach(function (pair) {
        var bad = !isFinite(pair[1]) || pair[1] < 0 || (pair[0] === "cpp" && pair[1] === 0);
        inputs[pair[0]].setAttribute("aria-invalid", bad ? "true" : "false");
        if (bad) problems.push(pair[0]);
      });

      if (problems.length) {
        out.purchases.textContent = "–";
        out.revenue.textContent = "–";
        out.roas.textContent = "–";
        out.error.hidden = false;
        out.error.textContent = problems.indexOf("cpp") !== -1 && isFinite(c) && c === 0
          ? "Cost per purchase must be more than zero."
          : "Enter a positive number in each field to see an estimate.";
        return;
      }
      out.error.hidden = true;
      var purchases = Math.floor(b / c);
      var revenue = purchases * p;
      var roas = b > 0 ? revenue / b : 0;
      out.purchases.textContent = purchases.toLocaleString(currency === "USD" ? "en-US" : "en-IN");
      out.revenue.textContent = money(revenue);
      out.roas.textContent = roas.toFixed(2) + "x";
    }

    form.addEventListener("input", function (e) {
      if (e.target.name === "currency") {
        currency = e.target.value;
        curSymbols.forEach(function (s) { s.textContent = currency === "USD" ? "$" : "₹"; });
        var d = defaults[currency];
        inputs.budget.value = d.budget;
        inputs.price.value = d.price;
        inputs.cpp.value = d.cpp;
      }
      calc();
    });
    form.addEventListener("submit", function (e) { e.preventDefault(); calc(); });
    calc();
  }
})();
