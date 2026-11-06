/* Arpit Rathi · Portfolio interactions (no dependencies) */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Header shadow on scroll ---------- */
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

  /* ---------- Number formatting ---------- */
  function formatNumber(value, decimals, locale) {
    return value.toLocaleString(locale || "en-IN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  /* ---------- Count-up ---------- */
  function setFinal(el) {
    var d = parseInt(el.dataset.decimals || "0", 10);
    el.textContent = (el.dataset.prefix || "") + formatNumber(parseFloat(el.dataset.count), d) + (el.dataset.suffix || "");
  }
  function countUp(el) {
    var target = parseFloat(el.dataset.count);
    var d = parseInt(el.dataset.decimals || "0", 10);
    var prefix = el.dataset.prefix || "";
    var suffix = el.dataset.suffix || "";
    if (reduceMotion.matches) { setFinal(el); return; }
    var duration = 1600;
    var start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + formatNumber(target * eased, d) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  var bars = document.getElementById("case-bars");

  // Screen readers get the final values: the animated text is aria-hidden behind a static copy.
  counters.forEach(function (el) {
    var finalText = el.textContent;
    var sr = document.createElement("span");
    sr.className = "visually-hidden";
    sr.textContent = finalText;
    el.setAttribute("aria-hidden", "true");
    el.parentNode.insertBefore(sr, el);
  });

  function playCase() {
    counters.forEach(countUp);
    if (bars) {
      bars.classList.remove("in");
      // force reflow so the transition restarts
      void bars.offsetWidth;
      bars.classList.add("in");
    }
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  var caseSection = document.getElementById("results");

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });

    var caseIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { playCase(); caseIO.disconnect(); }
      });
    }, { threshold: 0.3 });
    if (bars) caseIO.observe(bars);
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
    counters.forEach(setFinal);
    if (bars) bars.classList.add("in");
  }

  var replay = document.getElementById("replay");
  if (replay) replay.addEventListener("click", playCase);

  /* ---------- Active nav link ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav ul a[href^="#"]'));
  if ("IntersectionObserver" in window) {
    var sectionIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
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
