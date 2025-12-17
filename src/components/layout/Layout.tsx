//src/components/layout/Layout.tsx
import { useState } from 'react'
import Header from './Header'
import Menu from './Menu'
import { useSearchParams } from 'react-router-dom'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const [searchParams] = useSearchParams()
  const isEmbedded = searchParams.get('embedded') === 'true'

  return (
    isEmbedded ? (
      <div className="w-full sm:px-2 lg:px-1 sm:py-1">
        {children}
      </div>
    ) : (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Header onMenuClick={() => setMenuOpen(!menuOpen)} />
        <div className="flex flex-col lg:flex-row">
          <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
          <main className="flex-1 w-full min-w-0">
            <div className="w-full sm:px-2 lg:px-1 sm:py-1">
              {children}
            </div>
          </main>
        </div>
      </div>
    )
  )
}
