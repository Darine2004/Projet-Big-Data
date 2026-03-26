import { Activity, Cpu } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">SmartFactory IoT</h1>
                <p className="text-sm text-slate-400">Plateforme de Maintenance Prédictive</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-slate-300">Système actif</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-300">Big Data Engine</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
