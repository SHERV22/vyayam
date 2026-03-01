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
      <section className="auth-card card">
        <h1 className="brand">VYAYAM</h1>
        <h2>Create account</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
            />
          </label>

          {configError ? <p className="error-text">{configError}</p> : null}
          {error ? <p className="error-text">{error}</p> : null}

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
