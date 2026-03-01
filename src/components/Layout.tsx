import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export const Layout = () => (
  <div className="app-shell">
    <Navbar />
    <main className="container main-content">
      <Outlet />
    </main>
  </div>
)
