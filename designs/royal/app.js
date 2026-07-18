/**
 * VIVA CARTA — royal / app.js
 */

(async function () {
  const raw = window.location.search.slice(1);
  const slug = raw.split("&")[0].split("=")[0];

  if (!slug) { showError("No invitation found. Please check your link."); return; }

  let cfg;
  try {
    const res = await fetch(`/clients/${slug}/config.json`);
    if (!res.ok) throw new Error("not found");
    cfg = await res.json();
  } catch (e) {
    showError("Invitation not found. Please check your link.");
    return;
  }

  const root = document.documentElement;
  root.style.setProperty("--gold",      cfg.colors.gold);
  root.style.setProperty("--brown",     cfg.colors.brown);
  root.style.setProperty("--bg",        cfg.colors.bg);
  root.style.setProperty("--goldLight", cfg.colors.goldLight);
  if (cfg.colors.royalPurple)     root.style.setProperty("--royal-purple", cfg.colors.royalPurple);
  if (cfg.colors.royalPurpleDark) root.style.setProperty("--royal-purple-dark", cfg.colors.royalPurpleDark);

  document.body.style.color = cfg.colors.brown;
  document.title = `Wedding — ${cfg.couple}`;

  document.getElementById("landing").style.backgroundImage = `url('${cfg.landingImage}')`;
  document.getElementById("landing-tagline").textContent   = cfg.landingTaglineEn;

  const initials = (cfg.groomFirst[0] + "&" + cfg.brideFirst[0]);
  document.getElementById("ring-initials-text").textContent = initials;

  const carousel = document.getElementById("carousel-bg-fixed");
  carousel.innerHTML = "";
  cfg.photos.forEach((src, i) => {
    const div = document.createElement("div");
    div.className = "carousel-slide" + (i === 0 ? " active" : "");
    div.style.backgroundImage = `url('${src}')`;
    carousel.appendChild(div);
  });
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:absolute;inset:0;background:rgba(0,0,0,0.38);z-index:1;";
  carousel.appendChild(overlay);

  if (cfg.music) {
    document.getElementById("bg-music-src").src = cfg.music;
    document.getElementById("bg-music").load();
  } else {
    document.getElementById("music-btn").style.display = "none";
  }

  document.getElementById("couple-names").textContent = cfg.couple;
  const quoteEl = document.querySelector(".quote");
  if (quoteEl) quoteEl.innerHTML = `${cfg.quoteEn}<br><span style="color:rgba(255,255,255,0.7);">${cfg.quoteRefEn}</span>`;
  const familyEl = document.querySelector(".family");
  if (familyEl) familyEl.innerHTML = cfg.familyEn;
  const inviteEl = document.querySelector(".invite-text");
  if (inviteEl) inviteEl.textContent = cfg.inviteEn;

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

  const params = new URLSearchParams(window.location.search);
  let guestName = null, guestCount = null;
  try {
    const code = params.get("c");
    if (code) {
      let b64 = code.replace(/-/g, "+").replace(/_/g, "/");
      while (b64.length % 4) b64 += "=";
      const decoded = new TextDecoder('utf-8').decode(Uint8Array.from(atob(b64), c => c.charCodeAt(0)));
      const parts = decoded.split("|");
      if (parts.length === 3 && parts[2] === cfg.secret) {
        guestName  = parts[0];
        guestCount = parts[1];
      }
    }
  } catch (e) {}

  window._cfg = cfg;
  window._guestName = guestName;
  window._guestCount = guestCount;

  if (guestCount) document.getElementById("num-guests").innerText = guestCount;

  if (guestName) {
    document.getElementById("message").innerHTML = `<b>${guestName}</b>`;
  } else {
    document.querySelector(".rsvp-section").innerHTML = `
      <h1 style="color:var(--goldLight);font-size:clamp(50px,12vw,110px);white-space:nowrap;">${cfg.couple}</h1>
      <p style="color:#fff;font-size:1.2rem;">This invitation link is not valid.</p>`;
  }
  document.getElementById("reply-deadline").textContent = cfg.rsvpDeadlineEn;

  window._weddingDate = new Date(cfg.weddingDate);

  if (!cfg.multilingual) {
    document.getElementById("lang-switcher").style.display = "none";
  }

  window._translations = {
    en: {
      quote: cfg.quoteEn, quoteRef: cfg.quoteRefEn, family: cfg.familyEn, invite: cfg.inviteEn,
      venueDate: cfg.venueDateEn, venueNote: cfg.venueNoteEn, venueLocation: cfg.venueLocationEn,
      giftText: cfg.giftIntroEn, deadline: cfg.rsvpDeadlineEn,
      attending: "Are you attending?", wishes: "Share your love and wishes:",
      yes: "Yes", no: "No", submit: "Submit", mapsLabel: "Find the venue",
      weWillBe: "We will be", attending2: "attending",
      attendingCount: "Number of persons attending:", invitedCount: "Number of persons invited:",
      thankYouYes: "Thank you for confirming your presence. We can't wait to celebrate this day with you!",
      thankYouNo: "Thank you for letting us know.", needChange: "Need to make a change?",
    },
    ar: {
      quote: cfg.quoteAr, quoteRef: cfg.quoteRefAr, family: cfg.familyAr, invite: cfg.inviteAr,
      venueDate: cfg.venueDateAr, venueNote: cfg.venueNoteAr, venueLocation: cfg.venueLocationAr,
      giftText: cfg.giftIntroAr, deadline: cfg.rsvpDeadlineAr,
      attending: "لتأكيد الحضور", wishes: "شاركونا تهانيكم وأمنياتكم:",
      yes: "نعم", no: "لا", submit: "إرسال", mapsLabel: "ابحث عن المكان",
      weWillBe: "سنحضر", attending2: "أشخاص",
      attendingCount: "عدد الحاضرين:", invitedCount: "عدد المدعوين:",
      thankYouYes: "شكراً لتأكيد حضوركم. بانتظار الاحتفال بهذا اليوم معكم!",
      thankYouNo: "شكراً لإعلامنا.", needChange: "هل تريدون التعديل؟",
    }
  };

  if (guestName && localStorage.getItem("rsvp_submitted_" + guestName)) {
    document.querySelector(".rsvp-buttons").style.display = "none";
    document.getElementById("guest-count-section").style.display = "none";
    document.getElementById("love-message").style.display = "none";
    document.getElementById("attending-question").style.display = "none";
    document.getElementById("reply-deadline").style.display = "none";
    document.getElementById("wishes-label").style.display = "none";
    document.getElementById("submit").style.display = "none";
    document.getElementById("changed-mind").style.display = "block";
    document.getElementById("edit-btn").style.display = "inline-block";
    const msgEl = document.getElementById("thank-you-msg");
    msgEl.textContent = localStorage.getItem("rsvp_message_" + guestName) || "You have already submitted your response.";
    msgEl.classList.add("visible");
  }

  const langParam = params.get("lang") || "en";
  window._langParam = langParam;
  setTimeout(() => {
    setLangContent(langParam);
    if (langParam === "ar") {
      document.querySelectorAll(".lang-option").forEach(o => o.classList.remove("active"));
      document.querySelectorAll(".lang-option")[1].classList.add("active");
    }
  }, 100);

})();

function showError(msg) {
  document.body.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:'EB Garamond',serif;font-size:1.3rem;color:#f7ecd8;background:#120818;text-align:center;padding:40px;">${msg}</div>`;
}

// ── CURTAIN OPEN → ENTER INVITATION ──
let curtainOpened = false;
function openCurtains() {
  if (curtainOpened) return;
  curtainOpened = true;

  const music = document.getElementById('bg-music');
  music.play().then(() => {
    document.getElementById('music-btn').style.display = 'flex';
  }).catch(() => {});

  document.getElementById('landing').classList.add('opening');
  document.getElementById('carousel-bg-fixed').style.display = 'block';
  document.getElementById('invitation').style.display = 'block';

  const slides = document.querySelectorAll('#carousel-bg-fixed .carousel-slide');
  let current = 0;
  if (slides.length > 1) {
    setInterval(() => {
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    }, 4000);
  }

  if (window._cfg && window._cfg.multilingual) {
    document.getElementById('lang-switcher').style.display = 'block';
  }
  if (window._langParam === 'ar') document.getElementById('lang-label').textContent = 'AR';

  setTimeout(() => {
    document.getElementById('landing').style.display = 'none';
    window.scrollTo(0, 0);
    initScrollAnimations();
  }, 1300);
}

function toggleMusic() {
  const music = document.getElementById('bg-music');
  if (music.paused) music.play(); else music.pause();
}

function updateCountdown() {
  if (!window._weddingDate) return;
  const diff = window._weddingDate - new Date();
  if (diff <= 0) {
    document.getElementById('cd-days').textContent = '0';
    document.getElementById('cd-hours').textContent = '0';
    document.getElementById('cd-minutes').textContent = '0';
    document.getElementById('cd-seconds').textContent = '🎉';
    return;
  }
  document.getElementById('cd-days').textContent    = Math.floor(diff/(1000*60*60*24));
  document.getElementById('cd-hours').textContent   = Math.floor((diff%(1000*60*60*24))/(1000*60*60));
  document.getElementById('cd-minutes').textContent = Math.floor((diff%(1000*60*60))/(1000*60));
  document.getElementById('cd-seconds').textContent = Math.floor((diff%(1000*60))/1000);
}
updateCountdown();
setInterval(updateCountdown, 1000);

let attending = null;
let confirmedGuests = 0;

function selectAttendance(choice) {
  attending = choice;
  document.getElementById("btn-yes").classList.remove("selected");
  document.getElementById("btn-no").classList.remove("selected");
  const total = parseInt(window._guestCount) || 1;
  if (choice) {
    document.getElementById("btn-yes").classList.add("selected");
    if (total >= 2) {
      buildGcDropdown(total);
      document.getElementById("gc-drop").classList.remove("open");
      confirmedGuests = 0;
      document.getElementById("gc-num").textContent = "-";
      document.getElementById("guest-count-section").style.display = "flex";
      document.getElementById("submit").disabled = true;
    } else {
      confirmedGuests = 1;
      document.getElementById("guest-count-section").style.display = "none";
      document.getElementById("submit").disabled = false;
    }
  } else {
    document.getElementById("btn-no").classList.add("selected");
    document.getElementById("guest-count-section").style.display = "none";
    confirmedGuests = 0;
    document.getElementById("submit").disabled = false;
  }
}

function submitForm() {
  if (attending === null) return;
  const submitBtn = document.getElementById("submit");
  submitBtn.textContent = "Sending...";
  submitBtn.disabled = true;
  const total = parseInt(window._guestCount) || 1;
  const finalGuests = attending ? (total >= 2 ? confirmedGuests : 1) : 0;

  document.querySelector(".rsvp-buttons").style.display = "none";
  document.getElementById("guest-count-section").style.display = "none";
  document.getElementById("love-message").style.display = "none";
  document.getElementById("attending-question").style.display = "none";
  document.getElementById("reply-deadline").style.display = "none";
  document.getElementById("wishes-label").style.display = "none";
  document.getElementById("num-guests").closest("p").style.display = "none";
  submitBtn.style.display = "none";

  if (attending) {
    document.getElementById("num-attending").textContent = finalGuests;
    document.getElementById("attending-count").style.display = "block";
    document.getElementById("rsvp-countdown").style.display = "flex";
  }

  const lang = window._currentLang || "en";
  const t = window._translations[lang];
  const thankYouText = attending ? t.thankYouYes : t.thankYouNo;
  const msgEl = document.getElementById("thank-you-msg");
  msgEl.textContent = thankYouText;
  msgEl.classList.remove("visible");
  setTimeout(() => msgEl.classList.add("visible"), 10);

  document.getElementById("edit-btn").style.display = "inline-block";
  document.getElementById("changed-mind").style.display = "block";

  const name = window._guestName;
  if (name) {
    localStorage.setItem("rsvp_submitted_" + name, "true");
    localStorage.setItem("rsvp_message_" + name, thankYouText);
  }

  if (window._cfg && window._cfg.scriptUrl) {
    fetch(window._cfg.scriptUrl, {
      method: "POST",
      body: JSON.stringify({
        name: name || "Unknown",
        guests: window._guestCount || "0",
        attending: attending ? "Yes" : "No",
        confirmedGuests: finalGuests,
        message: document.getElementById("love-message").value
      })
    }).catch(() => {});
  }
}

function editResponse() {
  const name = window._guestName;
  if (name) {
    localStorage.removeItem("rsvp_submitted_" + name);
    localStorage.removeItem("rsvp_message_" + name);
  }
  document.querySelector(".rsvp-buttons").style.display = "flex";
  document.getElementById("love-message").style.display = "block";
  document.getElementById("attending-question").style.display = "block";
  document.getElementById("reply-deadline").style.display = "block";
  document.getElementById("wishes-label").style.display = "block";
  document.getElementById("guest-count-section").style.display = "none";
  document.getElementById("rsvp-countdown").style.display = "none";
  document.getElementById("submit").style.display = "inline-block";
  document.getElementById("submit").disabled = true;
  document.getElementById("submit").textContent = "Submit";
  document.getElementById("edit-btn").style.display = "none";
  document.getElementById("changed-mind").style.display = "none";
  document.getElementById("attending-count").style.display = "none";
  document.getElementById("num-guests").closest("p").style.display = "block";
  const msgEl = document.getElementById("thank-you-msg");
  msgEl.classList.remove("visible");
  msgEl.textContent = "";
  attending = null;
  confirmedGuests = 0;
  document.getElementById("btn-yes").classList.remove("selected");
  document.getElementById("btn-no").classList.remove("selected");
  document.getElementById("love-message").value = "";
}

function buildGcDropdown(total) {
  const drop = document.getElementById("gc-drop");
  drop.innerHTML = "";
  for (let i = 1; i <= total; i++) {
    const item = document.createElement("div");
    item.className = "gc-drop-item";
    item.style.cssText = "padding:8px 0;color:rgba(255,255,255,0.75);cursor:pointer;text-align:center;";
    item.textContent = i;
    item.onclick = (e) => {
      e.stopPropagation();
      confirmedGuests = i;
      document.getElementById("gc-num").textContent = i;
      document.querySelectorAll(".gc-drop-item").forEach(d => d.style.color = "rgba(255,255,255,0.75)");
      item.style.color = "var(--goldLight)";
      document.getElementById("gc-drop").style.display = "none";
      document.getElementById("submit").disabled = false;
    };
    drop.appendChild(item);
  }
}

function toggleGcDrop(e) {
  e.stopPropagation();
  const drop = document.getElementById("gc-drop");
  drop.style.display = drop.style.display === "block" ? "none" : "block";
}

document.addEventListener("click", function(e) {
  const pill = document.getElementById("gc-pill");
  if (pill && !pill.contains(e.target)) document.getElementById("gc-drop").style.display = "none";
});

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.content-card, .hero-text').forEach(el => observer.observe(el));
}

function toggleLangMenu() {
  const menu = document.getElementById('lang-menu');
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

function selectLang(lang, label, el) {
  document.getElementById('lang-label').textContent = lang === 'ar' ? 'AR' : 'EN';
  document.getElementById('lang-menu').style.display = 'none';
  document.querySelectorAll('.lang-option').forEach(o => o.classList.remove('active'));
  el.classList.add('active');
  setLangContent(lang);
}

document.addEventListener('click', function(e) {
  const switcher = document.getElementById('lang-switcher');
  if (switcher && !switcher.contains(e.target)) document.getElementById('lang-menu').style.display = 'none';
});

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
  if (venueNoteEl) venueNoteEl.textContent = t.venueNote;
  const giftIntroEl = document.getElementById("gift-intro");
  if (giftIntroEl) giftIntroEl.textContent = t.giftText;
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
  const gcBefore = document.getElementById("gc-before");
  const gcAfter  = document.getElementById("gc-after");
  if (gcBefore) gcBefore.textContent = t.weWillBe;
  if (gcAfter)  gcAfter.textContent  = t.attending2;
  const changedEl = document.getElementById("changed-mind");
  if (changedEl) changedEl.textContent = t.needChange;
  const attendingCountEl = document.getElementById("attending-count");
  if (attendingCountEl) attendingCountEl.childNodes[0].textContent = t.attendingCount + " ";
  const invitedCountEl = document.getElementById("num-guests");
  if (invitedCountEl) invitedCountEl.closest("p").childNodes[0].textContent = t.invitedCount + " ";
  window._currentLang = lang;
}
