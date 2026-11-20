/* Site interactions. Content lives in js/data.js. */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  /* ---------- Mobile nav ---------- */
  const toggle = $('.nav-toggle');
  const nav = $('#siteNav');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  $$('a', nav).forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));

  /* ---------- Topbar shadow + active section ---------- */
  const topbar = $('#topbar');
  const onScroll = () => topbar.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const navLinks = $$('.site-nav a[href^="#"]');
  const sectionObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle('current', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => sectionObs.observe(s));

  $('#year').textContent = new Date().getFullYear();

  /* ---------- Reveal on scroll + counters ---------- */
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const countUp = el => {
    const target = +el.dataset.count, suffix = el.dataset.suffix || '';
    if (reduce) { el.textContent = target + suffix; return; }
    const start = performance.now(), dur = 1400;
    const step = t => {
      const p = Math.min(1, (t - start) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('visible');
      $$('[data-count]', e.target).forEach(countUp);
      revealObs.unobserve(e.target);
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach(el => revealObs.observe(el));

  /* ---------- Study-site map ---------- */
  const mapEl = $('#siteMap');
  if (mapEl && window.L && typeof SITES !== 'undefined') {
    const map = L.map(mapEl, { scrollWheelZoom: false, zoomControl: true }).setView([29.9, -90.9], 7);
    const imagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18, attribution: 'Imagery © Esri, Maxar, Earthstar Geographics'
    }).addTo(map);
    const labels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', { maxZoom: 18 }).addTo(map);
    const topo = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18, attribution: 'Tiles © Esri'
    });
    L.control.layers({ 'Satellite': imagery, 'Topographic': topo }, { 'Place labels': labels }, { collapsed: true }).addTo(map);
    L.control.scale({ imperial: false }).addTo(map);

    const list = $('#siteList');
    const markers = SITES.map((s, i) => {
      const icon = L.divIcon({ className: '', html: `<span class="pin pin-${s.kind}">${i + 1}</span>`, iconSize: [28, 28], iconAnchor: [14, 14] });
      const m = L.marker(s.coords, { icon, title: s.name }).addTo(map)
        .bindPopup(`<b>${s.name}</b><br>${s.note}`);
      const li = document.createElement('li');
      li.innerHTML = `<button type="button"><span class="pin pin-${s.kind}">${i + 1}</span><span><b>${s.name}</b><small>${s.note}</small></span></button>`;
      li.querySelector('button').addEventListener('click', () => {
        $$('li', list).forEach(x => x.classList.remove('active'));
        li.classList.add('active');
        map.flyTo(s.coords, 11, { duration: reduce ? 0 : 1.4 });
        m.openPopup();
      });
      m.on('click', () => { $$('li', list).forEach(x => x.classList.remove('active')); li.classList.add('active'); });
      list.appendChild(li);
      return m;
    });
    const reset = document.createElement('li');
    reset.innerHTML = '<button type="button" class="reset">⤢ Show all sites</button>';
    reset.querySelector('button').addEventListener('click', () => {
      $$('li', list).forEach(x => x.classList.remove('active'));
      map.closePopup();
      map.flyToBounds(L.featureGroup(markers).getBounds().pad(0.15), { duration: reduce ? 0 : 1.2 });
    });
    list.appendChild(reset);
    map.fitBounds(L.featureGroup(markers).getBounds().pad(0.15));
  }

  /* ---------- Project filters ---------- */
  $$('[data-pfilter]').forEach(btn => btn.addEventListener('click', () => {
    $$('[data-pfilter]').forEach(b => b.classList.toggle('active', b === btn));
    const f = btn.dataset.pfilter;
    $$('.project').forEach(p => p.classList.toggle('hide', f !== 'all' && !p.dataset.cat.includes(f)));
  }));

  /* ---------- Project image sliders (add more <img class="project-slide"> to enable) ---------- */
  $$('[data-slider]').forEach(slider => {
    const slides = $$('.project-slide', slider);
    const dotsWrap = $('.slider-dots', slider);
    if (slides.length <= 1) { dotsWrap && dotsWrap.remove(); return; }
    let cur = 0, timer;
    const dots = slides.map((_, i) => {
      const d = document.createElement('button');
      d.type = 'button'; d.setAttribute('aria-label', `Show image ${i + 1}`);
      d.addEventListener('click', () => { show(i); restart(); });
      dotsWrap.appendChild(d); return d;
    });
    const show = i => {
      slides[cur].classList.remove('active'); dots[cur].classList.remove('active');
      cur = i;
      slides[cur].classList.add('active'); dots[cur].classList.add('active');
    };
    const restart = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => show((cur + 1) % slides.length), 5000); };
    dots[0].classList.add('active');
    restart();
  });

  /* ---------- Publications ---------- */
  const pubList = $('#pubList');
  const search = $('#pubSearch');
  const countEl = $('#pubCount');
  let pubFilter = 'all';
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const boldMe = s => esc(s).replace(/Awasthi, B\./g, '<b>Awasthi, B.</b>');

  if (pubList && typeof PUBLICATIONS !== 'undefined') {
    // Display order: under review / accepted, published, in preparation, talks; newest first within each group.
    // Entries in js/data.js can be in any order.
    const ORDER = { review: 0, published: 1, prep: 2, talk: 3 };
    const sorted = PUBLICATIONS.map((p, i) => ({ p, i })).sort((a, b) =>
      (ORDER[a.p.type] ?? 9) - (ORDER[b.p.type] ?? 9) || b.p.year - a.p.year || a.i - b.i
    ).map(x => x.p);
    sorted.forEach(p => {
      const card = document.createElement('article');
      card.className = 'pub reveal visible';
      card.dataset.type = p.type;
      card.dataset.text = [p.title, p.authors, p.venue, p.year, p.status, p.keywords].join(' ').toLowerCase();
      card.innerHTML = `
        <div class="pub-meta"><span class="status s-${p.type}">${esc(p.status)}</span><span class="mono year">${p.year}</span></div>
        <h3>${esc(p.title)}</h3>
        <p class="authors">${boldMe(p.authors)}</p>
        <p class="venue">${esc(p.venue)}</p>
        <div class="pub-actions">
          ${p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">Open article ↗</a>` : ''}
          ${p.type !== 'talk' ? '<button type="button" class="copy">Copy citation</button>' : ''}
        </div>`;
      const copy = $('.copy', card);
      if (copy) copy.addEventListener('click', async () => {
        const cite = `${p.authors} (${p.year}). ${p.title}. ${p.venue}.${p.link ? ' ' + p.link : ''}`;
        try { await navigator.clipboard.writeText(cite); copy.textContent = 'Copied ✓'; }
        catch { copy.textContent = 'Copy failed'; }
        setTimeout(() => (copy.textContent = 'Copy citation'), 1500);
      });
      pubList.appendChild(card);
    });

    const apply = () => {
      const q = search.value.toLowerCase().trim();
      let n = 0;
      $$('.pub', pubList).forEach(c => {
        const ok = (pubFilter === 'all' || c.dataset.type === pubFilter) && (!q || q.split(/\s+/).every(w => c.dataset.text.includes(w)));
        c.classList.toggle('hide', !ok);
        if (ok) n++;
      });
      countEl.textContent = `${n} item${n === 1 ? '' : 's'} shown`;
    };
    $$('[data-filter]').forEach(btn => btn.addEventListener('click', () => {
      $$('[data-filter]').forEach(b => b.classList.toggle('active', b === btn));
      pubFilter = btn.dataset.filter;
      apply();
    }));
    search.addEventListener('input', apply);
    apply();

    // "Related papers" links on project cards pre-fill the search
    $$('[data-search]').forEach(a => a.addEventListener('click', () => {
      search.value = a.dataset.search;
      $$('[data-filter]').forEach(b => b.classList.toggle('active', b.dataset.filter === 'all'));
      pubFilter = 'all';
      apply();
    }));
  }

  /* ---------- Lightbox ---------- */
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.innerHTML = '<button type="button" aria-label="Close">×</button><img alt=""><p></p>';
  document.body.appendChild(lb);
  const close = () => lb.classList.remove('open');
  $$('.project-slide').forEach(img => img.addEventListener('click', () => {
    if (!img.classList.contains('active')) return;
    $('img', lb).src = img.currentSrc || img.src;
    $('img', lb).alt = img.alt;
    $('p', lb).textContent = img.alt;
    lb.classList.add('open');
  }));
  $('button', lb).addEventListener('click', close);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();
