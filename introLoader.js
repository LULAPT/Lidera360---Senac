// Tela de introdução do Lidera360 — o contador rolando até 360 por cima do
// DarkVeil, uma vez por sessão.
//
// ── POR QUE NÃO TEM REACT AQUI ──────────────────────────────────────────
// Os dois componentes vieram do react-bits, mas nenhum dos dois é React de
// verdade:
//
// · DarkVeil é um FRAGMENT SHADER. O componente usa a ogl só pra criar o
//   contexto, compilar o shader e desenhar UM triângulo que cobre a tela —
//   e isso são ~50 linhas de WebGL cru. Trazer a ogl (e com ela npm, build
//   e bundler, que este projeto não tem) pra pagar por esse boilerplate
//   seria caro pelo motivo errado. Pior: a intro é uma tela de LOADING —
//   fazer ela esperar o download de uma dependência é o avesso do que ela
//   existe pra fazer. O shader em si está copiado abaixo sem uma vírgula
//   de diferença: é ele que dá o efeito, e ele não é de biblioteca nenhuma.
//
// · Counter é um ODÔMETRO: cada casa decimal é uma coluna com os dez
//   algarismos empilhados, e a coluna desliza pra deixar o certo na janela.
//   A conta que escolhe o deslocamento está portada linha a linha (ver
//   rollDigits). A única coisa que o motion/react fazia era a MOLA que
//   anima esse deslize — aqui é um requestAnimationFrame com easing, que é
//   como o resto do projeto anima tudo.
//
// ── QUANDO RODA ─────────────────────────────────────────────────────────
// Só se o script de sessão (inline no HTML, logo antes deste) tiver deixado
// o #introVeil no DOM. A decisão de mostrar ou não mora LÁ, e não aqui,
// porque ela precisa acontecer antes da primeira pintura: se dependesse
// deste arquivo, quem já viu a intro veria um lampejo dela a cada refresh.
;(function () {
  const veil = document.getElementById('introVeil')
  if (!veil) return

  const canvas  = document.getElementById('introCanvas')
  const counter = document.getElementById('introCounter')

  /* -- tempos -----------------------------------------------------------
     Somados dao ~4,0s. A primeira versao fechava em 2,7s e passava rapido
     demais: a rolagem terminava e o veu ja comecava a sair, entao o
     "Lidera360" completo — que e o ponto da tela inteira — mal dava tempo
     de ser lido. Quem mais cresceu foi o HOLD (500 -> 950), justamente o
     trecho em que nao acontece nada alem de o nome ficar parado ali.

     A ordem importa: o contador comeca DEPOIS da logo entrar (a logo e
     quem apresenta, o numero e quem conclui) e o veu so comeca a sair
     depois do HOLD, nunca no instante em que o 360 chega.

     FADE tem um par no CSS: a `transition: opacity` do .intro-veil. Os
     dois PRECISAM bater — e o FADE que agenda a remocao do elemento, e se
     ele for menor que a transition o veu some no meio do fade; se for
     maior, fica um punhado de frames invisivel no DOM. */
  const COUNT_IN  = 620   // espera antes de a rolagem comecar
  const COUNT_RUN = 1800  // duracao da rolagem
  const HOLD      = 950   // quanto tempo o 360 fica parado
  const FADE      = 650   // saida do veu (casar com a transition no CSS)

  const TARGET = 360

  /* ── parâmetros do DarkVeil ───────────────────────────────────────────
     Os mesmos nomes das props do componente. hueShift 71 é o valor que
     veio no link de referência — é ele que tira o roxo padrão do shader e
     leva a paleta pro lado frio/esverdeado que conversa com a marca.
     RES_SCALE é acréscimo nosso: o shader é uma CPPN, ou seja faz dezenas
     de multiplicações de mat4 POR PIXEL. Em tela cheia e dpr 2 isso é caro
     à toa pra um fundo desfocado que fica ~4s no ar — renderizar a 70% e
     deixar o navegador escalar é invisível e devolve o dobro de fôlego. */
  const HUE_SHIFT  = 71
  const NOISE      = 0
  const SCAN       = 0
  const SCAN_FREQ  = 0
  const WARP       = 0
  const SPEED      = 0.5
  const RES_SCALE  = 0.7
  /* ── a rampa da marca (ver o duotone no fim do shader) ────────────────
     DEEP e a sombra e GLOW e a luz, em 0..1. DEEP e um navy proximo do
     --bg do tema escuro, pra o veu ler como a propria pagina em vez de
     preto puro; GLOW e o #2fd55a exato.
     TINT: 0 devolve o shader cru (verde neon), 1 vira duotone puro. .72
     mantem a variacao de cor do CPPN aparecendo por baixo da rampa.
     SAT: apara o que restou de neon depois da mistura. */
  const TINT = 0.72
  const SAT  = 0.9
  const DEEP = [0.024, 0.031, 0.055]  // #06080e
  const GLOW = [0.184, 0.835, 0.353]  // #2fd55a

  /* ── onde o desenho do shader cai na tela ─────────────────────────────
     O CPPN concentra o brilho numa faixa e, no enquadramento cru, ela sai
     colada no TOPO. CENTER_Y desloca a amostragem pra trazer essa faixa
     pro meio, atras da logo.

     Cuidado com o sinal: o `uv.y*=-1.` do mainImage inverte o eixo, entao
     depois dele o topo da tela e -1 e a base e +1 — somar um valor
     NEGATIVO faz o desenho DESCER. O -0.55 saiu de medir a captura: o
     nucleo claro estava a ~20% do topo, ou seja em -0.6 nessa escala, e
     trazer isso pro centro pede mais ou menos esse tanto.

     Este e o botao pra girar se ainda ficar alto (mais negativo) ou se
     descer demais (menos). A vinheta no CSS do .intro-veil-canvas cobre a
     folga: ela dissolve as beiradas, entao a mancha le como centrada
     mesmo que o deslocamento nao esteja no ponto exato. */
  const CENTER_Y = -0.55

  /* ═══════════════════════════════════════════════════════════════════
     DarkVeil — WebGL cru
     ═══════════════════════════════════════════════════════════════════ */

  const VERT = `
attribute vec2 position;
void main(){gl_Position=vec4(position,0.0,1.0);}
`

  const FRAG = `
#ifdef GL_ES
precision lowp float;
#endif
uniform vec2 uResolution;
uniform float uTime;
uniform float uHueShift;
uniform float uNoise;
uniform float uScan;
uniform float uScanFreq;
uniform float uWarp;
uniform float uLightMode;
uniform float uTint;
uniform float uSat;
uniform vec3 uDeep;
uniform vec3 uGlow;
uniform float uCenterY;
#define iTime uTime
#define iResolution uResolution

vec4 buf[8];
float rand(vec2 c){return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453);}

mat3 rgb2yiq=mat3(0.299,0.587,0.114,0.596,-0.274,-0.322,0.211,-0.523,0.312);
mat3 yiq2rgb=mat3(1.0,0.956,0.621,1.0,-0.272,-0.647,1.0,-1.106,1.703);

vec3 hueShiftRGB(vec3 col,float deg){
    vec3 yiq=rgb2yiq*col;
    float rad=radians(deg);
    float cosh=cos(rad),sinh=sin(rad);
    vec3 yiqShift=vec3(yiq.x,yiq.y*cosh-yiq.z*sinh,yiq.y*sinh+yiq.z*cosh);
    return clamp(yiq2rgb*yiqShift,0.0,1.0);
}

vec4 sigmoid(vec4 x){return 1./(1.+exp(-x));}

vec4 cppn_fn(vec2 coordinate,float in0,float in1,float in2){
    buf[6]=vec4(coordinate.x,coordinate.y,0.3948333106474662+in0,0.36+in1);
    buf[7]=vec4(0.14+in2,sqrt(coordinate.x*coordinate.x+coordinate.y*coordinate.y),0.,0.);
    buf[0]=mat4(vec4(6.5404263,-3.6126034,0.7590882,-1.13613),vec4(2.4582713,3.1660357,1.2219609,0.06276096),vec4(-5.478085,-6.159632,1.8701609,-4.7742867),vec4(6.039214,-5.542865,-0.90925294,3.251348))*buf[6]+mat4(vec4(0.8473259,-5.722911,3.975766,1.6522468),vec4(-0.24321538,0.5839259,-1.7661959,-5.350116),vec4(0.,0.,0.,0.),vec4(0.,0.,0.,0.))*buf[7]+vec4(0.21808943,1.1243913,-1.7969975,5.0294676);
    buf[1]=mat4(vec4(-3.3522482,-6.0612736,0.55641043,-4.4719114),vec4(0.8631464,1.7432913,5.643898,1.6106541),vec4(2.4941394,-3.5012043,1.7184316,6.357333),vec4(3.310376,8.209261,1.1355612,-1.165539))*buf[6]+mat4(vec4(5.24046,-13.034365,0.009859298,15.870829),vec4(2.987511,3.129433,-0.89023495,-1.6822904),vec4(0.,0.,0.,0.),vec4(0.,0.,0.,0.))*buf[7]+vec4(-5.9457836,-6.573602,-0.8812491,1.5436668);
    buf[0]=sigmoid(buf[0]);buf[1]=sigmoid(buf[1]);
    buf[2]=mat4(vec4(-15.219568,8.095543,-2.429353,-1.9381982),vec4(-5.951362,4.3115187,2.6393783,1.274315),vec4(-7.3145227,6.7297835,5.2473326,5.9411426),vec4(5.0796127,8.979051,-1.7278991,-1.158976))*buf[6]+mat4(vec4(-11.967154,-11.608155,6.1486754,11.237008),vec4(2.124141,-6.263192,-1.7050359,-0.7021966),vec4(0.,0.,0.,0.),vec4(0.,0.,0.,0.))*buf[7]+vec4(-4.17164,-3.2281182,-4.576417,-3.6401186);
    buf[3]=mat4(vec4(3.1832156,-13.738922,1.879223,3.233465),vec4(0.64300746,12.768129,1.9141049,0.50990224),vec4(-0.049295485,4.4807224,1.4733979,1.801449),vec4(5.0039253,13.000481,3.3991797,-4.5561905))*buf[6]+mat4(vec4(-0.1285731,7.720628,-3.1425676,4.742367),vec4(0.6393625,3.714393,-0.8108378,-0.39174938),vec4(0.,0.,0.,0.),vec4(0.,0.,0.,0.))*buf[7]+vec4(-1.1811101,-21.621881,0.7851888,1.2329718);
    buf[2]=sigmoid(buf[2]);buf[3]=sigmoid(buf[3]);
    buf[4]=mat4(vec4(5.214916,-7.183024,2.7228765,2.6592617),vec4(-5.601878,-25.3591,4.067988,0.4602802),vec4(-10.57759,24.286327,21.102104,37.546658),vec4(4.3024497,-1.9625226,2.3458803,-1.372816))*buf[0]+mat4(vec4(-17.6526,-10.507558,2.2587414,12.462782),vec4(6.265566,-502.75443,-12.642513,0.9112289),vec4(-10.983244,20.741234,-9.701768,-0.7635988),vec4(5.383626,1.4819539,-4.1911616,-4.8444734))*buf[1]+mat4(vec4(12.785233,-16.345072,-0.39901125,1.7955981),vec4(-30.48365,-1.8345358,1.4542528,-1.1118771),vec4(19.872723,-7.337935,-42.941723,-98.52709),vec4(8.337645,-2.7312303,-2.2927687,-36.142323))*buf[2]+mat4(vec4(-16.298317,3.5471997,-0.44300047,-9.444417),vec4(57.5077,-35.609753,16.163465,-4.1534753),vec4(-0.07470326,-3.8656476,-7.0901804,3.1523974),vec4(-12.559385,-7.077619,1.490437,-0.8211543))*buf[3]+vec4(-7.67914,15.927437,1.3207729,-1.6686112);
    buf[5]=mat4(vec4(-1.4109162,-0.372762,-3.770383,-21.367174),vec4(-6.2103205,-9.35908,0.92529047,8.82561),vec4(11.460242,-22.348068,13.625772,-18.693201),vec4(-0.3429052,-3.9905605,-2.4626114,-0.45033523))*buf[0]+mat4(vec4(7.3481627,-4.3661838,-6.3037653,-3.868115),vec4(1.5462853,6.5488915,1.9701879,-0.58291394),vec4(6.5858274,-2.2180402,3.7127688,-1.3730392),vec4(-5.7973905,10.134961,-2.3395722,-5.965605))*buf[1]+mat4(vec4(-2.5132585,-6.6685553,-1.4029363,-0.16285264),vec4(-0.37908727,0.53738135,4.389061,-1.3024765),vec4(-0.70647055,2.0111287,-5.1659346,-3.728635),vec4(-13.562562,10.487719,-0.9173751,-2.6487076))*buf[2]+mat4(vec4(-8.645013,6.5546675,-6.3944063,-5.5933375),vec4(-0.57783127,-1.077275,36.91025,5.736769),vec4(14.283112,3.7146652,7.1452246,-4.5958776),vec4(2.7192075,3.6021907,-4.366337,-2.3653464))*buf[3]+vec4(-5.9000807,-4.329569,1.2427121,8.59503);
    buf[4]=sigmoid(buf[4]);buf[5]=sigmoid(buf[5]);
    buf[6]=mat4(vec4(-1.61102,0.7970257,1.4675229,0.20917463),vec4(-28.793737,-7.1390953,1.5025433,4.656581),vec4(-10.94861,39.66238,0.74318546,-10.095605),vec4(-0.7229728,-1.5483948,0.7301322,2.1687684))*buf[0]+mat4(vec4(3.2547753,21.489103,-1.0194173,-3.3100595),vec4(-3.7316632,-3.3792162,-7.223193,-0.23685838),vec4(13.1804495,0.7916005,5.338587,5.687114),vec4(-4.167605,-17.798311,-6.815736,-1.6451967))*buf[1]+mat4(vec4(0.604885,-7.800309,-7.213122,-2.741014),vec4(-3.522382,-0.12359311,-0.5258442,0.43852118),vec4(9.6752825,-22.853785,2.062431,0.099892326),vec4(-4.3196306,-17.730087,2.5184598,5.30267))*buf[2]+mat4(vec4(-6.545563,-15.790176,-6.0438633,-5.415399),vec4(-43.591583,28.551912,-16.00161,18.84728),vec4(4.212382,8.394307,3.0958717,8.657522),vec4(-5.0237565,-4.450633,-4.4768,-5.5010443))*buf[3]+mat4(vec4(1.6985557,-67.05806,6.897715,1.9004834),vec4(1.8680354,2.3915145,2.5231109,4.081538),vec4(11.158006,1.7294737,2.0738268,7.386411),vec4(-4.256034,-306.24686,8.258898,-17.132736))*buf[4]+mat4(vec4(1.6889864,-4.5852966,3.8534803,-6.3482175),vec4(1.3543309,-1.2640043,9.932754,2.9079645),vec4(-5.2770967,0.07150358,-0.13962056,3.3269649),vec4(28.34703,-4.918278,6.1044083,4.085355))*buf[5]+vec4(6.6818056,12.522166,-3.7075126,-4.104386);
    buf[7]=mat4(vec4(-8.265602,-4.7027016,5.098234,0.7509808),vec4(8.6507845,-17.15949,16.51939,-8.884479),vec4(-4.036479,-2.3946867,-2.6055532,-1.9866527),vec4(-2.2167742,-1.8135649,-5.9759874,4.8846445))*buf[0]+mat4(vec4(6.7790847,3.5076547,-2.8191125,-2.7028968),vec4(-5.743024,-0.27844876,1.4958696,-5.0517144),vec4(13.122226,15.735168,-2.9397483,-4.101023),vec4(-14.375265,-5.030483,-6.2599335,2.9848232))*buf[1]+mat4(vec4(4.0950394,-0.94011575,-5.674733,4.755022),vec4(4.3809423,4.8310084,1.7425908,-3.437416),vec4(2.117492,0.16342592,-104.56341,16.949184),vec4(-5.22543,-2.994248,3.8350096,-1.9364246))*buf[2]+mat4(vec4(-5.900337,1.7946124,-13.604192,-3.8060522),vec4(6.6583457,31.911177,25.164474,91.81147),vec4(11.840538,4.1503043,-0.7314397,6.768467),vec4(-6.3967767,4.034772,6.1714606,-0.32874924))*buf[3]+mat4(vec4(3.4992442,-196.91893,-8.923708,2.8142626),vec4(3.4806502,-3.1846354,5.1725626,5.1804223),vec4(-2.4009497,15.585794,1.2863957,2.0252278),vec4(-71.25271,-62.441242,-8.138444,0.50670296))*buf[4]+mat4(vec4(-12.291733,-11.176166,-7.3474145,4.390294),vec4(10.805477,5.6337385,-0.9385842,-4.7348723),vec4(-12.869276,-7.039391,5.3029537,7.5436664),vec4(1.4593618,8.91898,3.5101583,5.840625))*buf[5]+vec4(2.2415268,-6.705987,-0.98861027,-2.117676);
    buf[6]=sigmoid(buf[6]);buf[7]=sigmoid(buf[7]);
    buf[0]=mat4(vec4(1.6794263,1.3817469,2.9625452,0.),vec4(-1.8834411,-1.4806935,-3.5924516,0.),vec4(-1.3279216,-1.0918057,-2.3124623,0.),vec4(0.2662234,0.23235129,0.44178495,0.))*buf[0]+mat4(vec4(-0.6299101,-0.5945583,-0.9125601,0.),vec4(0.17828953,0.18300213,0.18182953,0.),vec4(-2.96544,-2.5819945,-4.9001055,0.),vec4(1.4195864,1.1868085,2.5176322,0.))*buf[1]+mat4(vec4(-1.2584374,-1.0552157,-2.1688404,0.),vec4(-0.7200217,-0.52666044,-1.438251,0.),vec4(0.15345335,0.15196142,0.272854,0.),vec4(0.945728,0.8861938,1.2766753,0.))*buf[2]+mat4(vec4(-2.4218085,-1.968602,-4.35166,0.),vec4(-22.683098,-18.0544,-41.954372,0.),vec4(0.63792,0.5470648,1.1078634,0.),vec4(-1.5489894,-1.3075932,-2.6444845,0.))*buf[3]+mat4(vec4(-0.49252132,-0.39877754,-0.91366625,0.),vec4(0.95609266,0.7923952,1.640221,0.),vec4(0.30616966,0.15693925,0.8639857,0.),vec4(1.1825981,0.94504964,2.176963,0.))*buf[4]+mat4(vec4(0.35446745,0.3293795,0.59547555,0.),vec4(-0.58784515,-0.48177817,-1.0614829,0.),vec4(2.5271258,1.9991658,4.6846647,0.),vec4(0.13042648,0.08864098,0.30187556,0.))*buf[5]+mat4(vec4(-1.7718065,-1.4033192,-3.3355875,0.),vec4(3.1664357,2.638297,5.378702,0.),vec4(-3.1724713,-2.6107926,-5.549295,0.),vec4(-2.851368,-2.249092,-5.3013067,0.))*buf[6]+mat4(vec4(1.5203838,1.2212278,2.8404984,0.),vec4(1.5210563,1.2651345,2.683903,0.),vec4(2.9789467,2.4364579,5.2347264,0.),vec4(2.2270417,1.8825914,3.8028636,0.))*buf[7]+vec4(-1.5468478,-3.6171484,0.24762098,0.);
    buf[0]=sigmoid(buf[0]);
    return vec4(buf[0].x,buf[0].y,buf[0].z,1.);
}

void mainImage(out vec4 fragColor,in vec2 fragCoord){
    vec2 uv=fragCoord/uResolution.xy*2.-1.;
    uv.x *= uResolution.x / uResolution.y;
    uv.y*=-1.;
    uv.y+=uCenterY;
    uv+=uWarp*vec2(sin(uv.y*6.283+uTime*0.5),cos(uv.x*6.283+uTime*0.5))*0.05;
    fragColor=cppn_fn(uv,0.1*sin(0.3*uTime),0.1*sin(0.69*uTime),0.1*sin(0.44*uTime));
}

void main(){
    vec4 col;mainImage(col,gl_FragCoord.xy);
    col.rgb=hueShiftRGB(col.rgb,uHueShift);
    float scanline_val=sin(gl_FragCoord.y*uScanFreq)*0.5+0.5;
    col.rgb*=1.-(scanline_val*scanline_val)*uScan;
    col.rgb+=(rand(gl_FragCoord.xy+uTime)-0.5)*uNoise;
    vec3 result=clamp(col.rgb,0.0,1.0);

    /* -- acrescimo nosso: puxa a paleta pra marca ---------------------
       O hueShift sozinho girava o roxo do CPPN direto pro verde puro:
       neon, saturado, longe do #2fd55a. Aqui a imagem e reescrita como um
       DUOTONE: a luminancia (que e onde mora o desenho do shader) vira
       posicao numa rampa que sai do navy e chega no verde da marca. A
       estrutura fica intacta, so as cores mudam de familia.
       uTint diz quanto disso entra; uSat apara o que sobrou de neon. */
    float lum = dot(result, vec3(0.299, 0.587, 0.114));
    vec3 duo = mix(uDeep, uGlow, smoothstep(0.04, 0.80, lum));
    result = mix(result, duo, uTint);
    result = mix(vec3(dot(result, vec3(0.299, 0.587, 0.114))), result, uSat);
    result = clamp(result, 0.0, 1.0);
    if(uLightMode>0.5){
      float energy=max(result.r,max(result.g,result.b));
      vec3 hue=result/max(energy,0.001);
      float coverage=smoothstep(0.08,0.82,energy);
      vec3 ink=mix(hue*0.32,hue*0.78,smoothstep(0.0,1.0,energy));
      result=mix(vec3(1.0),ink,coverage*0.82);
    }
    gl_FragColor=vec4(result,1.0);
}
`

  function compile (gl, type, src) {
    const sh = gl.createShader(type)
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    // sem console.error: se o shader não compilar o véu simplesmente fica
    // no gradiente do CSS, que já é um fundo aceitável — a intro não pode
    // depender disso pra funcionar
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { gl.deleteShader(sh); return null }
    return sh
  }

  /* Devolve { stop } ou null. Null aqui não é erro: é o caminho em que o
     véu fica só com o gradiente do CSS (WebGL desligado, GPU na blocklist,
     shader que não compilou). A intro roda igual. */
  function startVeil () {
    if (!canvas) return null

    let gl = null
    try {
      gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, powerPreference: 'high-performance' })
        || canvas.getContext('experimental-webgl')
    } catch (e) { return null }
    if (!gl) return null

    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return null

    const prog = gl.createProgram()
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null
    gl.useProgram(prog)

    /* O "Triangle" da ogl é isto: UM triângulo grande o bastante pra que o
       retângulo da tela caiba inteiro dentro dele. Não é um quad de dois
       triângulos — com um só não existe a diagonal do meio, onde as GPUs
       processam a mesma linha de pixels duas vezes. */
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'position')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const u = {
      res:  gl.getUniformLocation(prog, 'uResolution'),
      time: gl.getUniformLocation(prog, 'uTime'),
      hue:  gl.getUniformLocation(prog, 'uHueShift'),
      noi:  gl.getUniformLocation(prog, 'uNoise'),
      scan: gl.getUniformLocation(prog, 'uScan'),
      freq: gl.getUniformLocation(prog, 'uScanFreq'),
      warp: gl.getUniformLocation(prog, 'uWarp'),
      lite: gl.getUniformLocation(prog, 'uLightMode'),
      tint: gl.getUniformLocation(prog, 'uTint'),
      sat:  gl.getUniformLocation(prog, 'uSat'),
      deep: gl.getUniformLocation(prog, 'uDeep'),
      glow: gl.getUniformLocation(prog, 'uGlow'),
      cy:   gl.getUniformLocation(prog, 'uCenterY'),
    }

    gl.uniform1f(u.hue, HUE_SHIFT)
    gl.uniform1f(u.noi, NOISE)
    gl.uniform1f(u.scan, SCAN)
    gl.uniform1f(u.freq, SCAN_FREQ)
    gl.uniform1f(u.warp, WARP)
    gl.uniform1f(u.lite, 0)
    gl.uniform1f(u.tint, TINT)
    gl.uniform1f(u.sat, SAT)
    gl.uniform3f(u.deep, DEEP[0], DEEP[1], DEEP[2])
    gl.uniform3f(u.glow, GLOW[0], GLOW[1], GLOW[2])
    gl.uniform1f(u.cy, CENTER_Y)

    /* uResolution recebe o tamanho do BUFFER DE DESENHO, e não o tamanho em
       CSS como no componente original. É o que o shader espera: ele faz
       `fragCoord/uResolution`, e gl_FragCoord conta pixels do buffer — com
       os dois valores diferentes o uv sairia da faixa [-1,1] e a imagem
       apareceria deslocada e com a proporção errada. */
    function resize () {
      const scale = Math.min(window.devicePixelRatio || 1, 2) * RES_SCALE
      const w = Math.max(1, Math.round(veil.clientWidth  * scale))
      const h = Math.max(1, Math.round(veil.clientHeight * scale))
      if (canvas.width === w && canvas.height === h) return
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
      gl.uniform2f(u.res, w, h)
    }
    resize()
    window.addEventListener('resize', resize, { passive: true })

    const t0 = performance.now()
    let raf = null
    function frame (now) {
      gl.uniform1f(u.time, ((now - t0) / 1000) * SPEED)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return {
      stop () {
        if (raf !== null) cancelAnimationFrame(raf)
        raf = null
        window.removeEventListener('resize', resize)
        /* devolve o contexto na hora em vez de esperar o coletor: são
           dezenas de mat4 por pixel, e deixar isso vivo depois que o véu
           sumiu é queimar GPU por nada debaixo da página */
        const lose = gl.getExtension('WEBGL_lose_context')
        if (lose) lose.loseContext()
      },
    }
  }

  /* ═══════════════════════════════════════════════════════════════════
     Counter — o odômetro
     ═══════════════════════════════════════════════════════════════════ */

  /* As casas decimais, da mais alta pra mais baixa: 360 vira [100, 10, 1].
     Mesma derivação do componente (que faz 10 ** posição a partir da string
     do valor), só que sem o ramo do separador decimal — aqui o alvo é um
     inteiro conhecido e não há ponto pra tratar. */
  const PLACES = String(TARGET).split('').map((_, i, a) => Math.pow(10, a.length - i - 1))

  const columns = PLACES.map(() => {
    const digit = document.createElement('span')
    digit.className = 'intro-digit'
    const nums = []
    for (let n = 0; n < 10; n++) {
      const s = document.createElement('span')
      s.textContent = n
      digit.appendChild(s)
      nums.push(s)
    }
    counter.appendChild(digit)
    return { el: digit, nums }
  })

  /* A conta portada do <Number> do componente. Para a casa em questão o
     algarismo corrente é `value % 10` (fracionário durante a rolagem, que é
     o que faz a coluna deslizar em vez de saltar). Para cada um dos dez
     algarismos empilhados, `offset` é quantas posições ele está à frente do
     corrente; multiplicado pela altura da janela, vira o deslocamento.

     O `offset > 5` é o detalhe que faz a coisa parecer um odômetro de
     verdade: passando da metade da volta, é mais curto vir por cima do que
     dar a volta inteira por baixo. Sem ele todos os dígitos rodariam sempre
     no mesmo sentido e a coluna daria voltas visíveis a cada troca. */
  /* A altura da janela é medida UMA vez (e de novo em resize), não a cada
     frame: getBoundingClientRect no meio do laço obriga o navegador a
     recalcular layout 60 vezes por segundo pra ler um número que não muda
     enquanto a fonte e a largura da tela não mudam. */
  let digitH = 1
  function measureDigit () {
    digitH = columns[0].el.getBoundingClientRect().height || 1
  }
  window.addEventListener('resize', measureDigit, { passive: true })

  function rollDigits (progress) {
    const h = digitH
    columns.forEach((col, i) => {
      const value = Math.floor(TARGET / PLACES[i]) * progress
      const cur = value % 10
      col.nums.forEach((el, n) => {
        const offset = (10 + n - cur) % 10
        let y = offset * h
        if (offset > 5) y -= 10 * h
        el.style.transform = 'translateY(' + y + 'px)'
      })
    })
  }

  // easeOutQuart: freia forte no fim sem o estalo do expo — a casa das
  // unidades gira 36 voltas, e com uma curva mais seca ela vira um borrão
  // que some antes de o olho registrar que era um número rolando
  function easeOutQuart (t) { return 1 - Math.pow(1 - t, 4) }

  function runCounter (onEnd) {
    const start = performance.now()
    ;(function step (now) {
      const t = Math.min((now - start) / COUNT_RUN, 1)
      rollDigits(easeOutQuart(t))
      if (t < 1) requestAnimationFrame(step)
      else onEnd()
    })(start)
  }

  /* ═══════════════════════════════════════════════════════════════════
     Sequência
     ═══════════════════════════════════════════════════════════════════ */

  const veilGL = startVeil()
  measureDigit()
  rollDigits(0)   // nasce em 000, e não já em 360

  function finish () {
    /* As animações da página são liberadas no COMEÇO da saída, não no fim:
       o hero já está surgindo enquanto o véu se dissolve, então uma coisa
       encadeia na outra em vez de a página aparecer parada e só então
       começar a se mexer. Ver o comentário do lideraOnIntroDone no HTML. */
    window.lideraIntroActive = false
    const queue = window.lideraIntroQueue || []
    window.lideraIntroQueue = []
    queue.forEach(fn => { try { fn() } catch (e) {} })

    veil.classList.add('is-leaving')
    document.body.style.overflow = ''

    setTimeout(() => {
      if (veilGL) veilGL.stop()
      if (veil.parentNode) veil.parentNode.removeChild(veil)
    }, FADE)
  }

  setTimeout(() => runCounter(() => setTimeout(finish, HOLD)), COUNT_IN)
})()
