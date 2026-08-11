import { useState } from 'react'
import logoImg from '@/imports/image.png'

/* ── palette ─────────────────────────────────────────── */
const NAVY   = '#0f1272'
const NAVYD  = '#090b52'
const GREEN  = '#2fd55a'
const GREEND = '#22b847'
const ORANGE = '#f97316'
const BG     = '#f5f6ff'
const WHITE  = '#ffffff'
const MUTED  = '#6b7280'
const BORDER = 'rgba(15,18,114,0.15)'

/* ── data ────────────────────────────────────────────── */
const COURSE_TABS = ['Liderança', 'Vendas', 'Compliance', 'Produtividade', 'RH & Cultura', 'Tecnologia']

const COURSES: Record<string, { title: string; duration: string; level: string; tag: string; img: string }[]> = {
  'Liderança': [
    { title: 'Liderança Situacional', duration: '4h 20min', level: 'Intermediário', tag: 'Mais popular', img: 'photo-1552664730-d307ca884978' },
    { title: 'Gestão de Equipes Remotas', duration: '3h 10min', level: 'Avançado', tag: 'Novo', img: 'photo-1600880292203-757bb62b4baf' },
    { title: 'Feedback e Desenvolvimento', duration: '2h 45min', level: 'Básico', tag: '', img: 'photo-1519389950473-47ba0277781c' },
    { title: 'Comunicação Executiva', duration: '5h 00min', level: 'Avançado', tag: '', img: 'photo-1557804506-669a67965ba0' },
  ],
  'Vendas': [
    { title: 'Técnicas de Negociação', duration: '3h 30min', level: 'Intermediário', tag: 'Mais popular', img: 'photo-1521737604893-d14cc237f11d' },
    { title: 'CRM e Funil de Vendas', duration: '2h 50min', level: 'Básico', tag: '', img: 'photo-1553877522-43269d4ea984' },
    { title: 'Inside Sales Avançado', duration: '4h 15min', level: 'Avançado', tag: 'Novo', img: 'photo-1560472354-b33ff0c44a43' },
    { title: 'Atendimento ao Cliente', duration: '2h 00min', level: 'Básico', tag: '', img: 'photo-1556761175-b413da4baf72' },
  ],
  'Compliance': [
    { title: 'LGPD na Prática', duration: '3h 00min', level: 'Básico', tag: 'Obrigatório', img: 'photo-1450101499163-c8848c66ca85' },
    { title: 'Ética Corporativa', duration: '2h 30min', level: 'Básico', tag: 'Obrigatório', img: 'photo-1507003211169-0a1dd7228f2d' },
    { title: 'Prevenção à Lavagem de Dinheiro', duration: '4h 00min', level: 'Intermediário', tag: '', img: 'photo-1554224155-6726b3ff858f' },
    { title: 'Segurança da Informação', duration: '3h 45min', level: 'Intermediário', tag: 'Novo', img: 'photo-1563013544-824ae1b704d3' },
  ],
  'Produtividade': [
    { title: 'Gestão do Tempo', duration: '2h 15min', level: 'Básico', tag: 'Mais popular', img: 'photo-1484480974693-6ca0a78fb36b' },
    { title: 'Metodologias Ágeis', duration: '5h 30min', level: 'Intermediário', tag: '', img: 'photo-1507925921958-8a62f3d1a50d' },
    { title: 'OKRs na Prática', duration: '3h 20min', level: 'Intermediário', tag: 'Novo', img: 'photo-1460925895917-afdab827c52f' },
    { title: 'Deep Work e Foco', duration: '2h 00min', level: 'Básico', tag: '', img: 'photo-1434030216411-0b793f4b4173' },
  ],
  'RH & Cultura': [
    { title: 'Diversidade e Inclusão', duration: '3h 00min', level: 'Básico', tag: 'Recomendado', img: 'photo-1573164713988-8665fc963095' },
    { title: 'Onboarding Eficaz', duration: '2h 30min', level: 'Intermediário', tag: '', img: 'photo-1531482615713-2afd69097998' },
    { title: 'Employer Branding', duration: '3h 50min', level: 'Avançado', tag: 'Novo', img: 'photo-1522071820081-009f0129c71c' },
    { title: 'Clima e Engajamento', duration: '2h 45min', level: 'Intermediário', tag: '', img: 'photo-1568992687947-868a62a9f521' },
  ],
  'Tecnologia': [
    { title: 'Excel Avançado para Negócios', duration: '6h 00min', level: 'Intermediário', tag: 'Mais popular', img: 'photo-1498050108023-c5249f4df085' },
    { title: 'Inteligência Artificial no Trabalho', duration: '4h 30min', level: 'Básico', tag: 'Novo', img: 'photo-1677442136019-21780ecad995' },
    { title: 'Power BI Essencial', duration: '5h 15min', level: 'Intermediário', tag: '', img: 'photo-1551288049-bebda4e38f71' },
    { title: 'Segurança Digital para Equipes', duration: '2h 20min', level: 'Básico', tag: '', img: 'photo-1510511459019-5dda7724fd87' },
  ],
}

const FEATURES = [
  { icon: '🎯', title: 'Trilhas Personalizadas', body: 'Monte jornadas de aprendizagem por cargo, departamento ou meta estratégica — sem customização técnica.' },
  { icon: '📊', title: 'Dashboard em Tempo Real', body: 'Acompanhe progresso e engajamento por equipe. Relatórios exportáveis para o RH e gestores.' },
  { icon: '👥', title: 'Multiusuário por Empresa', body: 'Cada colaborador tem perfil, histórico e certificado próprios. Gestores têm visão consolidada do time.' },
  { icon: '🏆', title: 'Certificação Automática', body: 'Certificados digitais gerados ao concluir trilhas. Válidos para comprovação interna e externa.' },
  { icon: '📱', title: 'Mobile-First', body: 'Funciona em qualquer dispositivo. O colaborador aprende no ritmo dele — celular, tablet ou desktop.' },
  { icon: '🛡️', title: 'Conformidade Garantida', body: 'Trilhas de compliance com rastreabilidade total. Histórico de aceites acessível por auditoria.' },
]

const TESTIMONIALS = [
  { quote: 'Em 3 meses, reduzimos o tempo de onboarding pela metade e o engajamento subiu 40%.', name: 'Carla Mendes', role: 'Diretora de RH', company: 'Grupo Vantis', img: 'photo-1580489944761-15a19d654956' },
  { quote: 'A visibilidade sobre o desenvolvimento das equipes mudou completamente nossas decisões.', name: 'Rafael Souza', role: 'CEO', company: 'Meridian Tech', img: 'photo-1507003211169-0a1dd7228f2d' },
  { quote: 'Implementamos compliance obrigatório para 1.200 funcionários em menos de duas semanas.', name: 'Ana Paula Lima', role: 'Gerente de Compliance', company: 'Kinex Financeira', img: 'photo-1573496359142-b8d87734a5a2' },
]

const PLANS = [
  { name: 'Starter', desc: 'Para empresas dando os primeiros passos em T&D.', price: 'R$ 29', per: '/usuário/mês', features: ['Até 50 usuários', 'Acervo completo de cursos', 'Relatórios básicos', 'Suporte por e-mail'], cta: 'Começar grátis', highlight: false },
  { name: 'Business', desc: 'Para equipes que precisam de controle e personalização.', price: 'R$ 49', per: '/usuário/mês', features: ['Usuários ilimitados', 'Trilhas customizadas', 'Dashboard avançado', 'Integrações (SSO, HRIS)', 'Suporte prioritário'], cta: 'Falar com vendas', highlight: true },
  { name: 'Enterprise', desc: 'Para grandes empresas com necessidades específicas.', price: 'Sob consulta', per: '', features: ['Tudo do Business', 'White-label', 'Conteúdo exclusivo', 'SLA dedicado', 'Gerente de conta'], cta: 'Solicitar proposta', highlight: false },
]

const LEVEL_COLOR: Record<string, string> = {
  'Básico': '#22b847', 'Intermediário': '#0f1272', 'Avançado': '#f97316',
  'Obrigatório': '#ef4444', 'Recomendado': '#3b82f6',
}

/* ── decorative circles ─────────────────────────────── */
const Circle = ({ size, color, style }: { size: number; color: string; style: React.CSSProperties }) => (
  <div aria-hidden style={{ position: 'absolute', width: size, height: size, borderRadius: '50%', background: color, ...style, pointerEvents: 'none' }} />
)

/* ── logo mark (inline SVG) ─────────────────────────── */
const LogoMark = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <polygon points="24,4 44,40 4,40" fill={NAVY} />
    <polygon points="14,40 24,22 34,40" fill={NAVYD} opacity="0.7" />
    <polyline points="8,36 20,20 30,28 42,10" stroke={GREEN} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="42" cy="10" r="3" fill={GREEN} />
  </svg>
)

/* ── input field ──────────────────────────────────────── */
const InputField = ({ icon, type = 'text', placeholder, value, onChange }: {
  icon: React.ReactNode; type?: string; placeholder: string;
  value: string; onChange: (v: string) => void
}) => {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      border: `1.5px solid ${focused ? NAVY : BORDER}`,
      borderRadius: 50, padding: '0.75rem 1.25rem',
      background: WHITE, transition: 'border-color 0.2s',
    }}>
      <span style={{ color: focused ? NAVY : '#9ca3af', flexShrink: 0 }}>{icon}</span>
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          flex: 1, border: 'none', outline: 'none', background: 'transparent',
          fontFamily: 'Poppins, sans-serif', fontSize: '0.875rem', color: NAVY,
        }}
      />
    </div>
  )
}

/* ── green pill button ───────────────────────────────── */
const GreenBtn = ({ children, onClick, full }: { children: React.ReactNode; onClick?: () => void; full?: boolean }) => {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: full ? '100%' : 'auto',
        padding: '0.875rem 2rem',
        background: hov ? GREEND : GREEN,
        color: WHITE, fontFamily: 'Poppins, sans-serif',
        fontWeight: 600, fontSize: '0.95rem',
        border: 'none', borderRadius: 50, cursor: 'pointer',
        transition: 'background 0.2s', boxShadow: `0 4px 20px rgba(47,213,90,0.35)`,
      }}
    >{children}</button>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState('Liderança')
  const [menuOpen, setMenuOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [loginClosing, setLoginClosing] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  const openLogin = () => { setLoginClosing(false); setLoginOpen(true) }
  const closeLogin = () => {
    setLoginClosing(true)
    setTimeout(() => { setLoginOpen(false); setLoginClosing(false) }, 250)
  }

  return (
    <div style={{ background: BG, color: NAVY, fontFamily: 'Poppins, sans-serif', overflowX: 'hidden', minHeight: '100vh' }}>

      {/* ── Login Modal ────────────────────────────────── */}
      {loginOpen && (
        <div
          onClick={e => { if (e.target === e.currentTarget) closeLogin() }}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
            background: 'rgba(15,18,114,0.5)',
            backdropFilter: 'blur(8px)',
            animation: loginClosing ? 'modal-backdrop-out 0.25s ease forwards' : 'modal-backdrop-in 0.25s ease',
          }}
        >
          <div style={{
            width: '100%', maxWidth: '22rem',
            background: WHITE, borderRadius: 24,
            padding: '2.5rem 2rem',
            position: 'relative',
            boxShadow: '0 24px 64px rgba(15,18,114,0.2)',
            animation: loginClosing
              ? 'modal-panel-out 0.22s cubic-bezier(0.4,0,1,1) forwards'
              : 'modal-panel-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
          }}>
            {/* decorative circles */}
            <Circle size={60} color="rgba(47,213,90,0.12)" style={{ top: -20, right: -20 }} />
            <Circle size={30} color="rgba(249,115,22,0.18)" style={{ bottom: 30, left: -10 }} />

            <button onClick={closeLogin} style={{ position: 'absolute', top: 16, right: 20, color: '#9ca3af', fontSize: '1.2rem', lineHeight: 1, cursor: 'pointer', border: 'none', background: 'none' }}>✕</button>

            {/* logo */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <img src={logoImg} alt="Lidera360" style={{ height: 56, objectFit: 'contain' }} />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: NAVY, marginBottom: '1.5rem' }}>Login</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <InputField
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                placeholder="Email ou username."
                value={loginEmail} onChange={setLoginEmail}
              />
              <div style={{ position: 'relative' }}>
                <InputField
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Senha"
                  value={loginPassword} onChange={setLoginPassword}
                />
                <button
                  onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', border: 'none', background: 'none', cursor: 'pointer' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    {showPass
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                    }
                  </svg>
                </button>
              </div>
              <div style={{ textAlign: 'right' }}>
                <a href="#" style={{ fontSize: '0.8rem', fontWeight: 600, color: NAVY }}>Esqueceu sua senha?</a>
              </div>
              <GreenBtn full onClick={closeLogin}>Login</GreenBtn>

              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: MUTED, margin: '0.25rem 0' }}>Ou registre-se com</div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                {[
                  { label: 'G', color: '#ea4335' },
                  { label: 'f', color: '#1877f2' },
                  { label: 'X', color: '#000' },
                  { label: 'in', color: '#0a66c2' },
                ].map(s => (
                  <button key={s.label} style={{
                    width: 44, height: 44, borderRadius: '50%',
                    border: `1.5px solid ${BORDER}`, background: WHITE,
                    fontWeight: 700, color: s.color, fontSize: '0.85rem',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{s.label}</button>
                ))}
              </div>

              <p style={{ textAlign: 'center', fontSize: '0.8rem', color: MUTED }}>
                Não tem uma conta?{' '}
                <a href="#" style={{ color: NAVY, fontWeight: 700 }}>Registre-se</a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Menu overlay ───────────────────────────────── */}
      <div
        onClick={() => setMenuOpen(false)}
        style={{
          position: 'fixed', inset: 0, zIndex: 45,
          background: 'rgba(15,18,114,0.4)',
          backdropFilter: 'blur(4px)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s',
        }}
      />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 46,
        width: 'min(360px, 88vw)',
        background: WHITE,
        borderLeft: `2px solid ${GREEN}`,
        transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 48px rgba(15,18,114,0.15)',
        overflow: 'hidden',
      }}>
        <Circle size={200} color="rgba(47,213,90,0.07)" style={{ top: -60, right: -60 }} />
        <Circle size={120} color="rgba(249,115,22,0.07)" style={{ bottom: 40, left: -40 }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: `1px solid ${BORDER}`, position: 'relative', zIndex: 1 }}>
          <img src={logoImg} alt="Lidera360" style={{ height: 40, objectFit: 'contain' }} />
          <button onClick={() => setMenuOpen(false)} style={{ width: 36, height: 36, borderRadius: '50%', border: `1.5px solid ${BORDER}`, background: 'transparent', cursor: 'pointer', color: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem', gap: '0.25rem', position: 'relative', zIndex: 1 }}>
          {[
            { label: 'Cursos', sub: '400+ cursos disponíveis' },
            { label: 'Planos', sub: 'Starter, Business, Enterprise' },
            { label: 'Para Empresas', sub: 'Soluções corporativas' },
            { label: 'Blog', sub: 'Artigos sobre liderança e T&D' },
            { label: 'Sobre nós', sub: 'Conheça o Lidera360' },
          ].map(item => (
            <a key={item.label} href="#" onClick={() => setMenuOpen(false)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', borderRadius: 12, textDecoration: 'none', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = BG)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div>
                <p style={{ fontWeight: 600, fontSize: '1rem', color: NAVY }}>{item.label}</p>
                <p style={{ fontSize: '0.72rem', color: MUTED }}>{item.sub}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: GREEN }}>
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          ))}
        </nav>

        <div style={{ padding: '1.5rem', borderTop: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', zIndex: 1 }}>
          <button onClick={() => { setMenuOpen(false); openLogin() }}
            style={{ width: '100%', padding: '0.875rem', borderRadius: 50, border: `2px solid ${NAVY}`, background: 'transparent', color: NAVY, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
            Entrar na plataforma
          </button>
          <GreenBtn full onClick={() => setMenuOpen(false)}>Começar Grátis — 14 dias</GreenBtn>
          <p style={{ textAlign: 'center', fontSize: '0.7rem', color: MUTED }}>Sem cartão de crédito</p>
        </div>
      </div>

      {/* ── Nav ────────────────────────────────────────── */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40, background: 'rgba(255,255,255,0.95)', borderBottom: `1px solid ${BORDER}`, backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2.5rem', height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LogoMark size={28} />
            <span style={{ fontWeight: 800, fontSize: '1.2rem', color: NAVY }}>
              Lidera<span style={{ color: GREEN }}>360</span>
            </span>
          </a>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="hidden md:flex">
            {['Cursos', 'Planos', 'Para Empresas', 'Blog'].map(link => (
              <a key={link} href="#"
                style={{ fontSize: '0.8rem', fontWeight: 500, color: MUTED, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = NAVY)}
                onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
              >{link}</a>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={openLogin}
              className="hidden md:block"
              style={{ fontSize: '0.8rem', fontWeight: 600, color: NAVY, padding: '0.5rem 1.25rem', border: `2px solid ${NAVY}`, borderRadius: 50, cursor: 'pointer', background: 'transparent', fontFamily: 'Poppins, sans-serif', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = NAVY; e.currentTarget.style.color = WHITE }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = NAVY }}
            >Entrar</button>

            <a href="#"
              className="hidden md:flex"
              style={{ fontSize: '0.8rem', fontWeight: 600, color: WHITE, padding: '0.5rem 1.25rem', background: GREEN, borderRadius: 50, textDecoration: 'none', transition: 'background 0.2s', boxShadow: '0 2px 12px rgba(47,213,90,0.3)' }}
              onMouseEnter={e => (e.currentTarget.style.background = GREEND)}
              onMouseLeave={e => (e.currentTarget.style.background = GREEN)}
            >Começar Grátis</a>

            {/* hamburger */}
            <button onClick={() => setMenuOpen(v => !v)} aria-label="Menu"
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 5, width: 40, height: 40, border: `1.5px solid ${BORDER}`, borderRadius: 10, background: menuOpen ? BG : 'transparent', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s' }}>
              <span style={{ width: 16, height: 1.5, background: menuOpen ? GREEN : NAVY, borderRadius: 2, transition: '0.25s', transform: menuOpen ? 'rotate(45deg) translate(4.5px,4.5px)' : 'none' }} />
              <span style={{ width: 16, height: 1.5, background: menuOpen ? GREEN : NAVY, borderRadius: 2, opacity: menuOpen ? 0 : 1, transition: '0.2s' }} />
              <span style={{ width: 16, height: 1.5, background: menuOpen ? GREEN : NAVY, borderRadius: 2, transition: '0.25s', transform: menuOpen ? 'rotate(-45deg) translate(4.5px,-4.5px)' : 'none' }} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', paddingTop: '6.5rem', paddingBottom: '5rem' }}>
        {/* bg circles */}
        <Circle size={500} color="rgba(15,18,114,0.04)" style={{ top: -100, right: -150 }} />
        <Circle size={300} color="rgba(47,213,90,0.08)" style={{ bottom: -50, left: -80 }} />
        <Circle size={16} color={NAVY} style={{ top: 120, left: '12%' }} />
        <Circle size={10} color={ORANGE} style={{ top: 200, right: '18%' }} />
        <Circle size={22} color={GREEN} style={{ bottom: 80, right: '8%' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2.5rem', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gap: '3rem', alignItems: 'center' }} className="grid md:grid-cols-2 gap-12">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(47,213,90,0.12)', borderRadius: 50, padding: '0.35rem 1rem', marginBottom: '1.5rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: GREEN, display: 'inline-block' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: NAVY }}>Plataforma de T&D Corporativo</span>
              </div>
              <h1 style={{ fontSize: 'clamp(2.4rem,6vw,4.5rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>
                Treine equipes.<br />
                Forme <span style={{ color: GREEN }}>líderes.</span>
              </h1>
              <p style={{ fontSize: '1rem', lineHeight: 1.7, color: MUTED, maxWidth: '28rem', marginBottom: '2rem' }}>
                Mais de 400 cursos em áreas estratégicas, trilhas personalizadas por cargo e relatórios completos para gestores.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                <GreenBtn>
                  Testar 14 dias grátis
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 8 }}>
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </GreenBtn>
                <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: 600, color: NAVY, textDecoration: 'none' }}>
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <circle cx="18" cy="18" r="18" fill={NAVY} opacity="0.08"/>
                    <polygon points="15,12 26,18 15,24" fill={NAVY}/>
                  </svg>
                  Ver demonstração
                </a>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 60px rgba(15,18,114,0.15)', border: `2px solid ${BORDER}` }}>
                <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=520&fit=crop&auto=format" alt="Equipe em treinamento" style={{ width: '100%', height: 340, objectFit: 'cover', display: 'block' }} />
              </div>
              {/* stat pill 1 */}
              <div style={{ position: 'absolute', bottom: -20, left: 24, background: WHITE, borderRadius: 16, padding: '0.875rem 1.25rem', boxShadow: '0 8px 32px rgba(15,18,114,0.15)', border: `1px solid ${BORDER}` }}>
                <p style={{ fontSize: '1.8rem', fontWeight: 800, color: GREEN, lineHeight: 1 }}>94%</p>
                <p style={{ fontSize: '0.7rem', color: MUTED, marginTop: 2 }}>taxa de conclusão média</p>
              </div>
              {/* stat pill 2 */}
              <div style={{ position: 'absolute', top: -16, right: 24, background: NAVY, borderRadius: 16, padding: '0.75rem 1.125rem', boxShadow: '0 8px 32px rgba(15,18,114,0.25)' }}>
                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>Novos cursos este mês</p>
                <p style={{ fontSize: '1.4rem', fontWeight: 800, color: WHITE, lineHeight: 1 }}>+18</p>
              </div>
            </div>
          </div>

          {/* stats bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 1, background: BORDER, marginTop: '4rem', borderRadius: 16, overflow: 'hidden', border: `1px solid ${BORDER}` }} className="md:grid-cols-4">
            {[
              { val: '400+', label: 'Cursos disponíveis' },
              { val: '3.200+', label: 'Empresas clientes' },
              { val: '120 mil', label: 'Colaboradores ativos' },
              { val: '4,8★', label: 'Avaliação média' },
            ].map(s => (
              <div key={s.label} style={{ background: WHITE, padding: '1.25rem 1.5rem' }}>
                <p style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: GREEN, lineHeight: 1 }}>{s.val}</p>
                <p style={{ fontSize: '0.72rem', color: MUTED, marginTop: 4 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Courses ────────────────────────────────────── */}
      <section style={{ background: WHITE, padding: '5rem 0', position: 'relative', overflow: 'hidden' }}>
        <Circle size={300} color="rgba(47,213,90,0.05)" style={{ top: -80, right: -80 }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2.5rem', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: GREEN, marginBottom: '0.5rem' }}>Catálogo</p>
              <h2 style={{ fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', fontWeight: 800, lineHeight: 1.15 }}>
                Cursos para cada<br /><span style={{ color: GREEN }}>necessidade do negócio</span>
              </h2>
            </div>
            <a href="#" style={{ fontSize: '0.8rem', fontWeight: 600, color: NAVY, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              Ver catálogo completo
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
          </div>

          {/* tabs */}
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto', marginBottom: '1.5rem', paddingBottom: 2, scrollbarWidth: 'none' }}>
            {COURSE_TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.6rem 1.25rem', whiteSpace: 'nowrap',
                  fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                  background: activeTab === tab ? NAVY : 'transparent',
                  color: activeTab === tab ? WHITE : MUTED,
                  border: `2px solid ${activeTab === tab ? NAVY : BORDER}`,
                  borderRadius: 50,
                  marginRight: '0.5rem',
                  transition: 'all 0.2s',
                }}>
                {tab}
              </button>
            ))}
          </div>

          {/* cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1rem' }}>
            {COURSES[activeTab].map(course => {
              const lvColor = LEVEL_COLOR[course.level] ?? MUTED
              return (
                <div key={course.title}
                  style={{ background: WHITE, border: `1.5px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(15,18,114,0.12)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
                >
                  <div style={{ position: 'relative', height: 140, background: BG, overflow: 'hidden' }}>
                    <img src={`https://images.unsplash.com/${course.img}?w=400&h=240&fit=crop&auto=format`} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {course.tag && (
                      <span style={{ position: 'absolute', top: 10, left: 10, background: GREEN, color: WHITE, fontSize: '0.62rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 50 }}>{course.tag}</span>
                    )}
                  </div>
                  <div style={{ padding: '0.875rem 1rem' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem', lineHeight: 1.4 }}>{course.title}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: MUTED }}>{course.duration}</span>
                      <span style={{ fontSize: '0.62rem', fontWeight: 600, color: lvColor, border: `1.5px solid ${lvColor}`, borderRadius: 50, padding: '0.1rem 0.5rem' }}>{course.level}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────── */}
      <section style={{ background: BG, padding: '5rem 0', position: 'relative', overflow: 'hidden' }}>
        <Circle size={250} color="rgba(15,18,114,0.04)" style={{ bottom: -60, left: -60 }} />
        <Circle size={14} color={ORANGE} style={{ top: 60, right: '15%' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2.5rem', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: GREEN, marginBottom: '0.5rem' }}>Plataforma</p>
            <h2 style={{ fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', fontWeight: 800, lineHeight: 1.15 }}>
              Tudo que o RH precisa <span style={{ color: GREEN }}>em um só lugar</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }}>
            {FEATURES.map(f => (
              <div key={f.title}
                style={{ background: WHITE, border: `1.5px solid ${BORDER}`, borderRadius: 20, padding: '1.75rem', transition: 'box-shadow 0.2s, transform 0.2s', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(15,18,114,0.1)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(47,213,90,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: '1rem' }}>{f.icon}</div>
                <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem' }}>{f.title}</p>
                <p style={{ fontSize: '0.83rem', lineHeight: 1.65, color: MUTED }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────── */}
      <section style={{ background: WHITE, padding: '5rem 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: GREEN, marginBottom: '0.5rem' }}>Depoimentos</p>
            <h2 style={{ fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', fontWeight: 800 }}>O que dizem nossos <span style={{ color: GREEN }}>clientes</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ background: BG, border: `1.5px solid ${BORDER}`, borderRadius: 20, padding: '1.75rem' }}>
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                  {[1,2,3,4,5].map(i => <span key={i} style={{ color: ORANGE, fontSize: '1rem' }}>★</span>)}
                </div>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: '#374151', fontStyle: 'italic', marginBottom: '1.25rem' }}>"{t.quote}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img src={`https://images.unsplash.com/${t.img}?w=80&h=80&fit=crop&auto=format`} alt={t.name} style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${GREEN}` }} />
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>{t.name}</p>
                    <p style={{ fontSize: '0.72rem', color: MUTED }}>{t.role} · {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────── */}
      <section style={{ background: BG, padding: '5rem 0', position: 'relative', overflow: 'hidden' }}>
        <Circle size={350} color="rgba(47,213,90,0.06)" style={{ top: -100, right: -100 }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2.5rem', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: GREEN, marginBottom: '0.5rem' }}>Planos</p>
            <h2 style={{ fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', fontWeight: 800 }}>
              Invista no desenvolvimento. <span style={{ color: GREEN }}>Meça o retorno.</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1.25rem' }}>
            {PLANS.map(plan => (
              <div key={plan.name}
                style={{
                  background: plan.highlight ? NAVY : WHITE,
                  border: plan.highlight ? `2px solid ${GREEN}` : `1.5px solid ${BORDER}`,
                  borderRadius: 24,
                  padding: '2rem',
                  display: 'flex', flexDirection: 'column',
                  position: 'relative', overflow: 'hidden',
                  boxShadow: plan.highlight ? '0 16px 48px rgba(15,18,114,0.25)' : 'none',
                }}
              >
                {plan.highlight && <Circle size={200} color="rgba(47,213,90,0.08)" style={{ top: -60, right: -60 }} />}
                {plan.highlight && (
                  <span style={{ position: 'absolute', top: 16, right: 16, background: GREEN, color: WHITE, fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.75rem', borderRadius: 50 }}>Popular</span>
                )}
                <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: plan.highlight ? 'rgba(255,255,255,0.6)' : MUTED, marginBottom: '0.25rem', position: 'relative', zIndex: 1 }}>{plan.name}</p>
                <p style={{ fontSize: '0.83rem', color: plan.highlight ? 'rgba(255,255,255,0.7)' : MUTED, marginBottom: '1.25rem', position: 'relative', zIndex: 1 }}>{plan.desc}</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1, color: plan.highlight ? WHITE : NAVY }}>{plan.price}</span>
                  {plan.per && <span style={{ fontSize: '0.72rem', color: plan.highlight ? 'rgba(255,255,255,0.5)' : MUTED, marginBottom: 4 }}>{plan.per}</span>}
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1, marginBottom: '1.75rem', position: 'relative', zIndex: 1 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.83rem', color: plan.highlight ? 'rgba(255,255,255,0.85)' : '#374151' }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="8" fill={GREEN} opacity="0.15"/>
                        <path d="M4 8l2.5 2.5L12 5" stroke={GREEN} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.highlight
                  ? <GreenBtn full>{plan.cta}</GreenBtn>
                  : <button style={{ width: '100%', padding: '0.875rem', borderRadius: 50, border: `2px solid ${NAVY}`, background: 'transparent', color: NAVY, fontWeight: 600, fontSize: '0.83rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = NAVY; e.currentTarget.style.color = WHITE }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = NAVY }}
                    >{plan.cta}</button>
                }
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────── */}
      <section style={{ background: NAVY, padding: '5rem 0', position: 'relative', overflow: 'hidden' }}>
        <Circle size={400} color="rgba(47,213,90,0.08)" style={{ top: -120, right: -120 }} />
        <Circle size={200} color="rgba(249,115,22,0.08)" style={{ bottom: -60, left: -60 }} />
        <Circle size={12} color={ORANGE} style={{ top: '30%', left: '8%' }} />
        <Circle size={18} color={GREEN} style={{ bottom: '25%', right: '12%' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2.5rem', position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '2.5rem' }}>
          <div>
            <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: GREEN, marginBottom: '0.75rem' }}>Pronto para começar?</p>
            <h2 style={{ fontSize: 'clamp(1.8rem,4vw,3.2rem)', fontWeight: 800, color: WHITE, lineHeight: 1.1 }}>
              Sua equipe merece o melhor.<br />
              <span style={{ color: GREEN }}>Comece hoje.</span>
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' }}>
            <GreenBtn>Testar 14 dias grátis</GreenBtn>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', width: '100%' }}>Sem cartão de crédito · Cancele quando quiser</p>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer style={{ background: NAVYD, color: 'rgba(255,255,255,0.7)', padding: '3rem 0 2rem' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
            <div style={{ gridColumn: 'span 1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <LogoMark size={24} />
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: WHITE }}>Lidera<span style={{ color: GREEN }}>360</span></span>
              </div>
              <p style={{ fontSize: '0.78rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.45)' }}>Desenvolvimento que te leva mais longe.</p>
            </div>
            {[
              { title: 'Produto', links: ['Cursos', 'Trilhas', 'Dashboard', 'Certificados', 'Integrações'] },
              { title: 'Empresa', links: ['Sobre nós', 'Blog', 'Carreiras', 'Imprensa', 'Contato'] },
              { title: 'Suporte', links: ['Central de Ajuda', 'Documentação', 'LGPD', 'Termos de Uso'] },
            ].map(col => (
              <div key={col.title}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: GREEN, marginBottom: '1rem' }}>{col.title}</p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                      >{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.75rem' }}>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>© 2026 Lidera360. Todos os direitos reservados.</p>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>Feito no Brasil 🇧🇷</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
