import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export const RegisterPage = () => {
  const { register, loginAsGuest, configError } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
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
      await register({ name: name.trim(), email: email.trim(), password })
      navigate('/dashboard')
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : 'Unable to register')
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
      <section className="auth-card card" aria-labelledby="register-title">
        <h1 className="brand">VYAYAM</h1>
        <h2 id="register-title">Create account</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="register-name">
            Name
            <input
              id="register-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              aria-describedby={hasError ? 'register-error' : undefined}
              aria-invalid={hasError}
              required
            />
          </label>

          <label htmlFor="register-email">
            Email
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              aria-describedby={hasError ? 'register-error' : undefined}
              aria-invalid={hasError}
              required
            />
          </label>

          <label htmlFor="register-password">
            Password
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              aria-describedby={hasError ? 'register-error' : undefined}
              aria-invalid={hasError}
              required
              minLength={6}
            />
          </label>

          {configError ? (
            <p id="register-error" className="error-text" role="alert">
              {configError}
            </p>
          ) : null}
          {!configError && error ? (
            <p id="register-error" className="error-text" role="alert">
              {error}
            </p>
          ) : null}

          <button className="primary-button" type="submit" disabled={loading || Boolean(configError)}>
            {loading ? 'Creating...' : 'Register'}
          </button>
          <button className="ghost-button" type="button" onClick={handleGuest}>
            Continue as Guest
          </button>
        </form>

        <p className="muted">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </div>
  )
}
