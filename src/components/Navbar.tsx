import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/programs', label: 'Programs' },
  { to: '/progress', label: 'Progress' },
]

export const Navbar = () => {
  const { logout, user } = useAuth()
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
        <h1 className="brand">VYAYAM</h1>

        <nav className="nav-links">
          {user?.isGuest ? <span className="guest-pill">Guest Mode</span> : null}
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
          <button type="button" className="ghost-button" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </div>
    </header>
  )
}
