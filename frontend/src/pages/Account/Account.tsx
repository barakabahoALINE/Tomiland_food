import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { loginUser, registerUser } from '../../store/slices/auth/authSlice'
import logo from '../../assets/logo.png'

export default function AccountPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { isAuthenticated, user, status, error } = useAppSelector((state) => state.auth)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = mode === 'login'
      ? await dispatch(loginUser({ email, password }))
      : await dispatch(registerUser({ name, email, password }))

    if (result.meta.requestStatus === 'fulfilled') {
      const from = (location.state as { from?: { pathname?: string; search?: string; hash?: string } } | null)?.from
      const destination = from?.pathname?.startsWith('/') && !from.pathname.startsWith('//')
        ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
        : '/products'
      navigate(destination, { replace: true })
    }
  }

  return (
    <main className="min-h-[calc(100vh-100px)] bg-[#f5f1ea] px-6 py-10 text-[#1e2a22] lg:px-8">
      <div className="mx-auto grid max-w-[1000px] overflow-hidden rounded-[24px] border border-[#dfe7e2] bg-white shadow-sm md:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-between bg-[#eaf3eb] p-8 lg:p-10">
          <div>
            <Link to="/" className="inline-flex items-center gap-2">
              <img src={logo} alt="Tomiland Foods logo" className="h-12 w-12 rounded-full object-cover" />
              <span className="text-sm font-black text-[#2f7a4f]">Tomiland Foods</span>
            </Link>
            <p className="mt-12 text-xs font-bold uppercase tracking-[0.16em] text-[#2f7a4f]">Your Tomiland account</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.06em]">Good food starts with a simple sign in.</h1>
            <p className="mt-4 text-sm leading-6 text-[#52645a]">Save your shopping preferences, keep track of orders, and make every basket feel more personal.</p>
          </div>
          <p className="mt-10 text-xs font-semibold text-[#52645a]">Fresh choices, right when you need them.</p>
        </div>

        <div className="p-8 lg:p-10">
          {isAuthenticated && user ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2f7a4f]">Welcome back</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.05em]">{user.name}</h2>
              <p className="mt-2 text-sm text-[#5a6762]">{user.email}</p>
              <button onClick={() => navigate('/products')} className="mt-8 w-full rounded-full bg-[#2f7a4f] px-4 py-3 text-sm font-semibold text-white hover:bg-[#266e45]">Start shopping</button>
            </div>
          ) : (
            <>
              <div className="flex rounded-full bg-[#f5f8f5] p-1">
                <button onClick={() => setMode('login')} className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${mode === 'login' ? 'bg-white text-[#2f7a4f] shadow-sm' : 'text-[#5a6762]'}`}>Log in</button>
                <button onClick={() => setMode('signup')} className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${mode === 'signup' ? 'bg-white text-[#2f7a4f] shadow-sm' : 'text-[#5a6762]'}`}>Sign up</button>
              </div>
              <h2 className="mt-8 text-3xl font-black tracking-[-0.05em]">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
              <p className="mt-2 text-sm text-[#5a6762]">{mode === 'login' ? 'Log in to continue shopping.' : 'Join Tomiland for a smoother shopping experience.'}</p>
              <form onSubmit={submit} className="mt-6 space-y-4">
                {mode === 'signup' && <label className="block text-sm font-semibold">Name<input required value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#dfe7e2] px-3 py-3 font-normal outline-none focus:border-[#2f7a4f]" placeholder="Your name" /></label>}
                <label className="block text-sm font-semibold">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#dfe7e2] px-3 py-3 font-normal outline-none focus:border-[#2f7a4f]" placeholder="you@example.com" /></label>
                <label className="block text-sm font-semibold">Password<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#dfe7e2] px-3 py-3 font-normal outline-none focus:border-[#2f7a4f]" placeholder="Enter your password" /></label>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button disabled={status === 'loading'} className="w-full rounded-full bg-[#2f7a4f] px-4 py-3 text-sm font-semibold text-white hover:bg-[#266e45] disabled:opacity-60">{status === 'loading' ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}</button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
