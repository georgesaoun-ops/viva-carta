/**
 * VIVA CARTA — app.js
 * Reads ?slug from the URL, fetches invitations/{slug}.json,
 * then injects all config data into the page template.
 *
 * URL format: viva-carta.com?georges-and-yara
 */

(async function () {

  // ── 1. READ SLUG FROM URL ────────────────────────────────────────────────
  // Supports both ?georges-and-yara  and  ?slug=georges-and-yara
  const raw = window.location.search.slice(1); // remove leading "?"
  const slug = raw.includes("=")
    ? new URLSearchParams(raw).get("slug") || raw.split("=")[1]
    : raw.split("&")[0]; // take first param key as the slug

  if (!slug) {
    showError("No invitation found. Please check your link.");
    return;
  }

  // ── 2. LOAD CONFIG ───────────────────────────────────────────────────────
  let cfg;
  try {
    const res = await fetch(`invitations/${slug}.json`);
    if (!res.ok) throw new Error("not found");
    cfg = await res.json();
  } catch (e) {
    showError("Invitation not found. Please check your link.");
    return;
  }

  // ── 3. APPLY COLORS ─────────────────────────────────────────────────────
  const root = document.documentElement;
  root.style.setProperty("--gold",      cfg.colors.gold);
  root.style.setProperty("--brown",     cfg.colors.brown);
  root.style.setProperty("--bg",        cfg.colors.bg);
  root.style.setProperty("--goldLight", cfg.colors.goldLight);

  document.body.style.backgroundColor = cfg.colors.bg;
  document.body.style.color           = cfg.colors.brown;

  // ── 4. PAGE TITLE ────────────────────────────────────────────────────────
  document.title = `Wedding — ${cfg.couple}`;

  // ── 5. LANDING PAGE ──────────────────────────────────────────────────────
  document.getElementById("landing").style.backgroundImage = `url('${cfg.landingImage}')`;
  document.getElementById("landing-tagline").textContent   = cfg.landingTaglineEn;

  // Ring initials
  const initials = (cfg.groomFirst[0] + "&" + cfg.brideFirst[0]);
  document.getElementById("ring-initials-text").textContent = initials;

  // ── 6. CAROUSEL PHOTOS ───────────────────────────────────────────────────
  const carousel = document.getElementById("carousel-bg-fixed");
  carousel.innerHTML = ""; // clear placeholder slides
  cfg.photos.forEach((src, i) => {
    const div = document.createElement("div");
    div.className = "carousel-slide" + (i === 0 ? " active" : "");
    div.style.backgroundImage = `url('${src}')`;
    carousel.appendChild(div);
  });
  // overlay
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:absolute;inset:0;background:rgba(0,0,0,0.38);z-index:1;";
  carousel.appendChild(overlay);

  // ── 7. MUSIC ─────────────────────────────────────────────────────────────
  if (cfg.music) {
    document.getElementById("bg-music-src").src = cfg.music;
    document.getElementById("bg-music").load();
  } else {
    document.getElementById("music-btn").style.display = "none";
  }

  // ── 8. SECTION 1 — Hero ──────────────────────────────────────────────────
  document.getElementById("couple-names").textContent = cfg.couple;

  // ── 9. SECTION 2 — Venue ─────────────────────────────────────────────────
  document.getElementById("venue-name-title").textContent = cfg.venueName;
  document.getElementById("venue-location").innerHTML    = `<strong>${cfg.venueLocationEn}</strong>`;
  document.getElementById("venue-date").innerHTML        = `<strong>${cfg.venueDateEn}</strong>`;
  document.getElementById("venue-note").textContent      = cfg.venueNoteEn;
  document.getElementById("maps-btn").href               = cfg.venueMapsUrl;
  document.getElementById("maps-name").textContent       = cfg.venueMapsLabel;

  if (cfg.venueImage) {
    document.getElementById("venue-img").src = cfg.venueImage;
    document.getElementById("venue-img").alt = cfg.venueName;
  } else {
    document.getElementById("venue-img").style.display = "none";
  }

  // ── 10. SECTION 3 — Gift Registry ────────────────────────────────────────
  document.getElementById("gift-intro").textContent = cfg.giftIntroEn;
  const giftContainer = document.getElementById("gift-accounts");
  giftContainer.innerHTML = "";
  cfg.giftAccounts.forEach(acc => {
    const box = document.createElement("div");
    box.className = "gift-inner";
    let html = `<p style="font-size:1.05rem;">${acc.labelEn}</p><hr>`;
    acc.lines.forEach(line => {
      if (typeof line === "string") {
        html += `<p style="font-size:1.1rem;letter-spacing:1px;"><strong>${line}</strong></p>`;
      } else {
        html += `<p style="font-size:0.85rem;letter-spacing:1px;opacity:0.8;">${line.label}</p>`;
        html += `<p style="font-size:0.88rem;letter-spacing:1px;line-height:1.6;word-break:break-word;"><strong><span translate="no">${line.value}</span></strong></p>`;
        if (acc.lines.indexOf(line) < acc.lines.length - 1) html += "<hr>";
      }
    });
    box.innerHTML = html;
    giftContainer.appendChild(box);
  });

  // ── 11. RSVP SECTION — decode guest token ────────────────────────────────
  const params = new URLSearchParams(window.location.search);
  let guestName = null, guestCount = null;

  try {
    const code = params.get("c");
    if (code) {
      let b64 = code.replace(/-/g, "+").replace(/_/g, "/");
      while (b64.length % 4) b64 += "=";
      const decoded = atob(b64);
      const parts   = decoded.split("|");
      if (parts.length === 3 && parts[2] === cfg.secret) {
        guestName  = parts[0];
        guestCount = parts[1];
      }
    }
  } catch (e) {}

  // Expose to global scope for inline handlers
  window._cfg        = cfg;
  window._guestName  = guestName;
  window._guestCount = guestCount;

  if (guestName) {
    document.getElementById("rsvp-guest-name").innerHTML = `<b>${guestName}</b>`;
  } else {
    // Invalid link — replace RSVP section with message
    document.querySelector(".rsvp-section").innerHTML = `
      <h1 style="font-family:'Great Vibes',cursive;color:var(--brown);font-size:clamp(50px,12vw,110px);white-space:nowrap;">${cfg.couple}</h1>
      <p style="color:var(--brown);font-family:'EB Garamond',serif;font-size:1.2rem;">This invitation link is not valid.</p>`;
  }

  // RSVP deadline
  document.getElementById("reply-deadline").textContent = cfg.rsvpDeadlineEn;

  // ── 12. WEDDING COUNTDOWN ─────────────────────────────────────────────────
  window._weddingDate = new Date(cfg.weddingDate);

  // ── 13. MULTILINGUAL — hide switcher if not needed ───────────────────────
  if (!cfg.multilingual) {
    document.getElementById("lang-switcher").style.display = "none";
  }

  // ── 14. TRANSLATIONS (injected from config) ───────────────────────────────
  window._translations = {
    en: {
      quote:          cfg.quoteEn,
      quoteRef:       cfg.quoteRefEn,
      family:         cfg.familyEn,
      invite:         cfg.inviteEn,
      venueDate:      cfg.venueDateEn,
      venueNote:      cfg.venueNoteEn,
      venueLocation:  cfg.venueLocationEn,
      giftText:       cfg.giftIntroEn,
      deadline:       cfg.rsvpDeadlineEn,
      tagline:        cfg.landingTaglineEn,
      attending:      "Are you attending?",
      wishes:         "Share your love and wishes:",
      yes:            "Yes", no: "No", submit: "Submit",
      mapsLabel:      "Find the venue",
      punctual:       "We kindly ask guests to arrive a little early so the ceremony may begin promptly at the scheduled time.",
      weWillBe:       "We will be", attending2: "attending",
      attendingCount: "Number of persons attending:",
      thankYouYes:    "Thank you for confirming your presence. We can't wait to celebrate this day with you!",
      thankYouNo:     "Thank you for letting us know.",
      needChange:     "Need to make a change?",
    },
    ar: {
      quote:          cfg.quoteAr,
      quoteRef:       cfg.quoteRefAr,
      family:         cfg.familyAr,
      invite:         cfg.inviteAr,
      venueDate:      cfg.venueDateAr,
      venueNote:      cfg.venueNoteAr,
      venueLocation:  cfg.venueLocationAr,
      giftText:       cfg.giftIntroAr,
      deadline:       cfg.rsvpDeadlineAr,
      tagline:        cfg.landingTaglineAr,
      attending:      "هل ستحضرون؟",
      wishes:         "شاركونا تهانيكم وأمنياتكم:",
      yes:            "نعم", no: "لا", submit: "إرسال",
      mapsLabel:      "ابحث عن المكان",
      punctual:       "نرجو من الضيوف الكرام الحضور قبل الموعد حتى يبدأ الاكليل في الوقت المحدد.",
      weWillBe:       "سنحضر", attending2: "أشخاص",
      attendingCount: "عدد الحاضرين:",
      thankYouYes:    "شكراً لتأكيد حضوركم. بانتظار الاحتفال بهذا اليوم معكم!",
      thankYouNo:     "شكراً لإعلامنا.",
      needChange:     "هل تريدون التعديل؟",
    }
  };

  // set initial EN content
  setLangContent("en");

  // ── 15. ALREADY SUBMITTED? ────────────────────────────────────────────────
  if (guestName && localStorage.getItem("rsvp_submitted_" + guestName)) {
    document.querySelector(".rsvp-buttons").style.display      = "none";
    document.getElementById("guest-count-section").style.display = "none";
    document.getElementById("love-message").style.display      = "none";
    document.getElementById("attending-question").style.display = "none";
    document.getElementById("reply-deadline").style.display    = "none";
    document.getElementById("wishes-label").style.display      = "none";
    document.getElementById("submit").style.display            = "none";
    document.getElementById("changed-mind").style.display      = "block";
    document.getElementById("edit-btn").style.display          = "inline-block";
    const msgEl = document.getElementById("thank-you-msg");
    msgEl.textContent = localStorage.getItem("rsvp_message_" + guestName) || "You have already submitted your response.";
    msgEl.classList.add("visible");
  }

  // ── DONE — page is ready ─────────────────────────────────────────────────

})();

// ── ERROR HELPER ─────────────────────────────────────────────────────────────
function showError(msg) {
  document.body.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:'EB Garamond',serif;font-size:1.3rem;color:#74583e;text-align:center;padding:40px;">${msg}</div>`;
}

// ── LANGUAGE INJECTION ────────────────────────────────────────────────────────
function setLangContent(lang) {
  const t = window._translations[lang];
  if (!t) return;

  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

  const quoteEl = document.querySelector(".quote");
  if (quoteEl) quoteEl.innerHTML = `${t.quote}<br><span style="color:rgba(255,255,255,0.7);">${t.quoteRef}</span>`;

  const familyEl = document.querySelector(".family");
  if (familyEl) familyEl.innerHTML = t.family;

  const inviteEl = document.querySelector(".invite-text");
  if (inviteEl) inviteEl.textContent = t.invite;

  const venueDateEl = document.getElementById("venue-date");
  if (venueDateEl) venueDateEl.innerHTML = `<strong>${t.venueDate.replace(/\n/g, "<br>")}</strong>`;

  const venueLocEl = document.getElementById("venue-location");
  if (venueLocEl) venueLocEl.innerHTML = `<strong>${t.venueLocation}</strong>`;

  const venueNoteEl = document.getElementById("venue-note");
  if (venueNoteEl) {
    venueNoteEl.textContent = t.venueNote;
    venueNoteEl.style.fontSize        = lang === "ar" ? "1rem" : "0.75rem";
    venueNoteEl.style.letterSpacing   = lang === "ar" ? "0"    : "2px";
    venueNoteEl.style.textTransform   = lang === "ar" ? "none" : "uppercase";
  }

  const giftIntroEl = document.getElementById("gift-intro");
  if (giftIntroEl) giftIntroEl.textContent = t.giftText;

  // Gift account labels
  const giftLabels = document.querySelectorAll(".gift-label");
  const accounts   = window._cfg.giftAccounts;
  giftLabels.forEach((el, i) => {
    if (accounts[i]) el.textContent = lang === "ar" ? accounts[i].labelAr || accounts[i].labelEn : accounts[i].labelEn;
  });

  const attendingEl = document.getElementById("attending-question");
  if (attendingEl) attendingEl.textContent = t.attending;

  const deadlineEl = document.getElementById("reply-deadline");
  if (deadlineEl) deadlineEl.textContent = t.deadline;

  const wishesEl = document.getElementById("wishes-label");
  if (wishesEl) wishesEl.textContent = t.wishes;

  const btnYes = document.getElementById("btn-yes");
  const btnNo  = document.getElementById("btn-no");
  if (btnYes) btnYes.textContent = t.yes;
  if (btnNo)  btnNo.textContent  = t.no;

  const submitEl = document.getElementById("submit");
  if (submitEl && submitEl.textContent !== "Sending...") submitEl.textContent = t.submit;

  const mapsLabelEl = document.querySelector(".maps-label");
  if (mapsLabelEl) mapsLabelEl.textContent = t.mapsLabel;

  const punctualEl = document.getElementById("punctual-note");
  if (punctualEl) punctualEl.textContent = t.punctual;

  const gcBefore = document.getElementById("gc-before");
  const gcAfter  = document.getElementById("gc-after");
  if (gcBefore) gcBefore.textContent = t.weWillBe;
  if (gcAfter)  gcAfter.textContent  = t.attending2;

  const taglineEl = document.getElementById("landing-tagline");
  if (taglineEl && t.tagline) taglineEl.textContent = t.tagline;

  const changedEl = document.getElementById("changed-mind");
  if (changedEl) changedEl.textContent = t.needChange;

  const attendingCountEl = document.getElementById("attending-count");
  if (attendingCountEl) attendingCountEl.childNodes[0].textContent = t.attendingCount + " ";

  window._currentLang = lang;
}
