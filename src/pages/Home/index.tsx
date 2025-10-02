import { useAuth } from "../../context/AuthContext"
import { useCompany } from "../../hooks/useCompany"
import Layout from "../../components/layout/Layout"
import { useTranslation } from "react-i18next"

export default function Home() {
  const { user } = useAuth()
  const { company } = useCompany()
  const { t } = useTranslation()

  return (
     <Layout>

        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          
          <div className="flex flex-col lg:flex-row">
           
            <main className="flex-1 w-full">
              
              <div className="container mx-auto p-6">
                {/* Banner com gradiente da empresa */}
                <div className="mb-6 gradient-company p-6 rounded-lg text-white shadow-lg fade-in">
                  <h2 className="text-3xl font-bold mb-2">
                    {t('home.welcome', { name: user?.name })}
                  </h2>
                  <p className="text-white/90">
                    {company?.full_name} | {user?.role}
                  </p>
                </div>

                {/* Cards de informações */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Card Perfil */}
                  <div className="p-6 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow fade-in">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {t('home.yourProfile')}
                      </h3>
                      <svg className="w-8 h-8 text-company-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600 dark:text-gray-400">
                        <strong>{t('home.email')}:</strong> {user?.email}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <strong>{t('home.login')}:</strong> {user?.login}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <strong>{t('home.type')}:</strong> {user?.type}
                      </p>
                    </div>
                  </div>

                  {/* Card Empresa */}
                  <div className="card-company bg-white dark:bg-gray-900 fade-in">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-company-primary">
                        {t('home.company')}
                      </h3>
                      <svg className="w-8 h-8 text-company-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600 dark:text-gray-400">
                        <strong>{t('home.name')}:</strong> {company?.full_name}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <strong>{t('home.city')}:</strong> {company?.def_city}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <strong>{t('home.state')}:</strong> {company?.def_state}
                      </p>
                    </div>
                  </div>

                  {/* Card Status */}
                  <div className="p-6 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow fade-in">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {t('home.status')}
                      </h3>
                      <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600 dark:text-gray-400">
                        <strong>{t('home.account')}:</strong> 
                        <span className={user?.active ? 'text-green-500' : 'text-red-500'}>
                          {user?.active ? t('home.active') : t('home.inactive')}
                        </span>
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <strong>{t('home.timezone')}:</strong> {user?.timeZone}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <strong>{t('home.id')}:</strong> {user?.id}
                      </p>
                    </div>
                  </div>

                  {/* Cards adicionais */}
                  {[4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="p-6 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow fade-in"
                    >
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {t('home.module', { number: i })}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {t('home.moduleContent')}
                      </p>
                      <button className="text-white dark:text-gray-100 mt-4 btn-company w-full">
                        {t('home.access')}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Informações técnicas */}
                <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('home.technicalInfo')}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <p><strong>{t('home.companyId')}:</strong> {user?.companyId}</p>
                    <p><strong>{t('home.webKey')}:</strong> {user?.webKey?.substring(0, 20)}...</p>
                    <p><strong>{t('home.address')}:</strong> {company?.def_address1}</p>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>

     </Layout>
  )
}