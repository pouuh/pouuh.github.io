(function () {
  "use strict";

  var root = document.documentElement;

  function currentTheme() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem("theme", theme); } catch (e) {}
  }

  try {
    var saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") {
      applyTheme(saved);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      applyTheme("dark");
    }
  } catch (e) {}

  var toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      applyTheme(currentTheme() === "dark" ? "light" : "dark");
    });
  }

  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbCap = document.getElementById("lbCap");
  var lbCount = document.getElementById("lbCount");
  var lbClose = document.getElementById("lbClose");
  var lbPrev = document.getElementById("lbPrev");
  var lbNext = document.getElementById("lbNext");
  var gallery = [];
  var index = 0;
  var lastFocus = null;

  function render() {
    var item = gallery[index] || { src: "", caption: "" };
    lbImg.setAttribute("src", item.src);
    lbImg.setAttribute("alt", item.caption || "Enlarged figure");
    lbCap.textContent = item.caption || "";
    lbCount.textContent = gallery.length > 1 ? (index + 1) + " / " + gallery.length : "";
    var multi = gallery.length > 1;
    lbPrev.hidden = !multi;
    lbNext.hidden = !multi;
  }

  function openLightbox(items, startIndex) {
    gallery = items && items.length ? items : [];
    index = startIndex || 0;
    lastFocus = document.activeElement;
    render();
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lb-open");
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lb-open");
    lbImg.setAttribute("src", "");
    if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
  }

  function step(delta) {
    if (gallery.length < 2) { return; }
    index = (index + delta + gallery.length) % gallery.length;
    render();
  }

  document.querySelectorAll(".zoomable").forEach(function (fig) {
    var raw = fig.getAttribute("data-gallery");
    var items = [];
    try { items = JSON.parse(raw) || []; } catch (e) { items = []; }

    fig.setAttribute("tabindex", "0");
    fig.setAttribute("role", "button");
    fig.setAttribute("aria-label", "Enlarge image");

    function activate() { openLightbox(items, 0); }

    fig.addEventListener("click", activate);
    fig.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activate();
      }
    });
  });

  if (lbClose) { lbClose.addEventListener("click", closeLightbox); }
  if (lbPrev) { lbPrev.addEventListener("click", function (e) { e.stopPropagation(); step(-1); }); }
  if (lbNext) { lbNext.addEventListener("click", function (e) { e.stopPropagation(); step(1); }); }

  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) { closeLightbox(); }
    });
  }

  document.addEventListener("keydown", function (e) {
    if (!lightbox || !lightbox.classList.contains("open")) { return; }
    if (e.key === "Escape") { closeLightbox(); }
    else if (e.key === "ArrowLeft") { step(-1); }
    else if (e.key === "ArrowRight") { step(1); }
  });

  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (a) { a.classList.remove("active"); });
          var link = byId[entry.target.id];
          if (link) { link.classList.add("active"); }
        }
      });
    }, { rootMargin: "-64px 0px -70% 0px", threshold: 0 });
    sections.forEach(function (s) { observer.observe(s); });
  }
})();
