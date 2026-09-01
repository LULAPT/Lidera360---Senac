// Header retrátil: vira um botão circular com a logo mini ao rolar a página
// + scroll suave e destaque do link ativo no menu.
// Estrutura: header.nav > .wrap.nav-inner > .logo, nav.nav-links, .nav-actions
//
// v2 — reescrito para eliminar o "flash" branco de 1 frame que aparecia na
// transição de nav grande -> bolinha.
//
// POR QUE O FLASH ACONTECIA:
// A versão anterior fazia um toggle de classe CSS (.header-minimized) e
// deixava a `transition` do CSS animar width/height/border-radius/box-shadow/
// overflow. Essa combinação (border-radius + overflow:hidden + box-shadow
// transicionando juntos) é um bug conhecido de composição no Chrome/Edge/
// Safari — o navegador troca de camada de renderização no meio da animação
// e pisca um frame sem cor. Separar overflow de box-shadow em elementos
// diferentes não resolve, porque o motor do navegador ainda vê as duas
// mudanças de forma acontecendo na mesma janela de tempo da mesma `transition`.
//
// A CORREÇÃO: tirar o CSS `transition` de cena para as propriedades de forma.
// Em vez disso, a cada frame de scroll a gente já calcula o valor FINAL de
// width/height/border-radius/posição (interpolado suavemente via lerp no
// próprio JS) e aplica direto via inline style. Não existe transição do
// navegador rodando por baixo, então não existe essa troca de camada no meio
// do caminho — e não existe o flash. É a mesma ideia do header retrátil do
// projeto antigo (JS calculando o estilo por scroll), só que com suavização
// por rAF em vez de pular direto pro valor do scroll bruto.
document.addEventListener('DOMContentLoaded', function () {
  const header     = document.querySelector('header.nav');
  const wrap       = header?.querySelector('.wrap.nav-inner');
  const logo       = header?.querySelector('.logo');
  const navLinks   = header?.querySelector('.nav-links');
  const navActions = header?.querySelector('.nav-actions');
  if (!header || !wrap) return;

  const TRIGGER_HEIGHT = 80;   // px de scroll pra começar a encolher
  const MIN_SIZE       = 60;   // tamanho final da bolinha (px)
  const MIN_TOP        = 14;   // posição final do topo (px)
  const MIN_LEFT       = 20;   // posição final da esquerda (px)

  /* ── injeta só o CSS estrutural que NÃO participa da animação de forma
     (nada de transition em width/height/border-radius/overflow/box-shadow
     aqui — isso tudo é setado via JS a cada frame, ver abaixo) ── */
  const style = document.createElement('style');
  style.textContent = `
    header.nav {
      box-sizing: border-box;
    }
    header.nav .wrap.nav-inner {
      position: relative; /* ancora o centralizador absolute das mini-logos */
    }
    header.nav .mini-logo {
      width: 29px; height: 40px; object-fit: contain;
      opacity: 0; visibility: hidden; position: absolute;
      top: 50%; left: 50%; transform: translate(-50%, -50%);
      pointer-events: none;
      transition: opacity .2s ease;
    }
    header.nav .mini-logo.is-visible { opacity: 1; visibility: visible; pointer-events: auto; }

    header.nav.header-minimized { cursor: pointer; }
    header.nav.header-minimized .logo,
    header.nav.header-minimized .nav-links,
    header.nav.header-minimized .nav-actions {
      opacity: 0; visibility: hidden; pointer-events: none;
    }

    /* ── visual unificado com a bolinha do theme-toggle (themeSwitch.js) ──
       mesmas cores/sombra/hover, pra ficar tudo consistente entre as duas
       bolinhas flutuantes do site. Só aplica quando o círculo já está
       100% parado (.header-minimized), então não interfere na animação
       de forma que roda via JS acima. */
    header.nav.header-minimized {
      background-color: rgba(255, 255, 255, 0.94) !important;
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.75);
      transition: box-shadow .3s ease, border-color .3s ease, transform .3s ease;
    }

    /* hover só existe no estado 100% minimizado (círculo parado) —
       aqui SIM pode ter transition, porque não mexe em border-radius
       nem overflow, só em transform/box-shadow/border, então não sofre
       do bug de composição. */
    header.nav.header-minimized:hover {
      transform: scale(1.1) !important;
      box-shadow: 0 0 20px rgba(14, 14, 14, 0.87);
      border: 1px solid rgba(253, 253, 253, 0.63);
    }

    html.theme-dark header.nav.header-minimized {
    background-color: #1a1a366c !important;
      box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
    }
    html.theme-dark header.nav.header-minimized:hover {
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
      border: 1px solid rgba(100, 100, 100, 0.63);
    }

    /* tema auto segue o sistema, igual o theme-toggle já faz */
    @media (prefers-color-scheme: dark) {
      html.theme-auto header.nav.header-minimized {
        background-color: rgba(30, 30, 30, 0.94) !important;
        box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
      }
      html.theme-auto header.nav.header-minimized:hover {
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
        border: 1px solid rgba(100, 100, 100, 0.63);
      }
    }

    .nav-links a.active { color: var(--ink, var(--navy)); }
  `;
  document.head.appendChild(style);

  /* ── logo mini da bolinha ──
     regra fixa, independente da logo grande (.logo-mark) do nav original:
     tema claro sempre usa apenaslogolidera.png, tema escuro sempre usa
     liderabranca.png. As duas são <img>, mesma classe .mini-logo, e só
     uma fica com .is-visible por vez (ver isDarkTheme() + applyFrame). */
  const miniLogo = document.createElement('img');
  miniLogo.src = '/src/img/apenaslogolidera.png';
  miniLogo.alt = 'Lidera360';
  miniLogo.className = 'mini-logo';
  wrap.appendChild(miniLogo);

  const miniLogoDark = document.createElement('img');
  miniLogoDark.src = '/src/img/liderabranca.png';
  miniLogoDark.alt = 'Lidera360';
  miniLogoDark.className = 'mini-logo';
  wrap.appendChild(miniLogoDark);

  function isDarkTheme() {
    if (document.documentElement.classList.contains('theme-dark')) return true;
    if (document.documentElement.classList.contains('theme-auto')) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }

  /* ── mede as dimensões originais do header pra interpolar a partir delas ── */
  let originalWidth = header.offsetWidth;
  let originalHeight = header.offsetHeight || 64;
  // padding horizontal original do .wrap (2.5rem no desktop, 1.25rem em
  // telas <=768px via media query) — medido de verdade em vez de chumbado,
  // pra poder interpolar até 0 junto com o resto da forma (ver bug do
  // padding "saltando" pra 0 de uma vez, corrigido em applyFrame abaixo).
  let originalPadLeft = parseFloat(getComputedStyle(wrap).paddingLeft) || 0;
  let originalPadRight = parseFloat(getComputedStyle(wrap).paddingRight) || 0;
  function measureOriginal() {
    // só remede quando o header está no estado "grande" (ratio 0),
    // senão a gente mediria o próprio círculo pequeno por engano
    if (currentRatio < 0.01) {
      originalWidth = header.offsetWidth;
      originalHeight = header.offsetHeight || 64;
      originalPadLeft = parseFloat(getComputedStyle(wrap).paddingLeft) || 0;
      originalPadRight = parseFloat(getComputedStyle(wrap).paddingRight) || 0;
    }
  }
  window.addEventListener('load', measureOriginal);
  window.addEventListener('resize', measureOriginal, { passive: true });

  const lerp = (a, b, t) => a + (b - a) * t;

  /* detecção de mobile: tela pequena OU touch — mesmo critério da versão
     antiga, usado só pra deixar a animação um pouco mais curta (.22s em vez
     de .35s), igual ela já fazia. */
  const mq = window.matchMedia('(max-width: 768px), (pointer: coarse)');
  let isMobile = mq.matches;
  if (mq.addEventListener) mq.addEventListener('change', e => { isMobile = e.matches; });
  else if (mq.addListener) mq.addListener(e => { isMobile = e.matches; });

  let targetState  = false; // false = grande, true = bolinha — troca no threshold (igual a antiga)
  let currentRatio = 0;     // 0 = grande, 1 = bolinha — valor animado por easing, não segue o scroll pixel a pixel
  let minimized    = false;

  function applyFrame(ratio) {
    const r = ratio;

    if (r <= 0.001) {
      // estado de repouso "grande": limpa todo inline style e deixa o
      // CSS normal do site cuidar de tudo (nenhuma propriedade de forma
      // fica "presa" em valor inline, o que também evita qualquer
      // resquício de bug de composição quando está parado no topo).
      header.style.width = '';
      header.style.height = '';
      header.style.left = '';
      header.style.right = '';
      header.style.top = '';
      header.style.borderRadius = '';
      header.style.boxShadow = '';
      header.style.backgroundColor = '';
      header.style.backdropFilter = '';
      header.style.webkitBackdropFilter = '';
      header.style.transform = '';
      wrap.style.overflow = '';
      wrap.style.borderRadius = '';
      wrap.style.width = '';
      wrap.style.height = '';
      wrap.style.paddingLeft = '';
      wrap.style.paddingRight = '';
      header.classList.remove('header-minimized');
      miniLogo.classList.remove('is-visible');
      miniLogoDark.classList.remove('is-visible');
      if (logo) logo.style.opacity = '';
      if (navLinks) navLinks.style.opacity = '';
      if (navActions) navActions.style.opacity = '';
      minimized = false;
      return;
    }

    const w = lerp(originalWidth, MIN_SIZE, r);
    const h = lerp(originalHeight, MIN_SIZE, r);
    const left = lerp(0, MIN_LEFT, r);
    const top = lerp(0, MIN_TOP, r);
    const radius = lerp(0, MIN_SIZE / 2, r); // no final = 50% de 60px = círculo perfeito

    header.style.right = 'auto';
    header.style.width = `${w}px`;
    header.style.height = `${h}px`;
    header.style.left = `${left}px`;
    header.style.top = `${top}px`;
    header.style.borderRadius = `${radius}px`;

    // a partir de 85% do encolhimento já antecipamos a sombra no mesmo tom
    // usado pela bolinha do theme-toggle (claro/escuro), pra quando a classe
    // .header-minimized assumir em 99.5% não haver salto de cor — sem cor
    // extra além dessa sombra, o fundo continua vindo do CSS até ali.
    const dark = isDarkTheme();
    header.style.boxShadow = r >= 0.85
      ? (dark ? '0 0 15px rgba(255,255,255,.2)' : '0 0 15px rgba(0,0,0,.75)')
      : '';

    wrap.style.overflow = 'hidden';
    wrap.style.borderRadius = `${radius}px`;
    wrap.style.width = '100%';
    wrap.style.height = '100%';
    // padding interpolado junto com o resto da forma (era `padding: 0` fixo
    // desde o primeiro frame — por isso os itens do nav "passavam do ponto":
    // ficavam espremidos pro padding 0 enquanto ainda estavam quase 100%
    // opacos, e só voltavam pro lugar certo quando o padding saltava de
    // volta pro valor real no instante em que r chegava a 0).
    wrap.style.paddingLeft = `${lerp(originalPadLeft, 0, r)}px`;
    wrap.style.paddingRight = `${lerp(originalPadRight, 0, r)}px`;

    if (logo) logo.style.opacity = `${1 - r}`;
    if (navLinks) navLinks.style.opacity = `${1 - r}`;
    if (navActions) navActions.style.opacity = `${1 - r}`;

    // ── regra da bolinha: tema CLARO sempre mostra apenaslogolidera.png;
    // tema ESCURO sempre mostra liderabranca.png. Regra fixa e independente
    // da logo grande (.logo-mark) do nav original. isDarkTheme() já resolve
    // o caso "auto" olhando a preferência do sistema — única fonte de
    // verdade, então nunca as duas ficam visíveis ao mesmo tempo.
    const showMini = r > 0.55;
    miniLogo.classList.toggle('is-visible', showMini && !dark);
    miniLogoDark.classList.toggle('is-visible', showMini && dark);

    minimized = r >= 0.995;
    header.classList.toggle('header-minimized', minimized);
  }

  /* ── animação com easing de duração fixa: a "fluidez" da versão antiga ──
     a v2 anterior fazia currentRatio perseguir scrollY/TRIGGER_HEIGHT pixel
     a pixel a cada frame (lerp contínuo, fator .22) — funcional e sem flash,
     mas sem a curva de desaceleração suave que a CSS `transition:
     cubic-bezier(.4,0,.2,1)` da versão antiga dava, e "grudada" no scroll
     em vez de ter uma animação de morph independente.
     Aqui reproduzimos a sensação da antiga: ao cruzar o threshold de scroll
     (exatamente como o setMinimized(scrollY > TRIGGER_HEIGHT) dela), anima
     do estado atual até o estado alvo (0 ou 1) numa duração fixa — .35s no
     desktop, .22s no mobile, os MESMOS valores da antiga — usando uma curva
     de easing calculada em JS (easeOutCubic, equivalente visualmente ao
     cubic-bezier(.4,0,.2,1) dela). Continua tudo aplicado via inline style
     a cada frame, nunca uma `transition` real do CSS — então o bug de flash
     de composição (motivo da reescrita pra v2) continua resolvido. */
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  let rafId = null;
  let animFrom = 0;
  let animTo = 0;
  let animStart = null;

  function stepAnimation(ts) {
    if (animStart === null) animStart = ts;
    const duration = isMobile ? 220 : 350; // ms — iguais à versão antiga (.22s / .35s)
    const t = Math.min((ts - animStart) / duration, 1);
    currentRatio = animFrom + (animTo - animFrom) * easeOutCubic(t);
    applyFrame(currentRatio);
    if (t < 1) {
      rafId = requestAnimationFrame(stepAnimation);
    } else {
      currentRatio = animTo;
      applyFrame(currentRatio);
      rafId = null;
    }
  }

  function animateTo(toRatio) {
    if (rafId !== null && animTo === toRatio) return; // já indo pra lá, não reinicia
    animFrom = currentRatio;
    animTo = toRatio;
    animStart = null;
    if (rafId === null) rafId = requestAnimationFrame(stepAnimation);
  }

  function setMinimizedTarget(state) {
    if (state === targetState) return; // só anima quando o estado realmente muda, igual a antiga
    targetState = state;
    animateTo(state ? 1 : 0);
  }

  /* ── reagir a troca de tema mesmo sem scroll ──
     applyFrame() só era chamado por eventos de scroll/resize/load, então
     isDarkTheme() ficava "congelado" no valor da última rolagem: trocar o
     tema parado (sem rolar) não atualizava qual logo (.mini-logo) devia
     ficar visível, só corrigindo quando o usuário rolava de novo. O
     MutationObserver abaixo escuta mudanças na classe do <html> — que é
     exatamente onde themeSwitch.js grava theme-light/theme-dark/theme-auto —
     e reaplica o frame atual (currentRatio, sem mexer no scroll) na hora. */
  const themeObserver = new MutationObserver(() => applyFrame(currentRatio));
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });

  // cobre também o tema "auto" mudando de aparência quando o SO troca de
  // claro/escuro sem que a classe do <html> mude (theme-auto continua igual)
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      applyFrame(currentRatio);
    });
  }

  /* clicar no header minimizado volta ao topo */
  header.addEventListener('click', function () {
    if (minimized) smoothTo(0);
  });

  /* ── scroll suave + link ativo no menu ── */
  const links = navLinks ? Array.from(navLinks.querySelectorAll('a')) : [];

  let sectionOffsets = [];
  function cacheSectionOffsets() {
    sectionOffsets = links.map(link => {
      const href = link.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return null;
      const section = document.querySelector(href);
      return section ? { link, offsetTop: section.offsetTop } : null;
    }).filter(Boolean);
  }
  /* rolagem pelo animador do index (window.lideraScrollTo), pra âncora e
     roda andarem na mesma velocidade — o par de tokens --scroll-step /
     --scroll-ease no CSS governa as duas. Resolvido na hora do clique, e
     não na carga, então não depende da ordem em que os scripts entram.
     O fallback cobre quem pediu menos movimento: lá o animador nem sobe,
     e o smooth nativo é o comportamento certo. */
  function smoothTo(y) {
    if (typeof window.lideraScrollTo === 'function') window.lideraScrollTo(y);
    else window.scrollTo({ top: y, behavior: 'smooth' });
  }

  cacheSectionOffsets();

  if (navLinks) {
    links.forEach(link => {
      link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#' || href.length < 2) return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        // a mesma conta dos outros caminhos (índex, fim do body). O 84px
        // fixo que ficava aqui era um terceiro offset, que nem batia com
        // os 80px do menu — e não sabia do data-scroll-align.
        const y = (typeof window.lideraAnchorY === 'function')
          ? window.lideraAnchorY(target)
          : target.getBoundingClientRect().top + window.pageYOffset - 84;
        smoothTo(y);
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

  /* ── um único listener de scroll pra tudo ── */
  let ticking = false;
  function onScrollFrame() {
    setMinimizedTarget(window.scrollY > TRIGGER_HEIGHT);
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
  onScrollFrame(); // calcula o estado inicial (ex: refresh com scroll já rolado)

  // no carregamento a gente não quer ver a animação de morph rodando —
  // só a partir daqui pra frente. Cancela a animação que o onScrollFrame
  // inicial possa ter disparado e aplica o estado final na hora, igual a
  // versão antiga fazia (classe já nasce certa, sem a transition rodar
  // durante o load da página).
  if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
  currentRatio = targetState ? 1 : 0;
  applyFrame(currentRatio);

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(cacheSectionOffsets, 200);
  }, { passive: true });
});