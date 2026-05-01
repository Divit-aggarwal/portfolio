import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { GitBranch, Link2, Mail, SendHorizontal } from 'lucide-react'

const INITIAL_VALUES = { name: '', email: '', message: '' }
const CONTACT_EMAIL = 'theagihustler@gmail.com'

const SOCIALS = [
  { label: 'GitHub', icon: GitBranch, fallback: 'GH', href: 'https://github.com/Divit-aggarwal' },
  { label: 'LinkedIn', icon: Link2, fallback: 'in', href: 'https://in.linkedin.com/in/divit-aggarwal-' },
  { label: 'Email', icon: Mail, fallback: '@', href: `mailto:${CONTACT_EMAIL}` },
]

const CONTACT_POINTS = [
  { label: 'Focus', value: 'Data + Applied AI' },
  { label: 'Mode', value: 'Remote / Hybrid' },
  { label: 'Reply', value: 'Usually <24h' },
]

const SOCIAL_SIZE  = 38   // node diameter px
const SOCIAL_GAP   = 58   // edge-to-edge gap px
const SOCIAL_STEP  = SOCIAL_SIZE + SOCIAL_GAP  // center-to-center
const SOCIAL_TOTAL = SOCIALS.length * SOCIAL_SIZE + (SOCIALS.length - 1) * SOCIAL_GAP
// node i center-x = SOCIAL_SIZE/2 + i * SOCIAL_STEP

function nodeCenter(i) { return SOCIAL_SIZE / 2 + i * SOCIAL_STEP }

function validate(values) {
  const errs = {}
  if (!values.name.trim()) errs.name = 'Required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errs.email = 'Invalid'
  if (values.message.trim().length < 8) errs.message = 'Min 8 chars'
  return errs
}

function buildMailtoUrl(values) {
  const name = values.name.trim()
  const email = values.email.trim()
  const message = values.message.trim()
  const subject = `Portfolio inquiry from ${name}`
  const body = [
    `Name: ${name}`,
    `Email: ${email}`,
    '',
    'Message:',
    message,
  ].join('\n')

  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

function useClockTick() {
  const fmt = () => new Date().toUTCString().slice(17, 25)
  const [time, setTime] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

function ContactBackdrop() {
  return (
    <div className="contact-backdrop" aria-hidden="true">
      <div className="contact-grid" />
      <div className="contact-orbit contact-orbit-a" />
      <div className="contact-orbit contact-orbit-b" />
      <div className="contact-beam contact-beam-a" />
      <div className="contact-beam contact-beam-b" />
      {[...Array(12)].map((_, i) => (
        <span
          key={i}
          className="contact-particle"
          style={{
            '--x': `${8 + ((i * 23) % 86)}%`,
            '--y': `${12 + ((i * 31) % 72)}%`,
            '--d': `${i * 0.35}s`,
          }}
        />
      ))}
    </div>
  )
}

// ─── Signal input field ──────────────────────────────────────────────────────
function SignalField({ label, fieldName, value, onChange, error, type = 'text', placeholder, multiline = false }) {
  const [focused, setFocused] = useState(false)
  const shimRef  = useRef()
  const prevLen  = useRef(0)

  useEffect(() => {
    if (!shimRef.current) return
    if (value.length !== prevLen.current) {
      gsap.fromTo(shimRef.current,
        { x: '-100%', opacity: 0.7 },
        { x: '100%', opacity: 0, duration: 0.55, ease: 'power2.out' }
      )
    }
    prevLen.current = value.length
  }, [value])

  const Tag = multiline ? 'textarea' : 'input'
  const borderColor = error ? 'rgba(239,68,68,0.5)' : focused ? 'rgba(0,212,255,0.6)' : 'rgba(0,212,255,0.1)'
  const shadowStr   = error
    ? '0 0 14px rgba(239,68,68,0.09)'
    : focused
      ? '0 0 20px rgba(0,212,255,0.11), inset 0 1px 0 rgba(0,212,255,0.04)'
      : 'none'

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span
          className="font-['Space_Mono'] text-[9px] uppercase tracking-[0.28em] transition-colors duration-300"
          style={{ color: focused ? 'rgba(0,212,255,0.88)' : 'rgba(0,212,255,0.38)' }}
        >
          {label}
        </span>
        {error && (
          <span className="font-['Space_Mono'] text-[9px] text-red-400 tracking-wider">{error}</span>
        )}
      </div>

      <div
        className="relative overflow-hidden transition-all duration-300"
        style={{ background: 'rgba(0,10,22,0.88)', border: `1px solid ${borderColor}`, boxShadow: shadowStr }}
      >
        {/* Left accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[2px] transition-all duration-300"
          style={{
            background: focused
              ? 'linear-gradient(180deg, transparent, rgba(0,212,255,0.75), transparent)'
              : 'transparent',
          }}
        />
        {/* Typing shimmer */}
        <div
          ref={shimRef}
          className="absolute inset-y-0 w-2/3 pointer-events-none opacity-0"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.07), transparent)' }}
        />
        <Tag
          value={value}
          onChange={e => onChange(fieldName, e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          type={!multiline ? type : undefined}
          placeholder={placeholder}
          className="w-full bg-transparent pl-4 pr-3 py-2.5 font-['Space_Mono'] text-[13px] text-slate-100 outline-none placeholder:text-slate-700 relative z-10"
          style={{ resize: multiline ? 'none' : undefined, minHeight: multiline ? '84px' : undefined }}
          noValidate
        />
      </div>
    </div>
  )
}

// ─── Social node network ─────────────────────────────────────────────────────
function SocialNet() {
  const [hovered, setHovered]   = useState(null)
  const [rippleIdx, setRipple]  = useState(null)

  function handleClick(i) {
    setRipple(i)
    setTimeout(() => setRipple(null), 650)
  }

  return (
    <div className="relative" style={{ width: SOCIAL_TOTAL, height: SOCIAL_SIZE + 24 }}>
      {/* SVG connection lines */}
      <svg
        className="absolute inset-0 overflow-visible pointer-events-none"
        width={SOCIAL_TOTAL}
        height={SOCIAL_SIZE}
      >
        {SOCIALS.slice(0, -1).map((_, i) => {
          const active = hovered === i || hovered === i + 1
          return (
            <g key={i}>
              <line
                x1={nodeCenter(i)} y1={SOCIAL_SIZE / 2}
                x2={nodeCenter(i + 1)} y2={SOCIAL_SIZE / 2}
                stroke="rgba(0,212,255,0.14)"
                strokeWidth="1"
                strokeDasharray="4 5"
              />
              <line
                x1={nodeCenter(i)} y1={SOCIAL_SIZE / 2}
                x2={nodeCenter(i + 1)} y2={SOCIAL_SIZE / 2}
                stroke="rgba(0,212,255,0.72)"
                strokeWidth="1.5"
                opacity={active ? 1 : 0}
                style={{ transition: 'opacity 0.28s ease' }}
              />
            </g>
          )
        })}
      </svg>

      {/* Nodes */}
      {SOCIALS.map((social, i) => {
        const isHov = hovered === i
        const cx = nodeCenter(i)
        const Icon = social.icon
        return (
          <a
            key={social.label}
            href={social.href || undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
            aria-disabled={!social.href}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onClick={(event) => {
              if (!social.href) event.preventDefault()
              handleClick(i)
            }}
            className="absolute grid place-items-center"
            style={{
              width: SOCIAL_SIZE,
              height: SOCIAL_SIZE,
              left: cx - SOCIAL_SIZE / 2,
              top: 0,
              cursor: social.href ? 'pointer' : 'not-allowed',
            }}
          >
            {/* Ripple */}
            {rippleIdx === i && (
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  animation: 'contactNodeRipple 0.65s ease-out forwards',
                  border: '1px solid rgba(0,212,255,0.65)',
                }}
              />
            )}
            {/* Circle */}
            <div
              className="w-full h-full rounded-full flex items-center justify-center transition-all duration-300"
              style={{
                border: `1px solid ${isHov ? 'rgba(0,212,255,0.75)' : 'rgba(0,212,255,0.2)'}`,
                background: isHov ? 'rgba(0,212,255,0.09)' : 'rgba(0,8,18,0.85)',
                boxShadow: isHov
                  ? '0 0 20px rgba(0,212,255,0.38), 0 0 8px rgba(0,212,255,0.18)'
                  : '0 0 5px rgba(0,212,255,0.04)',
                transform: isHov ? 'scale(1.2)' : 'scale(1)',
              }}
            >
              <span
                className="font-['Space_Mono'] text-xs font-bold transition-colors duration-300"
                style={{ color: isHov ? '#00d4ff' : 'rgba(0,212,255,0.42)' }}
              >
                {Icon ? <Icon size={15} strokeWidth={1.8} /> : social.fallback}
              </span>
            </div>
            {/* Label */}
            <span
              className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 font-['Space_Mono'] text-[8px] tracking-[0.2em] uppercase whitespace-nowrap transition-colors duration-300"
              style={{ color: isHov ? 'rgba(0,212,255,0.72)' : 'rgba(0,212,255,0.24)' }}
            >
              {social.label}
            </span>
          </a>
        )
      })}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function NeuralForm() {
  const cardRef    = useRef()
  const formRef    = useRef()
  const successRef = useRef()
  const buttonRef  = useRef()
  const beamRef    = useRef()

  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [phase,  setPhase]  = useState('idle') // idle | sending | success

  const time = useClockTick()

  function updateField(field, value) {
    setValues(c => ({ ...c, [field]: value }))
    setErrors(c => ({ ...c, [field]: undefined }))
    window.dispatchEvent(new CustomEvent('contact:typing'))
  }

  function handleInvalid(nextErrors) {
    setErrors(nextErrors)
    window.dispatchEvent(new CustomEvent('contact:invalid-submit'))
    gsap.fromTo(cardRef.current, { x: -8 }, {
      x: 8, duration: 0.07, repeat: 5, yoyo: true, ease: 'power2.inOut',
      onComplete: () => gsap.to(cardRef.current, { x: 0, duration: 0.08 }),
    })
  }

  function handleValid() {
    setErrors({})
    setPhase('sending')
    window.dispatchEvent(new CustomEvent('contact:valid-submit'))
    window.location.href = buildMailtoUrl(values)

    // Button compress
    gsap.to(buttonRef.current, {
      scaleY: 0.88, duration: 0.1, ease: 'power2.in',
      onComplete: () => gsap.to(buttonRef.current, { scaleY: 1, duration: 0.22, ease: 'back.out(2)' }),
    })

    // Signal beam shoots upward
    if (beamRef.current) {
      gsap.fromTo(beamRef.current,
        { scaleY: 0, opacity: 1 },
        { scaleY: 1, opacity: 0, duration: 0.85, ease: 'power3.out', transformOrigin: 'bottom center' }
      )
    }

    // Fade out form → show success
    setTimeout(() => {
      gsap.to(formRef.current, {
        opacity: 0, y: -10, duration: 0.35, ease: 'power2.inOut',
        onComplete: () => { setPhase('success'); setValues(INITIAL_VALUES) },
      })
    }, 700)

    // Return to idle after 4.2s total
    setTimeout(() => {
      if (!successRef.current) return
      gsap.to(successRef.current, {
        opacity: 0, y: 10, duration: 0.3, ease: 'power2.inOut',
        onComplete: () => {
          setPhase('idle')
          gsap.fromTo(formRef.current,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
          )
        },
      })
    }, 4200)
  }

  // Animate success panel in once it mounts
  useEffect(() => {
    if (phase !== 'success' || !successRef.current) return
    gsap.fromTo(successRef.current,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.55, ease: 'back.out(1.2)' }
    )
  }, [phase])

  function handleSubmit(e) {
    e.preventDefault()
    if (phase === 'sending') return
    const errs = validate(values)
    if (Object.keys(errs).length) { handleInvalid(errs); return }
    handleValid()
  }

  const STATUS_COLOR = { idle: '#00d4ff', sending: '#f59e0b', success: '#10b981' }[phase]
  const STATUS_LABEL = { idle: 'SYSTEM READY', sending: 'ENCODING MESSAGE...', success: 'SIGNAL TRANSMITTED' }[phase]
  const BTN_LABEL    = { idle: 'Open Email Draft', sending: 'Encoding...', success: 'Draft Opened' }[phase]

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto px-5 py-8 pointer-events-none">
      <ContactBackdrop />

      <div className="contact-stack">
        <section className="contact-content-width text-center">
          <div className="mb-3 font-['Space_Mono'] text-[10px] uppercase tracking-[0.28em] text-cyan-300/65">
            06 / Contact
          </div>

          <h2 className="mx-auto mb-3 max-w-[10.75ch] font-['Syne'] text-[clamp(1.9rem,3.85vw,2.85rem)] font-extrabold leading-[1.03] text-slate-50">
            Build the next intelligent system.
          </h2>

          <p className="mx-auto mb-5 max-w-[460px] font-['Space_Mono'] text-[0.7rem] leading-6 text-slate-400">
            Send a concise brief. I&apos;ll reply with the clearest next step for the data,
            model, or applied AI workflow you want to ship.
          </p>

          <div className="mx-auto grid max-w-[460px] grid-cols-3 gap-2">
            {CONTACT_POINTS.map((item) => (
              <div
                key={item.label}
                className="contact-info-chip"
              >
                <div className="mb-1 font-['Space_Mono'] text-[9px] uppercase tracking-[0.22em] text-cyan-300/45">
                  {item.label}
                </div>
                <div className="font-['Space_Mono'] text-[11px] leading-5 text-slate-200">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div ref={cardRef} className="w-full max-w-[460px] relative">

        {/* Signal beam — shoots upward on transmit */}
        <div
          ref={beamRef}
          className="absolute left-1/2 -translate-x-1/2 bottom-full opacity-0 pointer-events-none"
          style={{
            width: '2px',
            height: '180px',
            background: 'linear-gradient(0deg, #00d4ff 0%, rgba(139,92,246,0.45) 48%, transparent 100%)',
            boxShadow: '0 0 18px rgba(0,212,255,0.7)',
          }}
        />

        {/* Animated gradient border wrapper */}
        <div className="contact-card-outer relative contact-card-lift">

          {/* Corner targeting brackets */}
          <div className="contact-corner contact-corner-tl" />
          <div className="contact-corner contact-corner-tr" />
          <div className="contact-corner contact-corner-bl" />
          <div className="contact-corner contact-corner-br" />

          {/* Scan line */}
          <div className="contact-scanline" />

          {/* Inner surface */}
          <div className="contact-card-inner p-5 sm:p-6">

            {/* ── Status bar ── */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div
                  className={`w-1.5 h-1.5 rounded-full${phase === 'idle' ? ' contact-status-dot' : ''}`}
                  style={{ background: STATUS_COLOR, boxShadow: `0 0 6px ${STATUS_COLOR}`, '--sc': STATUS_COLOR }}
                />
                <span className="font-['Space_Mono'] text-[9px] tracking-[0.28em]" style={{ color: STATUS_COLOR }}>
                  {STATUS_LABEL}
                </span>
              </div>
              <span className="font-['Space_Mono'] text-[9px] text-slate-600 tabular-nums select-none">
                {time} UTC
              </span>
            </div>

            {/* ── Header ── */}
            <div className="mb-5 text-center">
              <div>
                <h3 className="mb-1 font-['Syne'] text-[30px] font-bold text-slate-50 leading-tight">
                  Transmit a Signal
                </h3>
                <p className="font-['Space_Mono'] text-[11px] text-slate-500 leading-relaxed">
                  Your message opens as a ready-to-send email draft.
                </p>
              </div>
            </div>

            {/* ── Form (hidden during success) ── */}
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="space-y-3"
              style={{ visibility: phase === 'success' ? 'hidden' : 'visible', position: phase === 'success' ? 'absolute' : 'relative' }}
              noValidate
            >
              <SignalField label="Sender ID" fieldName="name"    value={values.name}    onChange={updateField} error={errors.name}    placeholder="Your name"             />
              <SignalField label="Channel"   fieldName="email"   value={values.email}   onChange={updateField} error={errors.email}   placeholder="signal@domain.ai" type="email" />
              <SignalField label="Payload"   fieldName="message" value={values.message} onChange={updateField} error={errors.message} placeholder="What do you want to build?" multiline />

              <button
                ref={buttonRef}
                type="submit"
                disabled={phase === 'sending'}
                className="contact-send-btn w-full relative overflow-hidden px-5 py-3.5 font-['Space_Mono'] text-[13px] font-bold"
              >
                <div className="contact-send-sweep absolute inset-0 pointer-events-none" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {BTN_LABEL}
                  <SendHorizontal size={15} strokeWidth={1.8} />
                </span>
              </button>
            </form>

            {/* ── Success panel ── */}
            {phase === 'success' && (
              <div ref={successRef} className="py-10 text-center opacity-0">
                <div
                  className="font-['Space_Mono'] text-[42px] leading-none mb-3"
                  style={{ color: '#10b981', textShadow: '0 0 28px rgba(16,185,129,0.55)' }}
                >
                  ✓
                </div>
                <div className="font-['Syne'] text-lg font-bold text-emerald-300 mb-1.5">
                  Email Draft Opened
                </div>
                <div className="font-['Space_Mono'] text-[11px] text-slate-500 tracking-wide">
                  Review and send it from your mail app.
                </div>
              </div>
            )}

          </div>
        </div>
        </div>

        <div className="flex w-full justify-center">
          <SocialNet />
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="fixed bottom-4 left-0 right-0 z-10 px-5 text-center font-['Space_Mono'] text-[0.6rem] leading-6 text-slate-500/50 pointer-events-none select-none">
        <div>Built with Three.js · React · A passion for intelligence</div>
        <div>© 2026 Divit Aggarwal</div>
      </footer>
    </div>
  )
}
