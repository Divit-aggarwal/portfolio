import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const INITIAL_VALUES = { name: '', email: '', message: '' }
const SOCIALS = [
  { label: 'GitHub', icon: 'GH', href: 'https://github.com/' },
  { label: 'LinkedIn', icon: 'in', href: 'https://www.linkedin.com/' },
  { label: 'Kaggle', icon: 'K', href: 'https://www.kaggle.com/' },
]

function validate(values) {
  const nextErrors = {}
  if (!values.name.trim()) nextErrors.name = 'Name is required.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    nextErrors.email = 'Enter a valid email.'
  }
  if (values.message.trim().length < 8) {
    nextErrors.message = 'Message must be at least 8 characters.'
  }
  return nextErrors
}

export default function NeuralForm() {
  const cardRef = useRef()
  const formRef = useRef()
  const successRef = useRef()
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  function updateField(field, value) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function handleInvalid(nextErrors) {
    setErrors(nextErrors)
    window.dispatchEvent(new CustomEvent('contact:invalid-submit'))
    gsap.fromTo(cardRef.current, { x: -10 }, {
      x: 10,
      duration: 0.07,
      repeat: 5,
      yoyo: true,
      ease: 'power2.inOut',
      onComplete: () => gsap.to(cardRef.current, { x: 0, duration: 0.08 }),
    })
  }

  // Animate the success message after React renders it
  useEffect(() => {
    if (!success || !successRef.current) return
    gsap.fromTo(successRef.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
    )
  }, [success])

  function handleValid() {
    setErrors({})
    window.dispatchEvent(new CustomEvent('contact:valid-submit'))
    gsap.to(formRef.current, {
      opacity: 0,
      y: -12,
      duration: 0.35,
      ease: 'power2.inOut',
      onComplete: () => {
        setSuccess(true)
        setValues(INITIAL_VALUES)
      },
    })

    window.setTimeout(() => {
      gsap.to(successRef.current, {
        opacity: 0,
        y: 12,
        duration: 0.3,
        ease: 'power2.inOut',
        onComplete: () => {
          setSuccess(false)
          gsap.fromTo(formRef.current, { opacity: 0, y: 12 }, {
            opacity: 1,
            y: 0,
            duration: 0.35,
            ease: 'power2.out',
          })
        },
      })
    }, 3000)
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate(values)
    if (Object.keys(nextErrors).length) {
      handleInvalid(nextErrors)
      return
    }
    handleValid()
  }

  return (
    <div className="fixed inset-0 z-10 flex flex-col items-center justify-center px-5 py-8 pointer-events-none">
      <div
        ref={cardRef}
        className="w-full max-w-md border border-cyan-500/20 bg-black/70 p-6 shadow-[0_0_40px_rgba(0,212,255,0.10)] backdrop-blur-md pointer-events-auto"
      >
        <div className="mb-5 text-xs uppercase tracking-[0.22em] text-cyan-300/70">
          05 / Contact
        </div>
        <h2 className="mb-6 font-['Syne'] text-3xl font-bold leading-tight text-slate-100">
          Transmit a Signal
        </h2>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className={success ? 'pointer-events-none opacity-0' : 'space-y-4'}
          noValidate
        >
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-slate-400">Name</span>
            <input
              value={values.name}
              onChange={(event) => updateField('name', event.target.value)}
              className="w-full border border-slate-700 bg-slate-950/80 px-4 py-3 font-['Space_Mono'] text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:shadow-[0_0_18px_rgba(0,212,255,0.18)]"
              placeholder="Divit Aggarwal"
            />
            {errors.name && <span className="mt-2 block text-xs text-red-400">{errors.name}</span>}
          </label>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-slate-400">Email</span>
            <input
              value={values.email}
              onChange={(event) => updateField('email', event.target.value)}
              className="w-full border border-slate-700 bg-slate-950/80 px-4 py-3 font-['Space_Mono'] text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:shadow-[0_0_18px_rgba(0,212,255,0.18)]"
              placeholder="signal@domain.ai"
              type="email"
            />
            {errors.email && <span className="mt-2 block text-xs text-red-400">{errors.email}</span>}
          </label>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-slate-400">Message</span>
            <textarea
              value={values.message}
              onChange={(event) => updateField('message', event.target.value)}
              className="min-h-28 w-full resize-none border border-slate-700 bg-slate-950/80 px-4 py-3 font-['Space_Mono'] text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:shadow-[0_0_18px_rgba(0,212,255,0.18)]"
              placeholder="Tell me what you want to build..."
            />
            {errors.message && <span className="mt-2 block text-xs text-red-400">{errors.message}</span>}
          </label>

          <button
            type="submit"
            className="w-full border border-cyan-400 px-5 py-3 font-['Space_Mono'] text-sm font-bold text-cyan-200 shadow-[0_0_18px_rgba(0,212,255,0.24)] transition hover:bg-cyan-400 hover:text-black"
          >
            Send Signal -&gt;
          </button>
        </form>

        {success && (
          <div
            ref={successRef}
            className="py-20 text-center font-['Space_Mono'] text-sm text-emerald-300 opacity-0"
          >
            Signal transmitted successfully ✓
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-5 pointer-events-auto">
        {SOCIALS.map((social, index) => (
          <a
            key={social.label}
            href={social.href}
            className="contact-social-orbit relative grid h-11 w-11 place-items-center border border-cyan-500/25 bg-black/50 font-['Space_Mono'] text-xs font-bold text-cyan-200 backdrop-blur-sm transition hover:border-cyan-300 hover:text-white"
            style={{ animationDelay: `${index * 0.35}s` }}
            aria-label={social.label}
          >
            <span>{social.icon}</span>
            <span className="orbit-dot" style={{ animationDelay: `${index * 0.35}s` }} />
          </a>
        ))}
      </div>

      <footer className="fixed bottom-5 left-0 right-0 z-10 px-5 text-center font-['Space_Mono'] text-[0.65rem] leading-6 text-slate-400/70 pointer-events-none">
        <div>Built with Three.js · React · A passion for intelligence</div>
        <div>© 2025 Divit Aggarwal</div>
      </footer>
    </div>
  )
}
