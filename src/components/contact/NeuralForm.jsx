import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const INITIAL_VALUES = { name: '', email: '', message: '' }

const SOCIALS = [
  { label: 'GitHub',   icon: 'GH', href: 'https://github.com/' },
  { label: 'LinkedIn', icon: 'in', href: 'https://www.linkedin.com/' },
  { label: 'Kaggle',   icon: 'K',  href: 'https://www.kaggle.com/' },
]

const SOCIAL_SIZE  = 40   // node diameter px
const SOCIAL_GAP   = 80   // edge-to-edge gap px
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

function useClockTick() {
  const fmt = () => new Date().toUTCString().slice(17, 25)
  const [time, setTime] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 1000)
    return () => clearInterval(id)
  }, [])
  return time
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
        return (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => handleClick(i)}
            className="absolute grid place-items-center"
            style={{ width: SOCIAL_SIZE, height: SOCIAL_SIZE, left: cx - SOCIAL_SIZE / 2, top: 0 }}
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
                {social.icon}
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
  const BTN_LABEL    = { idle: 'Send Signal →', sending: 'Encoding...', success: 'Signal Sent' }[phase]

  return (
    <div className="fixed inset-0 z-10 flex flex-col items-center justify-center px-5 pointer-events-none">
      <div ref={cardRef} className="w-full max-w-md pointer-events-auto relative">

        {/* Signal beam — shoots upward on transmit */}
        <div
          ref={beamRef}
          className="absolute left-1/2 -translate-x-1/2 bottom-full opacity-0 pointer-events-none"
          style={{
            width: '1px',
            height: '130px',
            background: 'linear-gradient(0deg, #00d4ff 0%, rgba(0,212,255,0.4) 55%, transparent 100%)',
            boxShadow: '0 0 12px rgba(0,212,255,0.55)',
          }}
        />

        {/* Animated gradient border wrapper */}
        <div className="contact-card-outer relative">

          {/* Corner targeting brackets */}
          <div className="contact-corner contact-corner-tl" />
          <div className="contact-corner contact-corner-tr" />
          <div className="contact-corner contact-corner-bl" />
          <div className="contact-corner contact-corner-br" />

          {/* Scan line */}
          <div className="contact-scanline" />

          {/* Inner surface */}
          <div className="contact-card-inner p-5">

            {/* ── Status bar ── */}
            <div className="flex items-center justify-between mb-4">
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
            <div className="mb-0.5 font-['Space_Mono'] text-[9px] uppercase tracking-[0.3em] text-cyan-400/38">
              05 / Contact
            </div>
            <h2 className="mb-1 font-['Syne'] text-[27px] font-bold text-slate-50 leading-tight">
              Transmit a Signal
            </h2>
            <p className="mb-5 font-['Space_Mono'] text-[11px] text-slate-500 leading-relaxed">
              Let's build something intelligent together.
            </p>

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
                className="contact-send-btn w-full relative overflow-hidden px-5 py-3 font-['Space_Mono'] text-[13px] font-bold"
              >
                <div className="contact-send-sweep absolute inset-0 pointer-events-none" />
                <span className="relative z-10">{BTN_LABEL}</span>
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
                  Signal Received
                </div>
                <div className="font-['Space_Mono'] text-[11px] text-slate-500 tracking-wide">
                  Response will be initiated.
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Social network nodes ── */}
      <div className="mt-7 pointer-events-auto">
        <SocialNet />
      </div>

      {/* ── Footer ── */}
      <footer className="fixed bottom-4 left-0 right-0 z-10 px-5 text-center font-['Space_Mono'] text-[0.6rem] leading-6 text-slate-500/50 pointer-events-none select-none">
        <div>Built with Three.js · React · A passion for intelligence</div>
        <div>© 2025 Divit Aggarwal</div>
      </footer>
    </div>
  )
}
