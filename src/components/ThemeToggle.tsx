// src/components/ThemeToggle.tsx
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { useTheme } from '../context/ThemeContext'

function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useTheme()

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 
                 text-gray-800 dark:text-gray-200 
                 hover:bg-gray-300 dark:hover:bg-gray-600 
                 transition-all duration-200
                 shadow-sm hover:shadow-md"
      aria-label="Toggle dark mode"
    >
      {darkMode ? (
        <MoonIcon className="w-5 h-5" />
      ) : (
        <SunIcon className="w-5 h-5" />
      )}
    </button>
  )
}

export default ThemeToggle