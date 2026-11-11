/* Cloud Matcha v2 — interacciones y motion */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const money = n => "$" + n.toLocaleString("es-CO").replace(/,/g, ".");
  const hasG = !!window.gsap;
  const IMG = k => `assets/img/${k}.webp`;

  /* ---------- scroll suave ---------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    if (hasG && window.ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
    } else { const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
  }
  const scrollTo = (el, off = 0) => {
    const y = el.getBoundingClientRect().top + scrollY - off;
    lenis ? lenis.scrollTo(y, { duration: 1.2 }) : scrollTo_(y);
  };
  const scrollTo_ = y => window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });

  /* ---------- header ---------- */
  const hdr = $(".site-header");
  const setHH = () => document.documentElement.style.setProperty("--hh", hdr.offsetHeight + "px");
  setHH(); addEventListener("resize", setHH);
  const onS = () => hdr.classList.toggle("is-scrolled", scrollY > 60);
  addEventListener("scroll", onS, { passive: true }); onS();

  const burger = $(".burger"), mnav = $("#mnav");
  const toggleNav = open => {
    burger.setAttribute("aria-expanded", open); mnav.classList.toggle("is-open", open);
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    document.body.style.overflow = open ? "hidden" : ""; open ? lenis?.stop() : lenis?.start();
  };
  burger?.addEventListener("click", () => toggleNav(burger.getAttribute("aria-expanded") !== "true"));
  addEventListener("keydown", e => { if (e.key === "Escape" && mnav.classList.contains("is-open")) toggleNav(false); });

  /* ---------- abierto ahora (hora de Bogotá, horario habitual) ---------- */
  $$("[data-open]").forEach(el => {
    try {
      const p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Bogota", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      const g = t => p.find(x => x.type === t).value, d = g("weekday"), h = +g("hour") % 24 + +g("minute") / 60;
      const wk = ["Sat", "Sun"].includes(d), from = wk ? 10 : 9, open = h >= from && h < 19;
      el.classList.add(open ? "is-open" : "is-closed");
      el.lastElementChild.textContent = open ? "Abierto ahora · ven al bar o pide a domicilio" : `Abrimos a las ${(h >= 19 ? (["Fri", "Sat"].includes(d) ? 10 : 9) : from)}:00 a. m. · deja tu pedido listo`;
    } catch (_) {}
  });

  /* ---------- horario en vivo ---------- */
  const H = $("[data-hours]");
  if (H) try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Bogota", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    const g = t => parts.find(x => x.type === t).value;
    const di = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(g("weekday")), h = (+g("hour") % 24) + (+g("minute")) / 60;
    const days = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
    const openAt = k => k < 5 ? 9 : 10, close = 19, A = 7, Z = 20, op = openAt(di);
    const fmt = x => `${x > 12 ? x - 12 : x}:00 ${x >= 12 ? "p. m." : "a. m."}`;
    $$(".hrs__week li", H).forEach((li, k) => li.classList.toggle("is-today", k === di));
    $("[data-day]", H).textContent = "Hoy, " + days[di];
    $("[data-range]", H).textContent = `${fmt(op)} – ${fmt(close)}`;
    H.style.setProperty("--o", (op - A) / (Z - A)); H.style.setProperty("--w", (close - op) / (Z - A));
    const now = $(".hrs__now", H); if (h >= A && h <= Z) { now.hidden = false; H.style.setProperty("--n", (h - A) / (Z - A)); }
    const st = $("[data-st]", H), isOpen = h >= op && h < close;
    st.classList.add(isOpen ? "is-open" : "is-closed"); st.lastElementChild.textContent = isOpen ? "Abierto ahora" : "Cerrado ahora";
    let msg;
    if (isOpen) { const m = Math.round((close - h) * 60); msg = `Te quedan ${Math.floor(m / 60) ? Math.floor(m / 60) + " h " : ""}${m % 60} min para pasar por tu matcha.`; }
    else if (h < op) msg = `Abrimos hoy a las ${fmt(op)}. Mientras tanto, pide a domicilio.`;
    else msg = `Mañana abrimos a las ${fmt(openAt((di + 1) % 7))}. ¡Te esperamos!`;
    $("[data-msg]", H).textContent = msg;
  } catch (_) {}

  /* ---------- motion ---------- */
  if (hasG && window.ScrollTrigger && !reduce) {
    gsap.registerPlugin(ScrollTrigger);
    // entrada del hero
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.from("[data-hero]", { yPercent: 110, opacity: 0, duration: 1.2, stagger: .09 })
      .from(".hero .cups img", { yPercent: 35, opacity: 0, scale: .85, duration: 1.4, stagger: .1 }, "-=1")
      .from(".fav .cupw", { yPercent: 25, opacity: 0, duration: 1.3 }, "-=1.2")
      .from(".note", { opacity: 0, y: 20, duration: .8, stagger: .15 }, "-=.7");
    // cielo del hero: entrada, parallax con mouse y scroll
    $$(".sky [data-d]").forEach(el => gsap.to(el, { yPercent: -el.dataset.d * 4, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } }));
    // dibujar doodles
    $$(".doodle path, .doodle circle, .note svg path, .arrow path").forEach(p => {
      const L = p.getTotalLength?.() || 300; gsap.set(p, { strokeDasharray: L, strokeDashoffset: L });
      gsap.to(p, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut", delay: .5, scrollTrigger: { trigger: p.closest("section") || p, start: "top 85%" } });
    });
    gsap.to(".doodle", { y: -10, rotate: "+=4", duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: .4 });
    // parallax vasos
    gsap.to(".cups .s1", { y: -50, rotate: -4, scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".cups .s2", { y: -70, rotate: 4, scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".cups .c", { y: -30, scale: 1.04, scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    // revelados
    ScrollTrigger.batch(".rv", {
      start: "top 90%", once: true,
      onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 1, ease: "expo.out", stagger: .08, overwrite: true })
    });
    // marquee reacciona al scroll
    const mq = $(".mq__in");
    if (mq) { let v = 0; ScrollTrigger.create({ onUpdate: s => { v = gsap.utils.clamp(-6, 6, s.getVelocity() / 300); gsap.to(mq, { skewX: -v, duration: .4, overwrite: true }); } }); }
    // productos de las tarjetas flotan
    $$(".card .prod").forEach(p => gsap.fromTo(p, { y: 40 }, { y: -30, ease: "none", scrollTrigger: { trigger: p.closest(".card"), scrub: true } }));
    // orb de origen
    $$("[data-orb] img").forEach(p => gsap.to(p, { rotate: 8, y: -30, ease: "none", scrollTrigger: { trigger: p, scrub: true } }));
  } else {
    document.documentElement.classList.remove("js");
  }

  /* cielo interactivo */
  const hero = $(".hero"), skyEls = $$(".sky [data-d]");
  if (hero && skyEls.length && hasG && !reduce) {
    const movers = skyEls.map(el => ({ d: +el.dataset.d, x: gsap.quickTo(el, "x", { duration: 1.4, ease: "power3.out" }), y: gsap.quickTo(el, "y", { duration: 1.4, ease: "power3.out" }) }));
    hero.addEventListener("pointermove", e => { const r = hero.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5; movers.forEach(m => { m.x(-nx * m.d * 1.6); m.y(-ny * m.d); }); });
    hero.addEventListener("pointerleave", () => movers.forEach(m => { m.x(0); m.y(0); }));
    skyEls.forEach(el => el.addEventListener("click", () => gsap.fromTo(el.firstElementChild, { rotate: -12 }, { rotate: 0, duration: 1, ease: "elastic.out(1,.3)" })));
  }

  /* inclinación suave al pasar el mouse */
  if (matchMedia("(hover:hover)").matches && !reduce) {
    $$(".card, .cat, .res").forEach(c => {
      c.addEventListener("pointermove", e => { const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-6px)`; });
      c.addEventListener("pointerleave", () => c.style.transform = "");
    });
  }

  /* ---------- rueda de antojos ---------- */
  const moods = [
    ["extra-rich", "Originales · Shot extra", "Extra Rich", "Con shot extra de matcha.", "$26.000 · $35.000", "var(--lime-3)"],
    ["hojicha-latte", "Originales · Hojicha", "Hojicha Latte", "Té verde tostado, suave y reconfortante.", "$16.500 · $21.500", "var(--latte)"],
    ["coconut-water-matcha", "Originales · Agua de coco", "Coconut Water Matcha", "Matcha con agua de coco.", "$24.000 · $32.000", "var(--mint)"],
    ["pistachio-matcha", "Premium · Sugar free", "Pistachio Matcha Latte", "De la línea premium, sin azúcar.", "$26.000 · $37.500", "var(--cream)"]];
  const slugify = t => t.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  $$(".wheel button").forEach(b => b.addEventListener("click", () => {
    const i = +b.dataset.m, m = moods[i], r = $(".res");
    $$(".wheel button").forEach(x => x.setAttribute("aria-pressed", x === b));
    $(".hub").style.rotate = `${[-45, 45, -135, 135][i]}deg`;
    r.classList.add("swap");
    setTimeout(() => {
      $("#ri").src = IMG(m[0]); $("#ri").alt = m[2]; $("#rk").textContent = m[1]; $("#rn").textContent = m[2]; $("#rd").textContent = m[3]; $("#rp").textContent = m[4];
      r.href = "menu.html#" + slugify(m[2]); r.style.setProperty("--rc", m[5]); r.classList.remove("swap");
    }, 340);
  }));

  /* ---------- reloj ---------- */
  const slots = [["01 · Abrimos", "09", "00", "Primer sorbo", "Empieza el día con lo más puro.", "usucha", "Usucha · $20.000"],
    ["02 · Mediodía", "12", "30", "Recarga", "Después del gym o de la reunión: algo que te sostenga.", "protein-matcha", "Protein Matcha · $29.500"],
    ["03 · Tarde", "15", "00", "Algo frío", "El calor de Barranquilla pide agua de coco.", "coconut-water-matcha", "Coconut Water Matcha · $24.000"],
    ["04 · Antes de cerrar", "18", "30", "¿Uno más?", "Un softserve sin azúcar antes de irte a casa.", "matcha-softserve", "Matcha Softserve · $22.000"]];
  const tabs = $$(".tabs button");
  if (tabs.length) {
    let ti = 0, auto;
    const slot = i => {
      ti = i; const s = slots[i];
      tabs.forEach((b, k) => b.setAttribute("aria-selected", k === i));
      $("#tl").textContent = s[0]; $("#td").innerHTML = `${s[1]}<i>:</i>${s[2]}`; $("#tt").textContent = s[3]; $("#tp").textContent = s[4];
      $("#tdi").src = IMG(s[5]); $("#tdn").textContent = s[6]; $("#tdl").href = "menu.html#" + slugify(s[6].split(" · ")[0]);
      if (hasG && !reduce) gsap.fromTo(["#td", ".slot"], { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .7, ease: "expo.out", stagger: .06 });
    };
    tabs.forEach(b => b.addEventListener("click", () => { clearInterval(auto); slot(+b.dataset.t); }));
    const panel = $(".panel");
    new IntersectionObserver(([en]) => { clearInterval(auto); if (en.isIntersecting && !reduce) auto = setInterval(() => slot((ti + 1) % 4), 3800); }, { threshold: .4 }).observe(panel);
    panel.addEventListener("pointerenter", () => clearInterval(auto));
  }

  /* ---------- formulario demo ---------- */
  $$("form.form").forEach(f => f.addEventListener("submit", e => { e.preventDefault(); const m = $(".form__msg", f); m.hidden = false; m.focus?.(); }));

  /* ---------- MENÚ ---------- */
  const dataEl = $("#menu-data");
  if (!dataEl) return;
  const { items, favs } = JSON.parse(dataEl.textContent);

  /* favoritos tipo carrusel */
  const fav = $(".fav"), cup = $("#cup");
  let cur = 0, busy = false, favAuto;
  const priceHTML = p => p.map(([l, v]) => `<div><small>${l}</small><b>${money(v)}</b></div>`).join("");
  const fill = i => {
    const f = favs[i], it = items[f.k];
    $("[data-f=n]").textContent = String(i + 1).padStart(2, "0") + " / " + String(favs.length).padStart(2, "0");
    $("[data-f=name]").textContent = it.n; $("[data-f=desc]").textContent = it.d || "";
    $("[data-f=tags]").innerHTML = [it.s, ...it.t].map(t => `<span class="chip">${t}</span>`).join("");
    $("[data-f=price]").innerHTML = priceHTML(it.p); $("[data-f=big]").textContent = f.big;
    fav.style.setProperty("--c", `var(--${f.c})`); fav.style.setProperty("--c2", `var(--${f.c2})`);
  };
  const go = i => {
    if (busy || i === cur) return; busy = true;
    const dir = (i > cur || (cur === favs.length - 1 && i === 0)) && !(cur === 0 && i === favs.length - 1) ? 1 : -1;
    $$(".fav .fade").forEach(e => e.classList.add("hide")); cup.classList.add(dir > 0 ? "out" : "in"); $(".big").style.opacity = 0;
    setTimeout(() => {
      cur = i; fill(i); const it = items[favs[i].k];
      cup.src = IMG(it.i); cup.alt = it.n;
      cup.style.transition = "none"; cup.classList.remove("out", "in"); cup.classList.add(dir > 0 ? "in" : "out"); void cup.offsetWidth;
      cup.style.transition = ""; cup.classList.remove("in", "out");
      $$(".fav .fade").forEach(e => e.classList.remove("hide")); $(".big").style.opacity = 1;
      $$(".thumbs button").forEach((b, k) => b.setAttribute("aria-selected", k === i));
      setTimeout(() => busy = false, 520);
    }, 420);
  };
  $$(".thumbs button").forEach((b, k) => b.addEventListener("click", () => { clearInterval(favAuto); go(k); }));
  $$(".arrows button").forEach(b => b.addEventListener("click", () => { clearInterval(favAuto); go((cur + +b.dataset.dir + favs.length) % favs.length); }));
  // deslizar en móvil
  let sx = null;
  $(".fav__stage").addEventListener("pointerdown", e => sx = e.clientX);
  $(".fav__stage").addEventListener("pointerup", e => { if (sx !== null && Math.abs(e.clientX - sx) > 40) { clearInterval(favAuto); go((cur + (e.clientX < sx ? 1 : -1) + favs.length) % favs.length); } sx = null; });
  if (!reduce) {
    new IntersectionObserver(([en]) => { clearInterval(favAuto); if (en.isIntersecting) favAuto = setInterval(() => go((cur + 1) % favs.length), 4200); }, { threshold: .5 }).observe(fav);
    fav.addEventListener("pointerenter", () => clearInterval(favAuto));
  }
  $$("[data-fav-open]").forEach(b => b.addEventListener("click", () => openSheet(favs[cur].k, b)));

  /* pestañas, búsqueda y filtro */
  const secs = $$(".msec"), tabLinks = $$(".cat-tabs a"), cards = $$(".item[data-i]");
  const setActive = id => tabLinks.forEach(a => {
    const on = a.dataset.tab === id; a.classList.toggle("is-active", on);
    if (on) { const ul = a.closest(".cat-tabs"); ul.scrollTo({ left: a.offsetLeft - ul.clientWidth / 2 + a.clientWidth / 2, behavior: "smooth" }); }
  });
  const offset = () => hdr.offsetHeight + $(".tools").offsetHeight + 16;
  tabLinks.forEach(a => a.addEventListener("click", e => { e.preventDefault(); const t = $("#" + a.dataset.tab); if (t && !t.classList.contains("is-hidden")) scrollTo(t, offset()); }));
  const spy = () => { let id = secs[0]?.id; const y = offset() + 40; secs.forEach(s => { if (!s.classList.contains("is-hidden") && s.getBoundingClientRect().top < y) id = s.id; }); setActive(id); };
  addEventListener("scroll", spy, { passive: true }); spy();

  const input = $(".search input"), tgl = $(".toggle"), empty = $(".empty");
  const norm = t => t.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const apply = () => {
    const q = norm(input.value.trim()), sf = tgl.getAttribute("aria-pressed") === "true";
    let any = 0;
    cards.forEach(c => { const ok = (!q || norm(c.dataset.name).includes(q)) && (!sf || c.dataset.tags.includes("sugarfree")); c.classList.toggle("is-hidden", !ok); if (ok) { any++; c.style.opacity = 1; c.style.transform = "none"; } });
    secs.forEach(s => s.classList.toggle("is-hidden", !$$(".item:not(.is-hidden)", s).length));
    empty.hidden = !!any; window.ScrollTrigger?.refresh(); spy();
  };
  input.addEventListener("input", apply);
  tgl.addEventListener("click", () => { tgl.setAttribute("aria-pressed", tgl.getAttribute("aria-pressed") !== "true"); apply(); });

  /* ficha del producto */
  const sheet = $("#sheet"), box = $(".sheet__box", sheet);
  let it = null, size = 0, q = 1, lastFocus = null;
  const seg = id => $$(`#${id} .seg button`);
  const pressed = id => seg(id).find(b => b.getAttribute("aria-pressed") === "true");
  const total = () => {
    if (!it) return;
    const base = it.p[size][1], milk = it.milk ? +pressed("o-milk").dataset.v : 0, foam = it.foam ? +pressed("o-foam").dataset.v : 0;
    $("#sh-total").textContent = money((base + milk + foam) * q); $("#sh-q").textContent = q;
  };
  const bindSeg = id => $(`#${id} .seg`).addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    seg(id).forEach(x => x.setAttribute("aria-pressed", x === b));
    if (id === "o-size") size = +b.dataset.i;
    $("#sh-msg").hidden = true; total();
  });
  ["o-size", "o-temp", "o-milk", "o-foam"].forEach(bindSeg);
  $$(".qty button", sheet).forEach(b => b.addEventListener("click", () => { q = Math.max(1, Math.min(20, q + +b.dataset.q)); total(); }));
  function openSheet(i, from) {
    it = items[i]; size = 0; q = 1; lastFocus = from || document.activeElement;
    $("#sh-k").textContent = it.s; $("#sh-n").textContent = it.n; $("#sh-d").textContent = it.d || ""; $("#sh-d").hidden = !it.d;
    $("#sh-t").innerHTML = it.t.map(t => `<span class="chip">${t}</span>`).join("");
    $("#sh-big").textContent = it.n.split(" ")[0].toLowerCase();
    box.style.setProperty("--c", `var(--${it.c})`);
    $("#sh-img").hidden = !it.i; $("#sh-noimg").hidden = !!it.i;
    if (it.i) { $("#sh-img").src = IMG(it.i); $("#sh-img").alt = it.n; }
    $("#o-size .seg").innerHTML = it.p.map(([l, v], k) => `<button type="button" data-i="${k}" aria-pressed="${k === 0}">${l} <small>${money(v)}</small></button>`).join("");
    $("#o-size b").textContent = it.p.length > 1 ? "Tamaño" : "Precio";
    $("#o-milk").hidden = !it.milk; $("#o-foam").hidden = !it.foam; $("#o-temp").hidden = !it.temp;
    ["o-milk", "o-foam", "o-temp"].forEach(id => seg(id).forEach((b, k) => b.setAttribute("aria-pressed", k === 0)));
    $("#sh-msg").hidden = true; total();
    sheet.classList.add("is-open"); sheet.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; lenis?.stop();
    if (hasG && !reduce) gsap.fromTo("#sh-img", { y: 60, rotate: -10, opacity: 0 }, { y: 0, rotate: 0, opacity: 1, duration: 1, ease: "expo.out", delay: .1 });
    setTimeout(() => $(".x", sheet).focus(), 60);
  }
  const closeSheet = () => {
    sheet.classList.remove("is-open"); sheet.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; lenis?.start();
    lastFocus?.focus?.({ preventScroll: true });
    if (location.hash.length > 1 && $(location.hash)?.classList.contains("item")) history.replaceState(null, "", location.pathname);
  };
  $$("[data-close]", sheet).forEach(b => b.addEventListener("click", closeSheet));
  addEventListener("keydown", e => {
    if (!sheet.classList.contains("is-open")) return;
    if (e.key === "Escape") closeSheet();
    if (e.key === "Tab") { const f = $$("button:not([hidden]), a", box).filter(x => x.offsetParent); const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
  });
  cards.forEach(c => $(".item__hit", c).addEventListener("click", e => openSheet(+c.dataset.i, e.currentTarget)));
  /* ---------- pedido (carrito) ---------- */
  const cart = (() => { try { return JSON.parse(localStorage.getItem("cm-cart") || "[]"); } catch (_) { return []; } })();
  const save = () => { try { localStorage.setItem("cm-cart", JSON.stringify(cart)); } catch (_) {} };
  const cartEl = $("#cart"), fab = $(".cartfab"), toast = $(".toast");
  let mode = "domicilio", toastT;
  const lineTotal = l => l.unit * l.q;
  const sum = () => cart.reduce((a, l) => a + lineTotal(l), 0);
  const count = () => cart.reduce((a, l) => a + l.q, 0);
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const renderCart = (bump) => {
    const n = count();
    fab.hidden = !n; $(".cartfab__n", fab).textContent = n; $("b", fab).textContent = money(sum());
    if (bump && hasG && !reduce) gsap.fromTo(fab, { scale: .85 }, { scale: 1, duration: .6, ease: "elastic.out(1,.5)" });
    $(".cart__lines").innerHTML = cart.map((l, k) => { const it = items[l.i]; return `<li class="cline" style="--c:var(--${it.c})">
      <span class="cline__img">${it.i ? `<img src="${IMG(it.i)}" alt="" width="60" height="60">` : ""}</span>
      <span class="cline__txt"><b>${esc(it.n)}</b><small>${esc(l.opts.join(" · ") || it.s)}</small><span class="cline__p">${money(lineTotal(l))}</span></span>
      <span class="qty qty--s"><button type="button" data-k="${k}" data-d="-1" aria-label="Quitar uno">−</button><output>${l.q}</output><button type="button" data-k="${k}" data-d="1" aria-label="Agregar uno">+</button></span></li>`; }).join("");
    $(".cart__empty").hidden = !!n; $("#cart-form").hidden = !n; $(".cart__foot").hidden = !n;
    $("#c-sub").textContent = $("#c-total").textContent = money(sum());
    save();
  };
  $(".cart__lines").addEventListener("click", e => {
    const b = e.target.closest("button[data-k]"); if (!b) return;
    const l = cart[+b.dataset.k]; l.q += +b.dataset.d; if (l.q < 1) cart.splice(+b.dataset.k, 1);
    $("#c-msg").hidden = true; renderCart();
  });
  const say = t => { toast.textContent = t; toast.classList.add("is-on"); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove("is-on"), 2400); };
  $("#sh-order").addEventListener("click", () => {
    const opts = [];
    if (it.p.length > 1 || it.p[0][0] !== "Precio") opts.push(it.p[size][0]);
    if (it.temp) opts.push(pressed("o-temp").textContent.trim());
    if (it.milk) opts.push("Leche de " + pressed("o-milk").firstChild.textContent.trim().toLowerCase());
    if (it.foam && +pressed("o-foam").dataset.v) opts.push("Cold foam " + pressed("o-foam").textContent.trim().toLowerCase());
    const unit = it.p[size][1] + (it.milk ? +pressed("o-milk").dataset.v : 0) + (it.foam ? +pressed("o-foam").dataset.v : 0);
    const i = items.indexOf(it), same = cart.find(l => l.i === i && l.opts.join() === opts.join());
    same ? same.q += q : cart.push({ i, opts, unit, q });
    closeSheet(); renderCart(true); say(`Agregado: ${q} × ${it.n}`);
  });
  const openCart = () => { cartEl.classList.add("is-open"); cartEl.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; lenis?.stop(); setTimeout(() => $(".x", cartEl).focus(), 60); };
  const closeCart = () => { cartEl.classList.remove("is-open"); cartEl.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; lenis?.start(); };
  $$("[data-cart-open]").forEach(b => b.addEventListener("click", () => count() ? openCart() : (scrollTo($("#carta"), hdr.offsetHeight), say("Escoge algo del menú para empezar tu pedido"))));
  $$("[data-cclose]", cartEl).forEach(b => b.addEventListener("click", closeCart));
  addEventListener("keydown", e => { if (e.key === "Escape" && cartEl.classList.contains("is-open")) closeCart(); });
  // en el menú, "Pedir a domicilio" abre el pedido si ya hay productos
  $$("[data-order]").forEach(a => a.addEventListener("click", e => { if (count()) { e.preventDefault(); openCart(); } }));
  $(".cart__mode").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return; mode = b.dataset.mode;
    $$(".cart__mode button").forEach(x => x.setAttribute("aria-pressed", x === b));
    $$("[data-ship]", cartEl).forEach(x => x.hidden = mode !== "domicilio"); $("#c-a").required = mode === "domicilio";
  });
  $("#cart-form").addEventListener("submit", e => {
    e.preventDefault();
    const f = ["c-n", "c-t", "c-a"].map(id => $("#" + id)).filter(x => x.required && !x.closest("[hidden]"));
    let bad = null; f.forEach(x => { const ok = x.value.trim().length > 1; x.closest(".field").classList.toggle("is-bad", !ok); if (!ok && !bad) bad = x; });
    if (bad) { bad.focus(); return; }
    const v = id => $("#" + id).value.trim();
    const lines = cart.map(l => `• ${l.q} × ${items[l.i].n}${l.opts.length ? " (" + l.opts.join(", ") + ")" : ""}: ${money(lineTotal(l))}`).join("\n");
    const ent = mode === "domicilio" ? `Domicilio a: ${v("c-a")}${v("c-b") ? ", " + v("c-b") : ""}` : "Recojo en el bar (Cra. 58 #82-16)";
    const txt = `Hola Cloud Matcha 💚 Quiero hacer este pedido:\n${lines}\nTotal productos: ${money(sum())}\n${ent}\nNombre: ${v("c-n")} · Cel: ${v("c-t")}${v("c-o") ? "\nNotas: " + v("c-o") : ""}`;
    const m = $("#c-msg");
    m.innerHTML = `<p class="cart__demo"><b>Demo: no se envió nada.</b> En el sitio real este botón abre WhatsApp de Cloud Matcha con el pedido ya escrito:</p><div class="bubble">${esc(txt).replace(/\n/g, "<br>")}</div>`;
    m.hidden = false; m.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  });
  renderCart();

  /* enlace directo a un producto: menu.html#strawberry-matcha-latte */
  const deep = () => {
    const h = decodeURIComponent(location.hash.slice(1)); if (!h) return;
    const el = document.getElementById(h); if (!el) return;
    setTimeout(() => { scrollTo(el, offset()); if (el.classList.contains("item")) setTimeout(() => openSheet(+el.dataset.i), 700); }, 300);
  };
  addEventListener("load", deep); addEventListener("hashchange", deep);
})();
