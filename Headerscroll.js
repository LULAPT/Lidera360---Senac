// Header retrátil: vira um botão circular com a logo mini ao rolar a página
// + scroll suave e destaque do link ativo no menu.
// Adaptado de headeranim.js + headerbuttonsAnim.js para a estrutura do Lidera360
// (header.nav > .wrap.nav-inner > .logo, nav.nav-links, .nav-actions > .hamburger)
//
// Otimizações de performance (sem mudar a animação visual):
// - os dois listeners de scroll viraram um só, com um único
//   requestAnimationFrame por frame (antes eram dois agendados separados);
// - a posição das seções (offsetTop) é calculada uma vez e cacheada, em vez
//   de ser relida do DOM a cada pixel rolado (isso é a causa mais comum de
//   "layout thrashing" / lag em listeners de scroll);
// - em telas pequenas/touch a duração da transição do header fica um pouco
//   mais curta (menos frames pra renderizar no total), sem trocar quais
//   propriedades animam — a animação continua a mesma, só um pouco mais
//   rápida de terminar.
document.addEventListener('DOMContentLoaded', function () {
  const header   = document.querySelector('header.nav');
  const logo     = header?.querySelector('.logo');
  const navLinks = header?.querySelector('.nav-links');
  if (!header) return;

  const TRIGGER_HEIGHT = 80; // px de scroll para começar a encolher

  /* ── detecção de mobile: tela pequena OU dispositivo touch ── */
  const mq = window.matchMedia('(max-width: 768px), (pointer: coarse)');
  let isMobile = mq.matches;
  const applyMobileClass = () => header.classList.toggle('is-mobile-anim', isMobile);
  applyMobileClass();
  if (mq.addEventListener) {
    mq.addEventListener('change', e => { isMobile = e.matches; applyMobileClass(); });
  } else if (mq.addListener) {
    mq.addListener(e => { isMobile = e.matches; applyMobileClass(); });
  }

  /* ── injeta o CSS necessário (mesmo padrão do themeSwitch.js) ── */
  const style = document.createElement('style');
  style.textContent = `
    header.nav {
      width: 100%;
      height: 4rem;
      transition: width .35s cubic-bezier(.4,0,.2,1),
                  height .35s cubic-bezier(.4,0,.2,1),
                  left .35s cubic-bezier(.4,0,.2,1),
                  right .35s cubic-bezier(.4,0,.2,1),
                  border-radius .35s ease,
                  box-shadow .35s ease,
                  background-color .3s ease,
                  transform .3s ease,
                  border .3s ease;
    }
    header.nav .mini-logo {
      width: 34px; height: 34px; object-fit: contain;
      opacity: 0; visibility: hidden; position: absolute;
      pointer-events: none;
      transition: opacity .25s ease;
    }
    header.nav .mini-logo-svg {
      width: 22px; height: 22px;
      opacity: 0; visibility: hidden; position: absolute;
      pointer-events: none;
      transition: opacity .25s ease;
    }
    header.nav.header-minimized {
      width: 60px; height: 60px;
      left: 20px; right: auto; top: 14px;
      border-radius: 50%;
      overflow: hidden;
      cursor: pointer;
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.75);
      border: 1px solid transparent;
    }
    header.nav.header-minimized .wrap { padding: 0; max-width: none; }
    header.nav.header-minimized .nav-inner { height: 100%; justify-content: center; }
    header.nav.header-minimized .logo,
    header.nav.header-minimized .nav-links,
    header.nav.header-minimized .nav-actions {
      opacity: 0; visibility: hidden; position: absolute; pointer-events: none;
    }
    header.nav.header-minimized .mini-logo {
      opacity: 1; visibility: visible; position: relative; pointer-events: auto;
    }
    header.nav.header-minimized .mini-logo-svg {
      opacity: 0; visibility: hidden; position: absolute; pointer-events: none;
    }

    /* tema escuro: mostra o SVG (triângulo colorido) em vez do PNG */
    html.theme-dark header.nav.header-minimized .mini-logo {
      opacity: 0; visibility: hidden; position: absolute; pointer-events: none;
    }
    html.theme-dark header.nav.header-minimized .mini-logo-svg {
      opacity: 1; visibility: visible; position: relative; pointer-events: auto;
    }
    @media (prefers-color-scheme: dark) {
      html.theme-auto header.nav.header-minimized .mini-logo {
        opacity: 0; visibility: hidden; position: absolute; pointer-events: none;
      }
      html.theme-auto header.nav.header-minimized .mini-logo-svg {
        opacity: 1; visibility: visible; position: relative; pointer-events: auto;
      }
    }

    /* ── hover: mesma animação do botão de theme switch ── */
    header.nav.header-minimized:hover {
      transform: scale(1.1);
      box-shadow: 0 0 20px rgba(14, 14, 14, 0.87);
      border: 1px solid rgba(253, 253, 253, 0.63);
    }

    /* dark theme: mesmo comportamento do theme-toggle em dark */
    html.theme-dark header.nav.header-minimized {
      box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
    }
    html.theme-dark header.nav.header-minimized:hover {
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
      border: 1px solid rgba(100, 100, 100, 0.63);
    }
    @media (prefers-color-scheme: dark) {
      html.theme-auto header.nav.header-minimized {
        box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
      }
      html.theme-auto header.nav.header-minimized:hover {
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
        border: 1px solid rgba(100, 100, 100, 0.63);
      }
    }

    .nav-links a.active { color: var(--ink, var(--navy)); }

    /* ── mobile/touch: mesma animação, só um pouco mais rápida ──
       mesmas propriedades, mesmo efeito visual — só termina antes,
       o que reduz a quantidade total de frames renderizados durante
       o scroll (o maior ganho de performance real está no JS acima,
       isso aqui é só um ajuste fino). */
    header.nav.is-mobile-anim {
      transition-duration: .22s, .22s, .22s, .22s, .22s, .22s, .2s, .2s;
    }
  `;
  document.head.appendChild(style);

  /* ── logo mini (troque o src pela sua imagem menor) ──
     Coloque o arquivo na mesma pasta do HTML (ou ajuste o caminho abaixo). */
  const miniLogo = document.createElement('img');
  miniLogo.src = '/src/img/apenaslogolidera.png';
  miniLogo.alt = 'Lidera360';
  miniLogo.className = 'mini-logo';
  header.querySelector('.wrap.nav-inner')?.appendChild(miniLogo);

  /* ── logo mini em SVG (usada no tema escuro) ── */
  const miniLogoSvg = document.createElement('div');
  miniLogoSvg.className = 'mini-logo-svg';
  miniLogoSvg.innerHTML = `
    <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
      <polygon points="24,4 44,40 4,40" fill="#0f1272"></polygon>
      <polygon points="14,40 24,22 34,40" fill="#090b52" opacity=".7"></polygon>
      <polyline points="8,36 20,20 30,28 42,10" stroke="#2fd55a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"></polyline>
      <circle cx="42" cy="10" r="3" fill="#2fd55a"></circle>
    </svg>
  `;
  header.querySelector('.wrap.nav-inner')?.appendChild(miniLogoSvg);

  /* ── minimizar / expandir ao rolar ── */
  let minimized = false;
  function setMinimized(state) {
    if (state === minimized) return;
    minimized = state;
    header.classList.toggle('header-minimized', state);
  }

  /* clicar no header minimizado volta ao topo */
  header.addEventListener('click', function () {
    if (minimized) window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── scroll suave + link ativo no menu ── */
  const links = navLinks ? Array.from(navLinks.querySelectorAll('a')) : [];

  /* cacheia a posição das seções em vez de ler offsetTop a cada scroll */
  let sectionOffsets = [];
  function cacheSectionOffsets() {
    sectionOffsets = links.map(link => {
      const href = link.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return null;
      const section = document.querySelector(href);
      return section ? { link, offsetTop: section.offsetTop } : null;
    }).filter(Boolean);
  }
  cacheSectionOffsets();

  if (navLinks) {
    links.forEach(link => {
      link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#' || href.length < 2) return; // sem destino ainda
        const target = document.querySelector(href);
        if (!target) return; // seção ainda não existe/está oculta
        e.preventDefault();
        const y = target.getBoundingClientRect().top + window.pageYOffset - 84; // compensa o header fixo
        window.scrollTo({ top: y, behavior: 'smooth' });
      });
    });
  }

  function highlightActiveLink() {
    if (!sectionOffsets.length) return;
    const scrollPos = window.scrollY + 200;
    let current = null;
    for (const entry of sectionOffsets) {
      if (entry.offsetTop <= scrollPos) current = entry.link;
    }
    links.forEach(l => l.classList.remove('active'));
    if (current) current.classList.add('active');
    else if (window.scrollY < 200 && links[0]) links[0].classList.add('active');
  }

  /* ── um único rAF por frame pra tudo que depende de scroll ── */
  let ticking = false;
  function onScrollFrame() {
    setMinimized(window.scrollY > TRIGGER_HEIGHT);
    highlightActiveLink();
    ticking = false;
  }
  function requestScrollUpdate() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScrollFrame);
    }
  }
  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  onScrollFrame(); // ajuste inicial (ex: refresh com scroll já rolado)

  /* recacheia as posições das seções se a página mudar de tamanho
     (rotação de tela, teclado abrindo/fechando, etc.) */
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(cacheSectionOffsets, 200);
  }, { passive: true });
});