// src/components/PrivateRoute.tsx
// import { Navigate } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext'

// export default function PrivateRoute({ children }: { children: React.ReactNode }) {
//   const { user, isLoading } = useAuth()

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-gray-600 dark:text-gray-400">Carregando...</div>
//       </div>
//     )
//   }

//   return user ? <>{children}</> : <Navigate to="/login" />
// }


// src/components/PrivateRoute.tsx
import { Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const [searchParams] = useSearchParams()

  const isEmbedded = searchParams.get('embedded') === 'true'

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Carregando...</div>
      </div>
    )
  }

  // 🔹 Se estiver embedded, não bloqueia
  if (isEmbedded) {
    return <>{children}</>
  }

  return user ? <>{children}</> : <Navigate to="/login" />
}
