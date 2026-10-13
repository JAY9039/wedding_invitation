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
const confirmedYear = Number.isInteger(invite.year) && invite.year >= 2026 && invite.year <= 9999;
const confirmedTime = typeof invite.weddingTime === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(invite.weddingTime);

function setStatus(selector, message) {
  const status = $(selector);
  if (status) status.textContent = message;
}

function weddingTimeLabel() {
  if (!confirmedTime) return choose("Time to be announced", "समय जल्द साझा किया जाएगा");
  const date = new Date(`2000-01-01T${invite.weddingTime}:00+05:30`);
  return new Intl.DateTimeFormat(language === "hi" ? "hi-IN" : "en-IN", {
    hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata",
  }).format(date) + choose(" onwards", " से");
}

function updateMusicLabel() {
  const button = $("#music-toggle");
  if (!button) return;
  const label = soundEnabled ? choose("Sound on", "संगीत चालू") : choose("Sound off", "संगीत बंद");
  const labelElement = button.querySelector("[data-music-label]");
  if (labelElement) labelElement.textContent = label;
  button.setAttribute("aria-pressed", String(soundEnabled));
  button.setAttribute("aria-label", soundEnabled ? choose("Turn music off", "संगीत बंद करें") : choose("Turn music on", "संगीत चालू करें"));
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
  $$("[data-year]").forEach((element) => { element.textContent = confirmedYear ? invite.year : ""; });
  $$("[data-wedding-time]").forEach((element) => { element.textContent = weddingTimeLabel(); });
  const nameField = $("#guest-name");
  if (nameField) nameField.placeholder = choose("Your full name", "आपका पूरा नाम");
  updateMusicLabel();
  setStatus("#form-status", "");
  if ($("#rsvp-review") && !$("#rsvp-review").hidden) updateRsvpReview();
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
    coverTimer = window.setTimeout(() => {
      cover.hidden = true;
      $("#main-title")?.focus({ preventScroll: true });
    }, reducedMotion.matches ? 0 : 700);
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

function readRsvp() {
  const form = $("#rsvp-form");
  if (!form) return null;
  const fields = new FormData(form);
  const name = String(fields.get("name") || "").trim();
  const guests = Number(fields.get("guests"));
  const attendance = String(fields.get("attendance") || "");
  if (!name || name.length > 80 || !Number.isInteger(guests) || guests < 1 || guests > 10 || !["both", "engagement", "wedding", "unable"].includes(attendance)) return null;
  return { name, guests, attendance };
}

function updateRsvpReview() {
  const details = readRsvp();
  if (!details) return;
  const eventLabels = {
    both: choose("both celebrations on 24 & 25 November", "24 और 25 नवंबर के दोनों समारोहों में"),
    engagement: choose("Lagan Sagaai / Engagement on 24 November", "24 नवंबर को लगन सगाई / सगाई में"),
    wedding: choose("Shaadi on 25 November", "25 नवंबर को शादी में"),
  };
  let message;
  if (details.attendance === "unable") {
    message = choose(
      `Hello! This is ${details.name}. Thank you for the wedding invitation. I am sorry I will be unable to attend. Sending my warm wishes to the couple!`,
      `नमस्ते! मैं ${details.name} हूँ। शादी के निमंत्रण के लिए धन्यवाद। मुझे खेद है कि मैं शामिल नहीं हो सकूँगा/सकूँगी। वर-वधू को मेरी हार्दिक शुभकामनाएँ!`,
    );
  } else {
    message = choose(
      `Hello! This is ${details.name}. I would love to attend ${eventLabels[details.attendance]}${confirmedYear ? ` ${invite.year}` : ""} in Gwalior. Total guests, including me: ${details.guests}. Looking forward to celebrating with you!`,
      `नमस्ते! मैं ${details.name} हूँ। मैं ग्वालियर में ${eventLabels[details.attendance]}${confirmedYear ? ` (${invite.year})` : ""} शामिल होना चाहूँगा/चाहूँगी। मेरे सहित कुल अतिथि: ${details.guests}। आपके साथ उत्सव मनाने की प्रतीक्षा है!`,
    );
  }
  setStatus("#rsvp-message", message);
  const link = $("#whatsapp-send");
  if (link) link.href = `https://wa.me/${invite.whatsapp}?text=${encodeURIComponent(message)}`;
}

const rsvpForm = $("#rsvp-form");
if (rsvpForm) {
  const nameInput = rsvpForm.elements.namedItem("name");
  nameInput?.addEventListener("input", () => nameInput.setCustomValidity(""));
  rsvpForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (nameInput && !nameInput.value.trim()) {
      nameInput.setCustomValidity(choose("Please enter your name.", "कृपया अपना नाम लिखें।"));
    }
    if (!rsvpForm.reportValidity()) return;
    if (!readRsvp()) {
      setStatus("#form-status", choose("Please enter your name and choose 1–10 guests.", "कृपया अपना नाम लिखें और 1–10 अतिथि चुनें।"));
      return;
    }
    updateRsvpReview();
    const review = $("#rsvp-review");
    if (review) {
      rsvpForm.hidden = true;
      review.hidden = false;
      review.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "nearest" });
    }
    setStatus("#form-status", choose("Your message is ready. Open WhatsApp to send it.", "आपका संदेश तैयार है। भेजने के लिए WhatsApp खोलें।"));
    $("#whatsapp-send")?.focus({ preventScroll: true });
  });
  rsvpForm.addEventListener("input", () => {
    if ($("#rsvp-review")) $("#rsvp-review").hidden = true;
    setStatus("#form-status", "");
  });
}
$("#rsvp-edit")?.addEventListener("click", () => {
  if ($("#rsvp-review")) $("#rsvp-review").hidden = true;
  if (rsvpForm) rsvpForm.hidden = false;
  setStatus("#form-status", "");
  rsvpForm?.elements.namedItem("name")?.focus();
});

function weddingDate() {
  return new Date(`${invite.year}-11-25T${confirmedTime ? invite.weddingTime : "00:00"}:00+05:30`);
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
    $$(`[data-countdown="${unit}"]`).forEach((element) => { element.textContent = String(value).padStart(2, "0"); });
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
    setStatus("#music-status", choose("Music could not be played. Please try again.", "संगीत नहीं चल सका। कृपया फिर कोशिश करें।"));
  }
}

$("#music-toggle")?.addEventListener("click", () => {
  if (soundEnabled || musicPending) { stopMusic(); return; }
  void startMusic();
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
