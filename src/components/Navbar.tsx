import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../context/ThemeContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/programs', label: 'Programs' },
  { to: '/progress', label: 'Progress' },
]

export const Navbar = () => {
  const { logout, user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to logout'
      window.alert(message)
    }
  }

  return (
    <header className="navbar">
      <div className="container navbar-content">
        <div className="brand-wrap">
          <h1 className="brand">VYAYAM</h1>
          <p className="brand-subtitle">Strength Through Consistency</p>
        </div>

        <nav className="nav-links" aria-label="Primary">
          {user?.isGuest ? <span className="guest-pill">Guest Mode</span> : null}
          <button
            type="button"
            className="ghost-button theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            aria-pressed={theme === 'light'}
          >
            {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
          </button>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
          <button type="button" className="ghost-button" onClick={handleLogout} aria-label="Log out">
            Logout
          </button>
        </nav>
      </div>
    </header>
  )
}
