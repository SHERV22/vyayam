import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export const Layout = () => (
  <div className="app-shell">
    <a className="skip-link" href="#main-content">
      Skip to main content
    </a>
    <Navbar />
    <main id="main-content" className="container main-content" tabIndex={-1}>
      <Outlet />
    </main>
  </div>
)
