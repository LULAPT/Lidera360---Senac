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
   modal de login `50`. No `dash.html` a camada do marca-texto sobe para `60`, para
   ficar acima do modal de módulo.

7. **Vídeo bruto fora do repositório.** O `.gitignore` exclui `*.MOV`/`*.mov` etc.:
   o original tinha 267 MB e o GitHub rejeita acima de 100 MiB. Só a versão
   convertida em `src/img/` é versionada.

## Conteúdo

O texto do site segue uma régua explícita: **nenhuma métrica inventada**. Números
como "89% das empresas investem em T&D" vêm da documentação do projeto; métricas de
uso que a plataforma (ainda em prototipação) não teria como ter foram removidas em
favor do modelo comercial e dos diferenciais documentados. Mantenha essa régua ao
escrever texto novo.

Assinatura oficial: *"Aprenda, evolua e lidere."*
