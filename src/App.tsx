// src/App.tsx
import { useState } from 'react'
import Header from './components/layout/Header'
import Menu from './components/layout/Menu'
import Navbar from './components/layout/Navbar'

function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <Header onMenuClick={() => setMenuOpen(!menuOpen)} />

      <div className="flex">
        {/* Menu Lateral */}
        <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

        {/* Conteúdo Principal */}
        <main className="flex-1 lg:ml-0">
          {/* Navbar secundária (opcional) */}
          <Navbar />

          {/* Conteúdo */}
          <div className="container mx-auto p-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Bem-vindo ao Dashboard
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Cards de exemplo */}
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="p-6 rounded-lg bg-white dark:bg-gray-900
                           border border-gray-200 dark:border-gray-800
                           shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Card {i}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Conteúdo do card de exemplo
                  </p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App