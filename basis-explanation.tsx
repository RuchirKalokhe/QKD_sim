export function BasisExplanation() {
  return (
    <div className="grid grid-cols-1 gap-6 p-4 rounded-lg bg-muted/20">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Rectilinear Basis (+)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-2xl">→</span>
            </div>
            <span>= 0</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-2xl">↑</span>
            </div>
            <span>= 1</span>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Diagonal Basis (×)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-2xl">↗</span>
            </div>
            <span>= 0</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-2xl">↖</span>
            </div>
            <span>= 1</span>
          </div>
        </div>
      </div>
    </div>
  )
}

