import { invite } from "./invite-config.js";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let language = "en";
let coverTimer;
let countdownTimer;
let soundEnabled = false;
let musicPending = false;
let musicRequest = 0;
const backgroundMusic = $("#background-music");
const choose = (english, hindi) => (language === "hi" ? hindi : english);
const confirmedYear =
  Number.isInteger(invite.year) && invite.year >= 2026 && invite.year <= 9999;
const confirmedTime =
  typeof invite.weddingTime === "string" &&
  /^([01]\d|2[0-3]):[0-5]\d$/.test(invite.weddingTime);

function setStatus(selector, message) {
  const status = $(selector);
  if (status) status.textContent = message;
}

function weddingTimeLabel() {
  if (!confirmedTime)
    return choose("Time to be announced", "समय जल्द साझा किया जाएगा");
  const date = new Date(`2000-01-01T${invite.weddingTime}:00+05:30`);
  return (
    new Intl.DateTimeFormat(language === "hi" ? "hi-IN" : "en-IN", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
    }).format(date) + choose(" onwards", " से")
  );
}

function updateMusicLabel() {
  const button = $("#music-toggle");
  if (!button) return;
  const label = soundEnabled
    ? choose("Sound on", "संगीत चालू")
    : choose("Sound off", "संगीत बंद");
  const labelElement = button.querySelector("[data-music-label]");
  if (labelElement) labelElement.textContent = label;
  button.setAttribute("aria-pressed", String(soundEnabled));
  button.setAttribute(
    "aria-label",
    soundEnabled
      ? choose("Turn music off", "संगीत बंद करें")
      : choose("Turn music on", "संगीत चालू करें"),
  );
  button.title = button.getAttribute("aria-label");
}

function setLanguage(nextLanguage) {
  language = nextLanguage === "hi" ? "hi" : "en";
  document.documentElement.lang = language;
  $$("[data-en][data-hi]").forEach((element) => {
    element.textContent = element.dataset[language];
  });
  $$("[data-language]").forEach((button) => {
    const selected = button.dataset.language === language;
    button.setAttribute("aria-pressed", String(selected));
    button.classList.toggle("is-active", selected);
  });
  ["bride", "groom"].forEach((person) => {
    $$(`[data-${person}]`).forEach((element) => {
      element.textContent = invite.couple[person][language];
    });
  });
  $$("[data-couple]").forEach((element) => {
    element.textContent = `${invite.couple.groom[language]} ${choose("&", "और")} ${invite.couple.bride[language]}`;
  });
  $$("[data-year]").forEach((element) => {
    element.textContent = confirmedYear ? invite.year : "";
  });
  $$("[data-wedding-time]").forEach((element) => {
    element.textContent = weddingTimeLabel();
  });
  updateMusicLabel();
  updateBlessingLink();
  updateCountdown();
}

$$("[data-language]").forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.language));
});

const cover = $("#invitation-cover");
const content = $("#invite-content");
function scrollAppToTop() {
  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  root.style.scrollBehavior = previousBehavior;
}

if (cover && content && $("#open-invitation")) {
  cover.hidden = false;
  content.inert = true;
  document.body.classList.add("cover-visible");
  $("#open-invitation").focus({ preventScroll: true });
  cover.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      $("#open-invitation").focus({ preventScroll: true });
    }
    if (event.key === "Escape") $("#open-invitation").click();
  });
  $("#open-invitation").addEventListener("click", () => {
    scrollAppToTop();
    void startMusic();
    clearTimeout(coverTimer);
    content.inert = false;
    cover.classList.add("is-open");
    document.body.classList.remove("cover-visible");
    coverTimer = window.setTimeout(
      () => {
        cover.hidden = true;
        $("#main-title")?.focus({ preventScroll: true });
      },
      reducedMotion.matches ? 0 : 700,
    );
  });
  $("#reopen-invitation")?.addEventListener("click", () => {
    clearTimeout(coverTimer);
    cover.hidden = false;
    cover.classList.remove("is-open");
    content.inert = true;
    document.body.classList.add("cover-visible");
    $("#open-invitation").focus({ preventScroll: true });
  });
}

function updateBlessingLink() {
  const link = $("#send-blessings");
  if (!link) return;
  const couple =
    language === "hi"
      ? `${invite.couple.groom.hi} और ${invite.couple.bride.hi}`
      : `${invite.couple.groom.en} & ${invite.couple.bride.en}`;
  const message =
    language === "hi"
      ? `प्रिय ${couple}, आपके विवाह के शुभ अवसर पर हार्दिक बधाई एवं शुभकामनाएँ। आपका जीवन प्रेम, सुख और समृद्धि से सदा भरा रहे।`
      : `Dear ${couple}, heartfelt congratulations on your wedding. Wishing you a lifetime filled with love, laughter, and happiness.`;
  link.href = `https://wa.me/?text=${encodeURIComponent(message)}`;
}

function weddingDate() {
  return new Date(
    `${invite.year}-11-25T${confirmedTime ? invite.weddingTime : "00:00"}:00+05:30`,
  );
}

function updateCountdown() {
  const countdown = $("#countdown");
  if (!countdown) return;
  countdown.hidden = !confirmedYear;
  if (!confirmedYear) return;
  const remaining = Math.max(0, weddingDate().getTime() - Date.now());
  const values = {
    days: Math.floor(remaining / 86400000),
    hours: Math.floor((remaining % 86400000) / 3600000),
    minutes: Math.floor((remaining % 3600000) / 60000),
    seconds: Math.floor((remaining % 60000) / 1000),
  };
  Object.entries(values).forEach(([unit, value]) => {
    $$(`[data-countdown="${unit}"]`).forEach((element) => {
      element.textContent = String(value).padStart(2, "0");
    });
  });
  if (remaining === 0) clearInterval(countdownTimer);
}

function stopMusic() {
  musicRequest += 1;
  soundEnabled = false;
  musicPending = false;
  backgroundMusic?.pause();
  if (backgroundMusic) backgroundMusic.currentTime = 0;
  updateMusicLabel();
}

async function startMusic() {
  if (!backgroundMusic) return;
  if (soundEnabled || musicPending) return;
  const request = ++musicRequest;
  musicPending = true;
  setStatus("#music-status", "");
  try {
    await backgroundMusic.play();
    if (request !== musicRequest) return;
    musicPending = false;
    soundEnabled = true;
    updateMusicLabel();
  } catch {
    if (request !== musicRequest) return;
    musicPending = false;
    soundEnabled = false;
    updateMusicLabel();
    setStatus(
      "#music-status",
      choose(
        "Music could not be played. Please try again.",
        "संगीत नहीं चल सका। कृपया फिर कोशिश करें।",
      ),
    );
  }
}

$("#music-toggle")?.addEventListener("click", () => {
  if (soundEnabled || musicPending) {
    stopMusic();
    return;
  }
  void startMusic();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopMusic();
});

window.addEventListener("pagehide", () => {
  stopMusic();
  clearTimeout(coverTimer);
  clearInterval(countdownTimer);
});
window.addEventListener("pageshow", () => {
  updateCountdown();
  if (confirmedYear) {
    clearInterval(countdownTimer);
    countdownTimer = window.setInterval(updateCountdown, 1000);
  }
});

setLanguage("en");
if (confirmedYear) countdownTimer = window.setInterval(updateCountdown, 1000);

function initScrollReveal() {
  if (reducedMotion.matches || !("IntersectionObserver" in window)) return;

  const targets = $$(
    [
      "#home .hero-copy",
      "#home .hero-art",
      "#invitation > .section-lotus",
      "#invitation > .eyebrow",
      "#invitation > h2",
      "#invitation > .intro-copy",
      "#invitation > .hindi-invitation",
      "#invitation .families > article",
      "#invitation .family-join",
      "#invitation > .save-date",
      "#invitation > #countdown",
      "#celebrations .section-heading",
      "#celebrations .event-card",
      "#celebrations .timezone-note",
      "#reply .reply-intro",
      "#reply .reply-card",
      ".closing > .ornament",
      ".closing > p",
      ".closing > h2",
      ".closing > .section-lotus",
    ].join(", "),
  );
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -48px 0px" },
  );

  targets.forEach((element, index) => {
    element.classList.add("scroll-reveal");
    element.dataset.reveal = element.matches(
      "#home .hero-copy, #invitation .families > article:first-child, #celebrations .event-card:first-child, #reply .reply-intro",
    )
      ? "left"
      : element.matches(
            "#home .hero-art, #invitation .families > article:last-child, #celebrations .event-card:last-child, #reply .reply-card",
          )
        ? "right"
        : "up";
    element.style.setProperty("--reveal-delay", `${(index % 5) * 80}ms`);
    observer.observe(element);
  });
}

initScrollReveal();
