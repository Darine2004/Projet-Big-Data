import { AlertTriangle, AlertCircle, TrendingUp, Wrench } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { type Machine } from '../utils/dataSimulator';

interface AlertsPanelProps {
  machines: Machine[];
}

export function AlertsPanel({ machines }: AlertsPanelProps) {
  const criticalMachines = machines.filter(m => m.status === 'critical');
  const warningMachines = machines.filter(m => m.status === 'warning');

  const generateAlertMessage = (machine: Machine) => {
    const issues = [];
    if (machine.sensors.vibration > 75) {
      issues.push(`vibrations élevées (${machine.sensors.vibration} Hz)`);
    }
    if (machine.sensors.temperature > 75) {
      issues.push(`température excessive (${machine.sensors.temperature}°C)`);
    }
    if (machine.sensors.current > 85) {
      issues.push(`surconsommation (${machine.sensors.current} A)`);
    }
    return issues.join(', ');
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Alertes et Prédictions</h2>
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="w-3 h-3" />
            {criticalMachines.length} Critique{criticalMachines.length > 1 ? 's' : ''}
          </Badge>
          <Badge variant="secondary" className="gap-1 bg-yellow-950 text-yellow-400 border-yellow-900">
            <AlertTriangle className="w-3 h-3" />
            {warningMachines.length} Attention{warningMachines.length > 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Alertes critiques */}
        {criticalMachines.length > 0 && (
          <Card className="bg-red-950/20 border-red-900/50 p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-red-950 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-400 mb-1">Alertes Critiques</h3>
                <p className="text-sm text-slate-400">Intervention immédiate requise</p>
              </div>
            </div>
            <div className="space-y-3">
              {criticalMachines.map((machine) => (
                <div key={machine.id} className="p-3 bg-slate-900/50 border border-red-900/30 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-white text-sm">{machine.name}</div>
                      <div className="text-xs text-slate-500">{machine.id}</div>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {machine.failureProbability}% panne
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-300">
                    {generateAlertMessage(machine)}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                    <Wrench className="w-3 h-3" />
                    <span>Maintenance recommandée: {machine.nextMaintenancePrediction}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Avertissements */}
        {warningMachines.length > 0 && (
          <Card className="bg-yellow-950/20 border-yellow-900/50 p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-yellow-950 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-400 mb-1">Avertissements</h3>
                <p className="text-sm text-slate-400">Surveillance accrue nécessaire</p>
              </div>
            </div>
            <div className="space-y-3">
              {warningMachines.map((machine) => (
                <div key={machine.id} className="p-3 bg-slate-900/50 border border-yellow-900/30 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-white text-sm">{machine.name}</div>
                      <div className="text-xs text-slate-500">{machine.id}</div>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-yellow-950 text-yellow-400 border-yellow-900">
                      {machine.failureProbability}% panne
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-300">
                    {generateAlertMessage(machine)}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                    <TrendingUp className="w-3 h-3" />
                    <span>Maintenance préventive: {machine.nextMaintenancePrediction}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Message si aucune alerte */}
        {criticalMachines.length === 0 && warningMachines.length === 0 && (
          <Card className="bg-green-950/20 border-green-900/50 p-5 col-span-2">
            <div className="flex items-center gap-3 justify-center py-6">
              <div className="p-3 bg-green-950 rounded-lg">
                <Activity className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-green-400 mb-1">Tout fonctionne correctement</h3>
                <p className="text-sm text-slate-400">Aucune alerte détectée - Toutes les machines sont opérationnelles</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </section>
  );
}
