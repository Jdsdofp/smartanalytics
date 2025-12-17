export default function AccessDenied() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <h1 className="text-2xl font-bold text-red-600">
        Acesso negado
      </h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400 text-center max-w-md">
        Este link não é válido, expirou ou você não tem permissão para acessar
        este conteúdo.
      </p>
    </div>
  )
}
