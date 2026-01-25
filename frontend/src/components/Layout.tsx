import { Link, Outlet, useLocation } from 'react-router-dom'
import { ConnectWallet } from './ConnectWallet'

export function Layout() {
  const location = useLocation()

  const isActive = (path: string) =>
    location.pathname === path ? 'text-white' : 'text-gray-400 hover:text-white'

  return (
    <div className="min-h-screen bg-base-dark text-white">
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-bold text-base-blue">
              BaseSubscribe
            </Link>
            <nav className="flex gap-6">
              <Link to="/" className={isActive('/')}>
                Browse
              </Link>
              <Link to="/creator" className={isActive('/creator')}>
                Creator
              </Link>
              <Link to="/subscriptions" className={isActive('/subscriptions')}>
                My Subscriptions
              </Link>
            </nav>
          </div>
          <ConnectWallet />
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
