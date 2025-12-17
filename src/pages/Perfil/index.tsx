// src/pages/Perfil/index.tsx
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import Layout from '../../components/layout/Layout'

type TabType = 'profile' | 'security' | 'preferences' | 'notifications'

interface ProfileFormData {
  name: string
  email: string
  phone: string
  department: string
  position: string
}

interface SecurityFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function Perfil() {
    //@ts-ignore
  const { user, updateProfile } = useAuth()
  const { t, i18n } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form States
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    name: user?.name || '',
    email: user?.email || '',
    //@ts-ignore
    phone: user?.phone || '',
    //@ts-ignore
    department: user?.department || '',
    //@ts-ignore
    position: user?.position || ''
  })

  const [securityForm, setSecurityForm] = useState<SecurityFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [preferences, setPreferences] = useState({
    language: i18n.language,
    theme: localStorage.getItem('theme') || 'light',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h'
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    certificateExpiry: true,
    systemUpdates: false,
    weeklyReport: true
  })

  // Handlers
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulação de API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Atualizar contexto
      if (updateProfile) {
        updateProfile(profileForm)
      }

      toast.success(t('profile.updateSuccess'))
      setIsEditing(false)
    } catch (error) {
      toast.error(t('profile.updateError'))
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error(t('profile.passwordMismatch'))
      return
    }

    if (securityForm.newPassword.length < 8) {
      toast.error(t('profile.passwordTooShort'))
      return
    }

    setLoading(true)

    try {
      // Simulação de API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success(t('profile.passwordChanged'))
      setSecurityForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      toast.error(t('profile.passwordChangeError'))
      console.error('Error changing password:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Atualizar idioma
      i18n.changeLanguage(preferences.language)
      
      // Atualizar tema
      if (preferences.theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      localStorage.setItem('theme', preferences.theme)

      await new Promise(resolve => setTimeout(resolve, 500))
      toast.success(t('profile.preferencesUpdated'))
    } catch (error) {
      toast.error(t('profile.preferencesError'))
      console.error('Error updating preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      toast.success(t('profile.notificationsUpdated'))
    } catch (error) {
      toast.error(t('profile.notificationsError'))
      console.error('Error updating notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'profile' as TabType, label: t('profile.tabs.profile'), icon: '👤' },
    { id: 'security' as TabType, label: t('profile.tabs.security'), icon: '🔒' },
    { id: 'preferences' as TabType, label: t('profile.tabs.preferences'), icon: '⚙️' },
    { id: 'notifications' as TabType, label: t('profile.tabs.notifications'), icon: '🔔' }
  ]

  return (
    <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('profile.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
                {t('profile.subtitle')}
            </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar com Avatar e Tabs */}
            <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-6">
                {/* Avatar */}
                <div className="flex flex-col items-center mb-6">
                    <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 
                                    flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                        {user?.name
                        ? user.name.split(' ').map(n => n.charAt(0).toUpperCase()).join('').slice(0, 2)
                        : 'U'}
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-gray-700 
                                    rounded-full shadow-lg flex items-center justify-center
                                    hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                        <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white text-center">
                    {user?.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.role}
                    </p>
                </div>

                {/* Navigation Tabs */}
                <nav className="space-y-1">
                    {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left
                                transition-all duration-200 ${
                                    activeTab === tab.id
                                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                    >
                        <span className="text-xl">{tab.icon}</span>
                        <span>{tab.label}</span>
                    </button>
                    ))}
                </nav>
                </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {t('profile.personalInfo')}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {t('profile.personalInfoSubtitle')}
                        </p>
                        </div>
                        {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg
                                    hover:bg-primary-700 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            {t('profile.edit')}
                        </button>
                        )}
                    </div>

                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('profile.fields.name')}
                            </label>
                            <input
                            type="text"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                    focus:ring-2 focus:ring-primary-500 focus:border-transparent
                                    disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('profile.fields.email')}
                            </label>
                            <input
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                    focus:ring-2 focus:ring-primary-500 focus:border-transparent
                                    disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('profile.fields.phone')}
                            </label>
                            <input
                            type="tel"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                    focus:ring-2 focus:ring-primary-500 focus:border-transparent
                                    disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('profile.fields.department')}
                            </label>
                            <input
                            type="text"
                            value={profileForm.department}
                            onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                    focus:ring-2 focus:ring-primary-500 focus:border-transparent
                                    disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('profile.fields.position')}
                            </label>
                            <input
                            type="text"
                            value={profileForm.position}
                            onChange={(e) => setProfileForm({ ...profileForm, position: e.target.value })}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                    focus:ring-2 focus:ring-primary-500 focus:border-transparent
                                    disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                            />
                        </div>
                        </div>

                        {isEditing && (
                        <div className="flex gap-3 pt-4">
                            <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg
                                    hover:bg-primary-700 transition-colors disabled:opacity-50
                                    disabled:cursor-not-allowed flex items-center gap-2"
                            >
                            {loading ? (
                                <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                {t('profile.saving')}
                                </>
                            ) : (
                                t('profile.save')
                            )}
                            </button>
                            <button
                            type="button"
                            onClick={() => {
                                setIsEditing(false)
                                setProfileForm({
                                name: user?.name || '',
                                email: user?.email || '',
                                //@ts-ignore
                                phone: user?.phone || '',
                                //@ts-ignore
                                department: user?.department || '',
                                //@ts-ignore
                                position: user?.position || ''
                                })
                            }}
                            className="px-6 py-2 border border-gray-300 dark:border-gray-600
                                    text-gray-700 dark:text-gray-300 rounded-lg
                                    hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                            {t('profile.cancel')}
                            </button>
                        </div>
                        )}
                    </form>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {t('profile.security')}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {t('profile.securitySubtitle')}
                        </p>
                    </div>

                    <form onSubmit={handleSecuritySubmit} className="space-y-6">
                        <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('profile.fields.currentPassword')}
                        </label>
                        <input
                            type="password"
                            value={securityForm.currentPassword}
                            onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                    focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        </div>

                        <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('profile.fields.newPassword')}
                        </label>
                        <input
                            type="password"
                            value={securityForm.newPassword}
                            onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                    focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {t('profile.passwordRequirements')}
                        </p>
                        </div>

                        <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('profile.fields.confirmPassword')}
                        </label>
                        <input
                            type="password"
                            value={securityForm.confirmPassword}
                            onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                    focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        </div>

                        <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg
                                    hover:bg-primary-700 transition-colors disabled:opacity-50
                                    disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                {t('profile.updating')}
                            </>
                            ) : (
                            t('profile.changePassword')
                            )}
                        </button>
                        </div>
                    </form>

                    {/* Two-Factor Authentication */}
                    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        {t('profile.twoFactor')}
                        </h3>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                            {t('profile.twoFactorAuth')}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {t('profile.twoFactorDescription')}
                            </p>
                        </div>
                        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg
                                        hover:bg-primary-700 transition-colors">
                            {t('profile.enable')}
                        </button>
                        </div>
                    </div>
                    </div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                    <div>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {t('profile.preferences')}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {t('profile.preferencesSubtitle')}
                        </p>
                    </div>

                    <form onSubmit={handlePreferencesSubmit} className="space-y-6">
                        <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('profile.fields.language')}
                        </label>
                        <select
                            value={preferences.language}
                            onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                    focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="pt">Português</option>
                            <option value="en">English</option>
                            <option value="es">Español</option>
                            <option value="ar">العربية</option>
                        </select>
                        </div>

                        <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('profile.fields.theme')}
                        </label>
                        <select
                            value={preferences.theme}
                            onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                    focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="light">{t('profile.theme.light')}</option>
                            <option value="dark">{t('profile.theme.dark')}</option>
                            <option value="system">{t('profile.theme.system')}</option>
                        </select>
                        </div>

                        <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('profile.fields.dateFormat')}
                        </label>
                        <select
                            value={preferences.dateFormat}
                            onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                    focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                        </div>

                        <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('profile.fields.timeFormat')}
                        </label>
                        <select
                            value={preferences.timeFormat}
                            onChange={(e) => setPreferences({ ...preferences, timeFormat: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                    focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="24h">24h</option>
                            <option value="12h">12h (AM/PM)</option>
                        </select>
                        </div>

                        <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg
                                    hover:bg-primary-700 transition-colors disabled:opacity-50
                                    disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                {t('profile.saving')}
                            </>
                            ) : (
                            t('profile.savePreferences')
                            )}
                        </button>
                        </div>
                    </form>
                    </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <div>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {t('profile.notifications')}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {t('profile.notificationsSubtitle')}
                        </p>
                    </div>

                    <form onSubmit={handleNotificationsSubmit} className="space-y-4">
                        {[
                        { key: 'emailNotifications', label: t('profile.notif.email'), desc: t('profile.notif.emailDesc') },
                        { key: 'pushNotifications', label: t('profile.notif.push'), desc: t('profile.notif.pushDesc') },
                        { key: 'certificateExpiry', label: t('profile.notif.certificates'), desc: t('profile.notif.certificatesDesc') },
                        { key: 'systemUpdates', label: t('profile.notif.updates'), desc: t('profile.notif.updatesDesc') },
                        { key: 'weeklyReport', label: t('profile.notif.reports'), desc: t('profile.notif.reportsDesc') }
                        ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                                {item.label}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {item.desc}
                            </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={notifications[item.key as keyof typeof notifications]}
                                onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                                            peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 
                                            rounded-full peer dark:bg-gray-600 
                                            peer-checked:after:translate-x-full peer-checked:after:border-white 
                                            after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                            after:bg-white after:border-gray-300 after:border after:rounded-full 
                                            after:h-5 after:w-5 after:transition-all dark:border-gray-500 
                                            peer-checked:bg-primary-600"></div>
                            </label>
                        </div>
                        ))}

                        <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg
                                    hover:bg-primary-700 transition-colors disabled:opacity-50
                                    disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                {t('profile.saving')}
                            </>
                            ) : (
                            t('profile.saveNotifications')
                            )}
                        </button>
                        </div>
                    </form>
                    </div>
                )}
                </div>
            </div>
            </div>
        </div>
        </div>
    </Layout>
  )
}