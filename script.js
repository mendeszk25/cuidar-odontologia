(() => {
  const clinic = window.CLINIC || {};
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => [...ctx.querySelectorAll(sel)];

  $$("[data-clinic]").forEach(el => {
    const key = el.dataset.clinic;
    if (clinic[key]) el.textContent = clinic[key];
  });

  const waUrl = (message='Olá! Vim pelo site da Cuidar.') =>
    `https://wa.me/${clinic.whatsapp || ''}?text=${encodeURIComponent(message)}`;

  $$(".js-whatsapp").forEach(a => {
    a.href = waUrl(a.dataset.message);
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  });

  $$(".js-instagram").forEach(a => a.href = clinic.instagram || "#");

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.mapsQuery || clinic.address || '')}`;
  const mapLink = $("#map-link");
  const footerMap = $("#footer-map");
  const contactMap = $("#contact-map");
  if (mapLink) mapLink.href = mapsUrl;
  if (footerMap) footerMap.href = mapsUrl;
  if (contactMap && (clinic.mapsQuery || clinic.address)) {
    contactMap.src = `https://www.google.com/maps?q=${encodeURIComponent(clinic.mapsQuery || clinic.address)}&output=embed`;
  }

  const schema = {
    "@context":"https://schema.org",
    "@type":"Dentist",
    "name":clinic.name,
    "address":{
      "@type":"PostalAddress",
      "streetAddress":clinic.streetAddress,
      "addressLocality":clinic.addressLocality,
      "addressRegion":clinic.addressRegion,
      "addressCountry":clinic.addressCountry
    },
    "telephone":clinic.phoneLabel,
    "sameAs":[clinic.instagram].filter(Boolean)
  };
  const schemaEl = $("#schema-json");
  if (schemaEl) schemaEl.textContent = JSON.stringify(schema);

  const header = $(".site-header");
  const float = $(".whatsapp-float");
  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle("scrolled", y > 30);
    float?.classList.toggle("show", y > 500);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, {passive:true});

  const toggle = $(".menu-toggle");
  const mobile = $("#mobile-menu");
  if (toggle && mobile) {
    let previouslyFocused = null;

    const closeMobileMenu = (restoreFocus = false) => {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menu");
      toggle.classList.remove("open");
      mobile.hidden = true;
      document.body.style.overflow = "";
      if (restoreFocus) (previouslyFocused || toggle).focus();
    };

    const openMobileMenu = () => {
      previouslyFocused = document.activeElement;
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Fechar menu");
      toggle.classList.add("open");
      mobile.hidden = false;
      document.body.style.overflow = "hidden";
      $("a", mobile)?.focus();
    };

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      isOpen ? closeMobileMenu() : openMobileMenu();
    });

    $$("a", mobile).forEach(a => a.addEventListener("click", () => closeMobileMenu()));

    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        e.preventDefault();
        closeMobileMenu(true);
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 1080 && toggle.getAttribute("aria-expanded") === "true") {
        closeMobileMenu();
      }
    }, {passive:true});
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, {threshold:.12, rootMargin:"0px 0px -30px"});
  $$(".reveal").forEach(el => io.observe(el));

  const sections = $$("main section[id]");
  const navLinks = $$(".desktop-nav a");
  const navIo = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`));
    });
  }, {rootMargin:"-35% 0px -55% 0px", threshold:0});
  sections.forEach(s => navIo.observe(s));


  const form = $("#contact-form");
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const phone = String(data.get("phone") || "").trim();
      const treatment = String(data.get("treatment") || "").trim();
      const message = String(data.get("message") || "").trim();
      const phoneDigits = phone.replace(/\D/g, "");
      const localPhoneDigits = phoneDigits.startsWith("55") && [12, 13].includes(phoneDigits.length)
        ? phoneDigits.slice(2)
        : phoneDigits;
      const hasOnlyPhoneCharacters = /^[+\d\s().-]+$/.test(phone);

      if (!hasOnlyPhoneCharacters || ![10, 11].includes(localPhoneDigits.length)) {
        const phoneInput = $("input[name='phone']", form);
        phoneInput?.setCustomValidity("Informe um número de WhatsApp válido com DDD.");
        phoneInput?.reportValidity();
        phoneInput?.addEventListener("input", () => phoneInput.setCustomValidity(""), {once:true});
        return;
      }

      const msg = [
        "Olá! Vim pelo site da Cuidar e gostaria de solicitar contato.",
        "",
        `Nome: ${name}`,
        `Meu WhatsApp: ${phone}`,
        `Interesse: ${treatment}`,
        message ? `Mensagem: ${message}` : ""
      ].filter(Boolean).join("\n");
      window.open(waUrl(msg), "_blank", "noopener,noreferrer");
    });
  }

  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();
})();