# Lidera360 — guia do repositório

Site estático da plataforma Lidera360 (projeto SENAC). **Sem build, sem framework,
sem dependências**: HTML + CSS + JS vanilla. Abre direto no navegador — não há
`npm install`, comando de build ou servidor de dev.

Única dependência externa: a fonte Poppins, via Google Fonts.

## Arquivos

| Arquivo | Papel |
|---|---|
| `index.html` | Landing pública — hero, trilhas, features, sobre nós, comparativo, planos, CTA, footer |
| `lidera360.html` | **Cópia do `index.html`** no estado "usuário logado" (~31 linhas de diff) |
| `dash.html` | Dashboard do aluno — trilhas com progresso + modal de conteúdo do módulo |
| `perfil.html` | Perfil estilo rede social — capa, badges, skills, experiência, feed |
| `themeSwitch.js` | Bolinha flutuante claro/escuro. Injeta o próprio CSS, salva em `localStorage` |
| `Headerscroll.js` | **Só no `index`/`lidera360`** — header que vira bolinha ao rolar, + scroll suave e link ativo |
| `introLoader.js` | **Só no `index`/`lidera360`** — tela de intro (contador até 360 + DarkVeil em WebGL), uma vez por sessão |
| `src/img/` | Logos, avatar e o vídeo institucional (`sobre-nos.mp4`) |

Navegação: `index` → login (fake) → `lidera360.html` → menu lateral → `dash.html`
⇄ `perfil.html` → volta ao `index`.

O login não tem back-end: o botão roda spinner → check e redireciona para
`PAGINA_LOGADA` (`lidera360.html`). Os botões Google/LinkedIn vão direto pro mesmo lugar.

## Convenções

**Comentários.** O código é densamente comentado, e os comentários explicam *por quê*,
não *o quê* — geralmente registrando um bug que motivou a solução atual. Ao editar,
mantenha esse padrão e leia o comentário antes de "simplificar" algo que parece
estranho: quase sempre a forma estranha é a correção de um problema real.

**Temas.** Tokens em `:root`, sobrescritos em `html.theme-dark`, e espelhados em
`@media (prefers-color-scheme: dark) { html.theme-auto { ... } }`. Toda cor nova
precisa das **três** declarações, senão o modo "auto" fica quebrado.

Paleta: `--navy #0f1272`, `--navyd #090b52`, `--green #2fd55a`, `--orange #f97316`.
No claro, `--bg`/`--white` são cremes (`#f2ebdc` / `#fbf7ed`) — branco puro foi
descartado de propósito. No escuro viram `#12132b` / `#1b1c3a`.

**Acessibilidade / movimento.** `prefers-reduced-motion: reduce` é respeitado em
praticamente toda animação — ao adicionar uma nova, adicione também o guard.
Foco por teclado usa `:focus-visible` com contorno verde.

**Estilo de JS.** Sem `Promise`, sem `async/await`, sem libs: `setTimeout` recursivo,
`requestAnimationFrame` e `IntersectionObserver`/`MutationObserver`. IIFEs prefixadas
com `;(function () { ... })()`. Sem ponto e vírgula no fim das linhas.

## Padrões repetidos entre as páginas

- **`.circle`** — bolinhas decorativas de fundo. A deriva é CSS (`circleDriftA/B/C`,
  durações que não fecham ciclo juntas); o parallax de scroll é JS e escreve a
  propriedade `translate`, **não** `transform`, para compor com a animação em vez
  de sobrescrevê-la.
- **Tilt 3D nos cards** — `perspective` + `rotateX/Y` seguindo o mouse, escrito
  inline pelo JS, mais um glow verde alimentado por `--mx`/`--my`. No `index` é a
  função reutilizável `initTiltHover(grid, seletor)`; em `dash`/`perfil` é o mesmo
  mecanismo por delegação de evento. Só em `(hover:hover) and (pointer:fine)`.
- **Masonry por JS** — os `.trilha-card` são `position:absolute` com `top`/`left`
  calculados na "coluna mais curta". CSS Grid puro esticava a linha inteira quando
  um card abria, deixando buraco ao lado. Recalculado por `ResizeObserver` durante
  a animação de abertura.
- **Expansão de altura** — `grid-template-rows: 0fr → 1fr` no wrapper, em vez de
  `max-height` chutado.
- **Scroll reveal** — `[data-reveal]` + `IntersectionObserver`; `data-reveal-group`
  escalona irmãos (90ms cada) via `transition-delay` inline. Variantes:
  `left`, `right`, `scale`, `fade`. **800ms é a duração da transition** e aparece
  como constante em vários timers encadeados (typewriter, marca-texto, pulse do
  vídeo, autoplay).
- **Marca-texto** — a `::selection` nativa está desativada (`transparent`); um script
  pinta um traço verde por cima da seleção real. Existe também o `mark.ink`
  permanente, cujo traço só entra depois que o bloco terminou de surgir.
- **Menu lateral** — mesmo mecanismo (`openMenu`/`closeMenu`, backdrop, `overflow:hidden`
  no body) nas quatro páginas; só o conteúdo muda. O `index` ainda tem partículas em
  canvas no painel.

## Armadilhas conhecidas

1. **`index.html` e `lidera360.html` são duplicatas.** Toda mudança de conteúdo ou
   estilo precisa ser feita **nas duas**. O diff atual é só: `.menu-footer` e os
   botões "Entrar"/"Agendar demo" removidos, mais os guards `if (menuLoginBtn)` /
   `if (navLoginBtn)` que impedem o `TypeError` de derrubar o resto do script.

2. **Caminhos de imagem inconsistentes.** Vários usam `/src/img/...` (absoluto):
   `index.html:3470`, `dash.html:1082`, `perfil.html:898/1017/1049` e as mini-logos
   em `Headerscroll.js:118,124`. Mas o vídeo usa `src/img/...` (relativo) em
   `index.html:3183`. Os absolutos **só funcionam servidos da raiz do domínio** —
   quebram em `file://` e em GitHub Pages sob subpasta. Padronizar para relativo
   antes de qualquer publicação.

3. **O progresso do `dash.html` é aleatório a cada carga.** `gerarProgresso()` usa
   `Math.random()`, então os números mudam a cada F5 e **não batem** com os do
   `perfil.html`, que são fixos (2 trilhas concluídas, 2 certificados, 46h).
   Para coerência entre as telas, isso precisaria virar dado fixo ou `localStorage`.

4. **O catálogo de trilhas existe em dois formatos.** O array `TRILHAS` do `index`
   (e do `lidera360`) tem só os nomes dos módulos; o do `dash.html` tem os mesmos
   módulos com os ~10 conteúdos de cada. Adicionar ou renomear um módulo exige
   mexer nos três arquivos.

5. **Breakpoints não são uniformes**, e cada um tem razão comentada no lugar:
   - `1054px` — nav completa do `index` (`.hide-mobile`) e os blocos `.hero-desk`
   - `700/701px` — nav compacta do `dash`/`perfil`
   - `769px` — grid de uma para duas colunas (e o `nowrap` do título do hero)
   - `560px` — controles do player e a tabela comparativa

6. **Camada de z-index** (do `index`): conteúdo `1`, marca-texto `5`, nav `40`,
   botão de tema `41`, barra de progresso `42`, backdrop do menu `45`, painel `46`,
   modal de login `50`, tela de intro `100`. No `dash.html` a camada do marca-texto
   sobe para `60`, para ficar acima do modal de módulo.

7. **Vídeo bruto fora do repositório.** O `.gitignore` exclui `*.MOV`/`*.mov` etc.:
   o original tinha 267 MB e o GitHub rejeita acima de 100 MiB. Só a versão
   convertida em `src/img/` é versionada.

8. **A intro roda uma vez por SESSÃO**, e a decisão mora num script inline no topo
   do `<body>` — não no `introLoader.js`. Ela precisa acontecer antes da primeira
   pintura: se dependesse do arquivo externo, quem já viu a intro veria um lampejo
   dela a cada F5. A chave é `lidera360:intro-seen` no `sessionStorage`, que
   sobrevive ao refresh e morre ao fechar a aba — exatamente a regra pedida. Para
   ver de novo sem fechar a aba, apague a chave no DevTools (Application → Session
   Storage). A marcação é feita na ENTRADA da animação, não na saída, senão
   recarregar no meio dela faria tudo recomeçar.

9. **As animações de entrada da página esperam a intro.** O scroll reveal e o
   marca-texto passam pelo `window.lideraOnIntroDone` em vez de arrancarem
   sozinhos — sem isso o hero faz todo o número dele (typewriter, reveals, traçado
   do gráfico) escondido atrás do véu, e a página aparece já parada. Quem esvazia
   a fila é o `introLoader.js`, no COMEÇO do fade, pra uma coisa encadear na outra.
   Sem intro (refresh, movimento reduzido) a função executa na hora.

10. **O DarkVeil e o Counter da intro vieram do react-bits sem React.** O DarkVeil
    é um fragment shader — a `ogl` do componente original só criava contexto e
    desenhava um triângulo de tela cheia, o que aqui são ~50 linhas de WebGL cru;
    o shader está copiado sem alteração. O Counter é um odômetro cuja única peça
    de React era a mola do deslize, trocada por `rAF` com easing. Nenhum dos dois
    justificava trazer npm e bundler — e uma tela de LOADING não pode depender de
    baixar dependência. O shader ganhou um DUOTONE no fim do `main()` (`uTint`/`uSat`
    sobre a rampa `uDeep`→`uGlow`): sozinho, o `hueShift` levava o roxo do CPPN
    pro verde neon, longe do `#2fd55a`. Os botões de ajuste (tempos, `HUE_SHIFT`,
    `TINT`, `SAT`, `DEEP`, `GLOW`, `RES_SCALE`)
    estão no topo do `introLoader.js`.

11. **O vidro da intro é FUMÊ, e isso é deliberado.** A primeira versão era um
    vidro claro (fill branco, `brightness()` clareando o backdrop, borda em
    gradiente, reflexo diagonal em laço). Ficou um cartão claro cheio de efeito
    sobre um fundo todo escuro. O visual atual saiu de um acidente: um print do
    Dark Reader tentando escurecer uma página que já era escura achatou justamente
    os efeitos, e o que sobrou era melhor. Então: fill verde-navy quase preto,
    `brightness(.85)` (escurece, não clareia), `border` estático de 1px e nenhum
    reflexo se mexendo. Antes de "melhorar" isso com um anel em gradiente, leia o
    comentário do `.intro-panel`: o anel desenha uma fonte de luz, e este painel
    não tem uma — ele é iluminado por dentro, pelo verde do véu que atravessa.

## Conteúdo

O texto do site segue uma régua explícita: **nenhuma métrica inventada**. Números
como "89% das empresas investem em T&D" vêm da documentação do projeto; métricas de
uso que a plataforma (ainda em prototipação) não teria como ter foram removidas em
favor do modelo comercial e dos diferenciais documentados. Mantenha essa régua ao
escrever texto novo.

Assinatura oficial: *"Aprenda, evolua e lidere."*
