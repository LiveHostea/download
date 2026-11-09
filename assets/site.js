// Language toggle (BM / EN), mobile menu, copy buttons, OS tabs, guide TOC highlight.
(() => {
  const root = document.documentElement;
  const read = () => { try { return localStorage.getItem('lh.lang'); } catch { return null; } };
  const save = (v) => { try { localStorage.setItem('lh.lang', v); } catch { /* private mode */ } };

  function setLang(lang) {
    const value = lang === 'en' ? 'en' : 'ms';
    root.dataset.lang = value;
    root.lang = value;
    document.querySelectorAll('[data-set-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setLang === value)));
    const title = document.querySelector(`meta[name="title-${value}"]`);
    if (title) document.title = title.content;
  }

  const fromUrl = new URLSearchParams(location.search).get('lang');
  setLang(fromUrl || read() || 'ms');
  document.querySelectorAll('[data-set-lang]').forEach((b) => b.addEventListener('click', () => {
    setLang(b.dataset.setLang);
    save(b.dataset.setLang);
  }));

  // Point download buttons at the installer for the visitor's computer.
  // Browsers can't tell Apple Silicon from Intel Macs, so Mac defaults to Apple Silicon
  // (every Mac sold since 2020); the Intel link stays next to it.
  const REL = 'https://github.com/LiveHostea/download/releases/latest/download/';
  const ua = navigator.userAgent || '';
  const os = /Mac|iPhone|iPad/.test(navigator.platform || ua) ? 'mac' : /Win/.test(navigator.platform || ua) ? 'win' : 'other';
  if (os === 'mac') {
    document.querySelectorAll('a[data-download]').forEach((a) => { a.href = REL + 'LiveHostea-Mac-arm64.dmg'; });
    document.querySelectorAll('[data-os-name]').forEach((el) => { el.textContent = 'Mac'; });
  } else if (os === 'other') {
    document.querySelectorAll('a[data-download]').forEach((a) => { a.href = 'guide.html#install'; });
    document.querySelectorAll('[data-os-name]').forEach((el) => { el.textContent = 'Windows / Mac'; });
  }

  const menuBtn = document.querySelector('.menu-btn');
  const links = document.querySelector('.nav-links');
  if (menuBtn && links) {
    menuBtn.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => links.classList.remove('open')));
  }

  document.querySelectorAll('pre.cmd').forEach((pre) => {
    const btn = document.createElement('button');
    btn.className = 'copy';
    btn.type = 'button';
    btn.textContent = root.dataset.lang === 'en' ? 'Copy' : 'Salin';
    btn.addEventListener('click', async () => {
      const text = pre.querySelector('code')?.textContent ?? '';
      try {
        await navigator.clipboard.writeText(text.trim());
        btn.textContent = '✓';
      } catch {
        btn.textContent = '✗';
      }
      setTimeout(() => { btn.textContent = root.dataset.lang === 'en' ? 'Copy' : 'Salin'; }, 1500);
    });
    pre.appendChild(btn);
  });

  // OS tabs: <div class="os-tabs" data-group="x"><button data-os="win">…  and  <div class="os-panel" data-group="x" data-os="win">
  document.querySelectorAll('.os-tabs').forEach((tabs) => {
    const group = tabs.dataset.group;
    const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    function select(os) {
      tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.os === os)));
      document.querySelectorAll(`.os-panel[data-group="${group}"]`).forEach((p) => { p.hidden = p.dataset.os !== os; });
    }
    tabs.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => select(b.dataset.os)));
    select(isMac ? 'mac' : 'win');
  });

  // Highlight the guide section in view.
  const tocLinks = [...document.querySelectorAll('.toc a[href^="#"]')];
  if (tocLinks.length && 'IntersectionObserver' in window) {
    const byId = new Map(tocLinks.map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        tocLinks.forEach((a) => a.classList.remove('active'));
        byId.get(e.target.id)?.classList.add('active');
      });
    }, { rootMargin: '-90px 0px -70% 0px' });
    byId.forEach((_, id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  }
})();
