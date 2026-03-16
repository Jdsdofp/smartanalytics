// src/pages/Analytics/AI/index.tsx
import Layout from '../../../components/layout/Layout'
import SmartXAI from '../../../components/AI/SmartXAI'

export default function AIPage() {
  return (
    <Layout
      showEmbedButton={false}
      showFavoriteButton={true}
      favoriteConfig={{ title: 'SmartX AI', category: 'Analytics', icon: '✨' }}
    >
      <div className="flex flex-col gap-4 p-4 h-full">

        {/* Page title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg">
            <span className="text-xl">✨</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">SmartX AI</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Análise inteligente dos seus dados industriais em tempo real
            </p>
          </div>
        </div>

        {/* AI Component — ocupa o espaço restante */}
        <div className="flex-1 min-h-0" style={{ height: 'calc(100vh - 180px)' }}>
          <SmartXAI />
        </div>

      </div>
    </Layout>
  )
}
