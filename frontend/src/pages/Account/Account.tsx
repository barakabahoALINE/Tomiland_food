import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  loginUser,
  registerUser,
  verifyOTP,
  resendOTP,
  clearAuthError,
} from '../../store/slices/auth/authSlice'
import logo from '../../assets/logo.png'

type Mode = 'login' | 'signup' | 'forgot'

const OTP_LENGTH = 6
const RESEND_COOLDOWN = 60 // seconds

export default function AccountPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { isAuthenticated, user, status, error, pendingVerification, pendingEmail } =
    useAppSelector((state) => state.auth)

  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [cooldown, setCooldown] = useState(0)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Redirect after successful login
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = (location.state as { from?: { pathname?: string; search?: string; hash?: string } } | null)?.from
      const destination =
        from?.pathname?.startsWith('/') && !from.pathname.startsWith('//')
          ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
          : '/products'
      navigate(destination, { replace: true })
    }
  }, [isAuthenticated, user, location.state, navigate])

  // Clear error when switching mode
  const switchMode = (next: Mode) => {
    setMode(next)
    setInfoMessage(null)
    dispatch(clearAuthError())
  }

  // Quick autofill for demo / testing
  const handleQuickFill = (role: 'customer' | 'admin') => {
    if (role === 'admin') {
      setEmail('admin@tomiland.com')
      setPassword('Admin@123456')
    } else {
      setEmail('demo@tomiland.com')
      setPassword('Demo@123456')
    }
    setMode('login')
    setInfoMessage(`Filled credentials for ${role === 'admin' ? 'Admin' : 'Demo Customer'}. Click "Log in" below.`)
  }

  // ── Login / Register submit ────────────────────────────────────────────────
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    dispatch(clearAuthError())
    setInfoMessage(null)

    if (mode === 'login') {
      await dispatch(loginUser({ email: email.trim().toLowerCase(), password }))
    } else if (mode === 'signup') {
      const [first_name = '', ...rest] = name.trim().split(' ')
      await dispatch(
        registerUser({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          phone_number: phone.trim(),
          ...(first_name ? { first_name } : {}),
          ...(rest.length ? { last_name: rest.join(' ') } : {}),
        }),
      )
      startCooldown()
    }
  }

  // ── OTP input handling ─────────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const next = [...otp]
    next[index] = value.slice(-1)
    setOtp(next)
    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    event.preventDefault()
    const next = [...otp]
    pasted.split('').forEach((char, i) => { next[i] = char })
    setOtp(next)
    otpRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus()
  }

  // ── OTP verify submit ──────────────────────────────────────────────────────
  const handleVerifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    dispatch(clearAuthError())
    const code = otp.join('')
    if (code.length < OTP_LENGTH) return

    const result = await dispatch(verifyOTP({ email: pendingEmail!, otp: code }))
    if (verifyOTP.fulfilled.match(result)) {
      // Auto-login after successful verification
      await dispatch(loginUser({ email: pendingEmail!, password }))
    }
  }

  // ── Resend OTP ─────────────────────────────────────────────────────────────
  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN)
    if (cooldownRef.current) clearInterval(cooldownRef.current)
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(cooldownRef.current!); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const handleResend = async () => {
    if (cooldown > 0 || !pendingEmail) return
    dispatch(clearAuthError())
    const result = await dispatch(resendOTP(pendingEmail))
    if (resendOTP.fulfilled.match(result)) {
      setOtp(['', '', '', '', '', ''])
      startCooldown()
      otpRefs.current[0]?.focus()
    }
  }

  const isLoading = status === 'loading'

  // ── OTP verification screen ────────────────────────────────────────────────
  if (pendingVerification && pendingEmail) {
    return (
      <main className="min-h-screen bg-[#f5f1ea] px-4 py-8 text-[#1e2a22] sm:px-6 lg:px-8">
        {/* Top bar with back button */}
        <div className="mx-auto mb-6 flex max-w-[1000px] items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="group inline-flex items-center gap-2 rounded-full border border-[#dfe7e2] bg-white px-4 py-2 text-xs font-bold text-[#2f7a4f] shadow-sm transition hover:border-[#2f7a4f] hover:bg-[#edf6ee]"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            <span>Back to Home</span>
          </button>
          <span className="text-xs font-semibold text-[#5a6762]">Step 2 of 2: Email Verification</span>
        </div>

        <div className="mx-auto grid max-w-[1000px] overflow-hidden rounded-[28px] border border-[#dfe7e2] bg-white shadow-xl shadow-black/5 md:grid-cols-[0.9fr_1.1fr]">
          {/* Left panel */}
          <div className="flex flex-col justify-between bg-gradient-to-br from-[#eaf3eb] to-[#d8ebd9] p-8 lg:p-10">
            <div>
              <Link to="/" className="inline-flex items-center gap-3">
                <img src={logo} alt="Tomiland Foods logo" className="h-11 w-11 rounded-full object-cover shadow-sm" />
                <span className="font-syne text-lg font-black tracking-tight text-[#2f7a4f]">Tomiland Foods</span>
              </Link>
              <p className="mt-10 inline-block rounded-full bg-[#2f7a4f]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#2f7a4f]">
                Security Verification
              </p>
              <h1 className="mt-3 font-syne text-3xl font-black tracking-tight text-[#16231a] sm:text-4xl">
                Check your email for a verification code.
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-[#41544a]">
                We sent a 6-digit verification code to <strong className="text-[#16231a] underline decoration-[#2f7a4f]/40 underline-offset-4">{pendingEmail}</strong>. Enter it below to activate your account.
              </p>
            </div>
            <div className="mt-8 rounded-2xl border border-[#2f7a4f]/20 bg-white/60 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold text-[#374b40]">⏱️ Code expires in 5 minutes.</p>
              <p className="mt-1 text-[11px] text-[#52645a]">Check your spam folder if it doesn't appear within a minute.</p>
            </div>
          </div>

          {/* Right panel — OTP form */}
          <div className="p-8 sm:p-10">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2f7a4f]">Account Security</p>
              <button
                type="button"
                onClick={() => { dispatch(clearAuthError()); switchMode('signup') }}
                className="text-xs font-bold text-[#5a6762] hover:text-[#2f7a4f]"
              >
                Change Email
              </button>
            </div>
            <h2 className="mt-2 font-syne text-2xl font-black tracking-tight text-[#16231a] sm:text-3xl">
              Enter the 6-digit code
            </h2>
            <p className="mt-1.5 text-sm text-[#5a6762]">Type the digits sent to your inbox to finish signing up.</p>

            <form onSubmit={handleVerifyOtp} className="mt-8">
              {/* OTP boxes */}
              <div className="flex justify-between gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className={`h-14 w-full rounded-2xl border text-center font-syne text-2xl font-black outline-none transition
                      ${digit ? 'border-[#2f7a4f] bg-[#edf6ee] text-[#2f7a4f] shadow-sm' : 'border-[#dfe7e2] bg-[#fafafa] text-[#1e2a22]'}
                      focus:border-[#2f7a4f] focus:bg-white focus:ring-4 focus:ring-[#2f7a4f]/15`}
                    aria-label={`OTP digit ${index + 1}`}
                  />
                ))}
              </div>

              {error && (
                <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || otp.join('').length < OTP_LENGTH}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#2f7a4f] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#2f7a4f]/25 transition hover:bg-[#256340] hover:shadow-[#2f7a4f]/35 active:scale-[0.99] disabled:opacity-50 disabled:shadow-none"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Verifying Code…</span>
                  </>
                ) : (
                  'Verify & Activate Account →'
                )}
              </button>
            </form>

            {/* Resend */}
            <div className="mt-6 flex items-center justify-between rounded-xl bg-[#f8faf8] p-3 text-xs">
              <span className="text-[#5a6762]">Didn't get the code?</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || isLoading}
                className="font-bold text-[#2f7a4f] transition hover:underline disabled:opacity-50"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code now'}
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // ── Already logged in ──────────────────────────────────────────────────────
  if (isAuthenticated && user) {
    return (
      <main className="min-h-screen bg-[#f5f1ea] px-4 py-8 text-[#1e2a22] sm:px-6 lg:px-8">
        <div className="mx-auto mb-6 flex max-w-[1000px] items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="group inline-flex items-center gap-2 rounded-full border border-[#dfe7e2] bg-white px-4 py-2 text-xs font-bold text-[#2f7a4f] shadow-sm transition hover:border-[#2f7a4f] hover:bg-[#edf6ee]"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            <span>Back to Home</span>
          </button>
        </div>

        <div className="mx-auto grid max-w-[1000px] overflow-hidden rounded-[28px] border border-[#dfe7e2] bg-white shadow-xl shadow-black/5 md:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col justify-between bg-gradient-to-br from-[#eaf3eb] to-[#d8ebd9] p-8 lg:p-10">
            <div>
              <Link to="/" className="inline-flex items-center gap-3">
                <img src={logo} alt="Tomiland Foods logo" className="h-11 w-11 rounded-full object-cover shadow-sm" />
                <span className="font-syne text-lg font-black tracking-tight text-[#2f7a4f]">Tomiland Foods</span>
              </Link>
              <p className="mt-10 inline-block rounded-full bg-[#2f7a4f]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#2f7a4f]">
                Authenticated User
              </p>
              <h1 className="mt-3 font-syne text-3xl font-black tracking-tight text-[#16231a] sm:text-4xl">
                You are currently signed in.
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-[#41544a]">
                Access fresh farm harvests, artisanal groceries, and swift door-to-door delivery across Kigali.
              </p>
            </div>
            <p className="mt-8 text-xs font-bold text-[#2f7a4f]">Logged in as: {user.role.toUpperCase()}</p>
          </div>

          <div className="flex flex-col justify-center p-8 sm:p-10">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf6ee] font-syne text-2xl font-black text-[#2f7a4f]">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-syne text-2xl font-black text-[#16231a]">{user.name}</h2>
                <p className="text-sm text-[#5a6762]">{user.email}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={() => navigate('/products')}
                className="w-full rounded-full bg-[#2f7a4f] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#2f7a4f]/25 transition hover:bg-[#256340] active:scale-[0.99]"
              >
                Browse Fresh Products →
              </button>
              {user.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="w-full rounded-full border border-[#2f7a4f] bg-white px-5 py-3 text-sm font-bold text-[#2f7a4f] transition hover:bg-[#edf6ee]"
                >
                  Go to Admin Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    )
  }

  // ── Login / Signup form ────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#f5f1ea] px-4 py-8 text-[#1e2a22] sm:px-6 lg:px-8">
      {/* Top back navigation bar */}
      <div className="mx-auto mb-6 flex max-w-[1020px] items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="group inline-flex items-center gap-2 rounded-full border border-[#dfe7e2] bg-white px-4 py-2 text-xs font-bold text-[#2f7a4f] shadow-sm transition hover:border-[#2f7a4f] hover:bg-[#edf6ee] active:scale-95"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          <span>Back</span>
        </button>

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#5a6762] transition hover:text-[#2f7a4f]"
        >
          <span>Home</span>
          <span>•</span>
          <span>{mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Reset Password'}</span>
        </Link>
      </div>

      <div className="mx-auto grid max-w-[1020px] overflow-hidden rounded-[28px] border border-[#dfe7e2] bg-white shadow-xl shadow-black/5 md:grid-cols-[0.9fr_1.1fr]">
        {/* Left hero banner */}
        <div className="flex flex-col justify-between bg-gradient-to-br from-[#eaf3eb] via-[#dff0e1] to-[#cfebd2] p-8 lg:p-10">
          <div>
            <div className="flex items-center justify-between">
              <Link to="/" className="inline-flex items-center gap-3">
                <img src={logo} alt="Tomiland Foods logo" className="h-11 w-11 rounded-full object-cover shadow-sm" />
                <span className="font-syne text-lg font-black tracking-tight text-[#2f7a4f]">Tomiland Foods</span>
              </Link>
            </div>

            <p className="mt-10 inline-block rounded-full bg-[#2f7a4f]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#2f7a4f]">
              {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Join the Community' : 'Password Recovery'}
            </p>
            <h1 className="mt-3 font-syne text-3xl font-black tracking-tight text-[#16231a] sm:text-4xl">
              Fresh harvests and authentic meals, curated for Kigali.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-[#41544a]">
              Order straight from verified Rwandan farms & top neighborhood kitchens with guaranteed fast delivery.
            </p>

            {/* Quick credentials testing pills */}
            <div className="mt-8 rounded-2xl border border-[#2f7a4f]/20 bg-white/70 p-4 backdrop-blur-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#2f7a4f]">⚡ Quick 1-Click Demo Login</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('customer')}
                  className="rounded-full border border-[#2f7a4f]/30 bg-white px-3 py-1.5 text-xs font-bold text-[#1e2a22] shadow-sm transition hover:bg-[#2f7a4f] hover:text-white"
                >
                  👤 Demo Customer
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin')}
                  className="rounded-full border border-[#2f7a4f]/30 bg-white px-3 py-1.5 text-xs font-bold text-[#1e2a22] shadow-sm transition hover:bg-[#2f7a4f] hover:text-white"
                >
                  🛡️ Demo Admin
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3 text-xs font-medium text-[#4b6053]">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Kigali delivery network active & ready</span>
          </div>
        </div>

        {/* Right form container */}
        <div className="p-8 sm:p-10">
          {/* Tab switcher */}
          <div className="flex rounded-2xl bg-[#f0f4f1] p-1.5 shadow-inner">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'bg-white text-[#2f7a4f] shadow-sm'
                  : 'text-[#5a6762] hover:text-[#1e2a22]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all ${
                mode === 'signup'
                  ? 'bg-white text-[#2f7a4f] shadow-sm'
                  : 'text-[#5a6762] hover:text-[#1e2a22]'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="mt-6">
            <h2 className="font-syne text-2xl font-black tracking-tight text-[#16231a] sm:text-3xl">
              {mode === 'login'
                ? 'Sign in to Tomiland'
                : mode === 'signup'
                ? 'Create your free account'
                : 'Reset your password'}
            </h2>
            <p className="mt-1.5 text-xs text-[#5a6762]">
              {mode === 'login'
                ? 'Access your orders, saved grocery items, and speedy checkout.'
                : mode === 'signup'
                ? 'Enter your details below to receive a quick email verification code.'
                : 'Enter your email to receive recovery instructions.'}
            </p>
          </div>

          {infoMessage && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 border border-emerald-200">
              <span>💡</span>
              <span>{infoMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3d5045]">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#dfe7e2] bg-[#fafafa] px-3.5 py-3 text-sm font-medium text-[#1e2a22] outline-none transition focus:border-[#2f7a4f] focus:bg-white focus:ring-2 focus:ring-[#2f7a4f]/20"
                  placeholder="e.g. Marie Claire"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3d5045]">
                Email Address
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#dfe7e2] bg-[#fafafa] px-3.5 py-3 text-sm font-medium text-[#1e2a22] outline-none transition focus:border-[#2f7a4f] focus:bg-white focus:ring-2 focus:ring-[#2f7a4f]/20"
                placeholder="you@example.com"
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3d5045]">
                  Phone Number
                </label>
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#dfe7e2] bg-[#fafafa] px-3.5 py-3 text-sm font-medium text-[#1e2a22] outline-none transition focus:border-[#2f7a4f] focus:bg-white focus:ring-2 focus:ring-[#2f7a4f]/20"
                  placeholder="+250 788 123 456"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3d5045]">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className="text-xs font-semibold text-[#2f7a4f] hover:underline"
                  >
                    Don't have an account? Sign up
                  </button>
                )}
              </div>
              <div className="relative mt-1.5">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#dfe7e2] bg-[#fafafa] px-3.5 py-3 pr-10 text-sm font-medium text-[#1e2a22] outline-none transition focus:border-[#2f7a4f] focus:bg-white focus:ring-2 focus:ring-[#2f7a4f]/20"
                  placeholder={mode === 'login' ? '••••••••' : 'At least 8 characters'}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#718578] hover:text-[#1e2a22]"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
                <p className="font-bold">Login notice:</p>
                <p className="mt-0.5">{error}</p>
                {mode === 'login' && error.toLowerCase().includes('no account') && (
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className="mt-2 text-xs font-bold text-[#2f7a4f] underline underline-offset-2"
                  >
                    Click here to create a new account →
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[#2f7a4f] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#2f7a4f]/25 transition hover:bg-[#256340] hover:shadow-[#2f7a4f]/35 active:scale-[0.99] disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Processing…</span>
                </>
              ) : mode === 'login' ? (
                'Sign In to Account →'
              ) : (
                'Create Account & Get Code →'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#5a6762]">
            {mode === 'login' ? (
              <p>
                New to Tomiland Foods?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="font-bold text-[#2f7a4f] hover:underline"
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-bold text-[#2f7a4f] hover:underline"
                >
                  Sign in instead
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
