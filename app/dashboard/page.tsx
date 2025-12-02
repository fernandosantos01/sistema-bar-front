export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard de Mesas</h1>
        <p className="text-muted-foreground mb-8">Gerencie as mesas do seu bar</p>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Placeholder para as mesas */}
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <p className="text-muted-foreground">Dashboard será implementado em breve</p>
          </div>
        </div>
      </div>
    </div>
  )
}
