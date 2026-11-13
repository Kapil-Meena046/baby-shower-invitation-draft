(() => {
  const d = window.EVENT_DETAILS || {};
  const $ = (id) => document.getElementById(id);
  const mom = d.momName || "[Mom's Name]";
  const dad = d.dadName || "[Dad's Name]";
  const eventDate = d.eventDate || "2026-11-15";
  const date = new Date(`${eventDate}T12:00:00`);
  const timeMatch = (d.eventTime || "2:00 PM").match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  let eventHour = timeMatch ? Number(timeMatch[1]) % 12 : 14;
  if (timeMatch && timeMatch[3].toUpperCase() === "PM") eventHour += 12;
  const eventMinute = timeMatch ? timeMatch[2] : "00";
  const eventStart = new Date(`${eventDate}T${String(eventHour).padStart(2, "0")}:${eventMinute}:00`);
  const fullDate = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(date);
  const heroDate = [
    new Intl.DateTimeFormat("en", { weekday: "long" }).format(date),
    new Intl.DateTimeFormat("en", { month: "long", day: "numeric" }).format(date),
    new Intl.DateTimeFormat("en", { year: "numeric" }).format(date)
  ].join(" · ").toUpperCase();
  const parents = `${mom} & ${dad}`;

  $("parentNames").textContent = parents;
  $("inviteCopy").textContent = `With hearts full of joy, ${parents} invite you to shower their little boy with love.`;
  $("heroDate").textContent = heroDate;
  $("heroTime").textContent = d.eventTime || "2:00 PM onwards";
  $("revealedDate").textContent = fullDate;
  $("revealedTime").textContent = d.eventTime || "2:00 PM onwards";
  $("venueName").textContent = d.venueName || "[Venue name]";
  $("venueAddress").textContent = d.address || "[Full street address, city]";
  $("venueNameHindi").textContent = d.venueNameHindi || "[स्थान का नाम]";
  $("venueAddressHindi").textContent = d.addressHindi || "[पूरा पता]";
  $("mapLink").href = d.mapUrl || `https://maps.google.com/?q=${encodeURIComponent(d.address || "")}`;

  document.body.classList.add("js-ready");
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        scrollObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .15 });
  document.querySelectorAll(".section-pad").forEach((section) => scrollObserver.observe(section));

  // The carved doors swing inward, then the curtains part to reveal the invitation.
  $("openButton").addEventListener("click", () => {
    $("openButton").classList.add("opened");
    $("openButton").disabled = true;
    window.setTimeout(() => $("curtains").classList.add("curtains-open"), 1300);
    window.setTimeout(() => {
      $("envelopeScreen").classList.add("opening-away");
      window.setTimeout(() => {
        $("envelopeScreen").hidden = true;
        $("invitation").hidden = false;
        window.scrollTo({ top: 0, behavior: "auto" });
        requestAnimationFrame(paintFoil);
      }, 550);
    }, 2050);
  });

  const canvas = $("scratchCanvas");
  const ctx = canvas.getContext("2d");
  function paintFoil() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const g = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    g.addColorStop(0, "#c5a567"); g.addColorStop(.48, "#e4d3a6"); g.addColorStop(1, "#ad8d50");
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = g; ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.globalAlpha = .35; ctx.fillStyle = "#fff8dd";
    for (let i = 0; i < 100; i++) ctx.fillRect(Math.random() * rect.width, Math.random() * rect.height, 2, 2);
    ctx.globalAlpha = 1;
  }
  let scratching = false;
  function scratch(e) {
    if (!scratching) return;
    const r = canvas.getBoundingClientRect();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath(); ctx.arc(e.clientX - r.left, e.clientY - r.top, 19, 0, Math.PI * 2); ctx.fill();
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let clear = 0;
    for (let i = 3; i < pixels.length; i += 4) if (pixels[i] === 0) clear++;
    if (clear > pixels.length / 4 * .48) $("scratchWrap").classList.add("scratched");
  }
  canvas.addEventListener("pointerdown", (e) => { scratching = true; canvas.setPointerCapture(e.pointerId); scratch(e); });
  canvas.addEventListener("pointermove", scratch);
  canvas.addEventListener("pointerup", () => { scratching = false; });
  canvas.addEventListener("pointercancel", () => { scratching = false; });

  function updateCountdown() {
    const remaining = Math.max(0, eventStart.getTime() - Date.now());
    $("days").textContent = String(Math.floor(remaining / 86400000)).padStart(2, "0");
    $("hours").textContent = String(Math.floor(remaining / 3600000) % 24).padStart(2, "0");
    $("minutes").textContent = String(Math.floor(remaining / 60000) % 60).padStart(2, "0");
    $("seconds").textContent = String(Math.floor(remaining / 1000) % 60).padStart(2, "0");
  }
  updateCountdown(); window.setInterval(updateCountdown, 1000);

  $("calendarButton").addEventListener("click", () => {
    const start = eventDate.replaceAll("-", "");
    const title = `Baby Shower for ${mom} & ${dad}`;
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT", `DTSTART:${start}T083000`, `DTEND:${start}T120000`, `SUMMARY:${title}`, `LOCATION:${d.venueName || ""}\\, ${d.address || ""}`, "DESCRIPTION:Come celebrate our baby boy!", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const link = document.createElement("a"); link.href = url; link.download = "baby-shower.ics"; link.click();
    URL.revokeObjectURL(url);
    $("calendarNote").textContent = "Calendar invite downloaded. Open it to add the date to your calendar.";
  });
})();
