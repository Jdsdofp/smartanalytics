// src/components/layout/Header.tsx
import ThemeToggle from '../ThemeToggle'
import { useAuth } from '../../context/AuthContext'
import { useCompany } from '../../hooks/useCompany'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowRightOnRectangleIcon, ChevronLeftIcon, ChevronRightIcon, Cog6ToothIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { useMenu } from '../../context/MenuContext'

interface HeaderProps {
  onMenuClick?: () => void
}

function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth()
  //@ts-ignore
  const { company, logo } = useCompany()
  const { collapsed, toggleCollapsed } = useMenu()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showMenuButton, setShowMenuButton] = useState(false)

  const initials = user?.name
    ? user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
    : 'U'

  // Detecta scroll para mostrar/esconder botão do menu
  useEffect(() => {
    const handleScroll = () => {
      // Mostra o botão quando rolar mais de 100px
      setShowMenuButton(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className="
        sticky top-0 z-50 w-full
        backdrop-blur-xl bg-white/80 dark:bg-gray-900/80
        border-b border-gray-200/50 dark:border-gray-800/50
      "
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        {/* ESQUERDA */}
        <div className="flex items-center gap-4">
          {/* Botão menu mobile */}
          <button
            onClick={onMenuClick}
            className="
              lg:hidden p-2 rounded-xl
              hover:bg-gray-100 dark:hover:bg-gray-800
              transition-all active:scale-95
            "
            aria-label={t('header.toggleMenu')}
          >
            <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Botão de collapse/expand do menu (desktop - aparece no scroll) */}
          <button
            onClick={toggleCollapsed}
            className={`
              cursor-pointer
              hidden lg:flex items-center justify-center
              w-10 h-10 rounded-full
              bg-gradient-to-br from-primary-500 to-primary-700
              text-white
              hover:shadow-lg hover:scale-105
              transition-all duration-300
              ${showMenuButton ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}
            `}
            title={collapsed ? t('menu.expand') : t('menu.collapse')}
          >
            {collapsed ? (
              <ChevronRightIcon className="w-5 h-5" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5" />
            )}
          </button>


          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/logo10.png"
              alt={company?.details?.full_name || t('header.logoAlt')}
              className="h-10 w-auto object-contain"
            />
            <div className="hidden sm:flex flex-col">
              <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100 leading-tight">
                SmartxHub <span className="text-primary-500">Analytics</span>
              </h1>
              {company?.details?.full_name && (
                <p
                  className={`
          text-xs text-gray-500 dark:text-gray-400 leading-tight
          transition-all duration-300
          ${showMenuButton ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 h-0'}
        `}
                >
                  {company.details.full_name}
                </p>
              )}
            </div>
          </div>


        </div>



        {/* DIREITA */}
        <div className="flex items-center gap-2">

          {/* Notificações */}
          <button
            className="
              relative p-2 rounded-xl
              hover:bg-gray-100 dark:hover:bg-gray-800
              transition-all active:scale-95
            "
            aria-label={t('header.notifications')}
          >
            <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* Theme */}
          <ThemeToggle />

          {/* USER MENU */}
          <div className="relative group">
            <button
              className="
                cursor-pointer flex items-center gap-3 p-1.5 pr-3 rounded-2xl
                hover:bg-gray-100 dark:hover:bg-gray-800
                transition-all active:scale-95
              "
            >
              {/* Avatar */}
              <div
                className="
                  cursor-pointer w-9 h-9 rounded-full
                  flex items-center justify-center
                  bg-gradient-to-br from-primary-500 to-primary-700
                  text-white font-bold text-sm
                  shadow-md
                "
              >
                {initials}
              </div>

              {/* Nome */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-tight">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.role}
                </p>
              </div>

              <svg className="w-4 h-4 text-gray-400 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* DROPDOWN */}
            <div
              className="
    absolute right-0 mt-3 w-60
    rounded-2xl overflow-hidden
    bg-white dark:bg-gray-900
    border border-gray-200 dark:border-gray-800
    shadow-xl
    opacity-0 invisible group-hover:opacity-100 group-hover:visible
    translate-y-2 group-hover:translate-y-0
    transition-all duration-200
    z-50
  "
            >
              {/* User info */}
              <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {user?.email}
                </p>
              </div>

              {/* Itens */}
              <div className="py-2">
                <button
                  onClick={() => navigate('/user/perfil')}
                  className="
      cursor-pointer
        w-full flex items-center gap-3
        px-4 py-2.5
        text-sm font-medium text-gray-700 dark:text-gray-300
        hover:bg-gray-50 dark:hover:bg-gray-800
        transition-colors
      "
                >
                  <UserCircleIcon className="w-5 h-5" />
                  {t('header.myProfile')}
                </button>

                <button className="
      cursor-not-allowed
      w-full flex items-center gap-3
      px-4 py-2.5
      text-sm font-medium text-gray-700 dark:text-gray-300
      hover:bg-gray-50 dark:hover:bg-gray-800
      transition-colors
    ">
                  <Cog6ToothIcon className="w-5 h-5" />
                  {t('header.settings')}
                </button>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-800" />

              <div className="p-2">
                <button
                  onClick={logout}
                  className="
        cursor-pointer
        w-full flex items-center justify-center gap-2
        px-4 py-2.5 rounded-xl
        text-sm font-medium
        text-red-600 dark:text-red-400
        hover:bg-red-50 dark:hover:bg-red-900/20
        transition-all
      "
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  {t('header.logout')}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  )
}

export default Header
