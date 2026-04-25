import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export const LoginPage = () => {
  const { login, loginAsGuest, configError } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const hasError = Boolean(configError || error)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email.trim(), password)
      navigate('/dashboard')
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const handleGuest = () => {
    loginAsGuest()
    navigate('/dashboard')
  }

  return (
    <div className="auth-shell">
      <section className="auth-card card" aria-labelledby="login-title">
        <h1 className="brand">VYAYAM</h1>
        <h2 id="login-title">Welcome back</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="login-email">
            Email
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              aria-describedby={hasError ? 'login-error' : undefined}
              aria-invalid={hasError}
              required
            />
          </label>

          <label htmlFor="login-password">
            Password
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              aria-describedby={hasError ? 'login-error' : undefined}
              aria-invalid={hasError}
              required
            />
          </label>

          {configError ? (
            <p id="login-error" className="error-text" role="alert">
              {configError}
            </p>
          ) : null}
          {!configError && error ? (
            <p id="login-error" className="error-text" role="alert">
              {error}
            </p>
          ) : null}

          <button className="primary-button" type="submit" disabled={loading || Boolean(configError)}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
          <button className="ghost-button" type="button" onClick={handleGuest}>
            Continue as Guest
          </button>
        </form>

        <p className="muted">
          New here? <Link to="/register">Create account</Link>
        </p>
      </section>
    </div>
  )
}
