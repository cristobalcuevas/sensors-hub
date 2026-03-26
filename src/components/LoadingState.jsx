export const LoadingState = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
        <div className="text-xl font-semibold text-slate-600">Cargando datos...</div>
      </div>
    </div>
  )
};