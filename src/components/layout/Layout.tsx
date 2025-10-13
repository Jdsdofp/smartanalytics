import { useState } from 'react'
import Header from './Header'
import Menu from './Menu'
import Navbar from './Navbar'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header onMenuClick={() => setMenuOpen(!menuOpen)} />
      <div className="flex flex-col lg:flex-row">
        <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
        <main className="flex-1 w-full">
          <Navbar />
          <div className="container mx-auto max-w-full px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
                {children}
          </div>
        </main>
      </div>
    </div>
  )
}