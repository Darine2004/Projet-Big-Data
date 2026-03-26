import { Thermometer, Activity, Zap, Clock, Wrench } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { type Machine } from '../utils/dataSimulator';

interface MachineGridProps {
  machines: Machine[];
}

export function MachineGrid({ machines }: MachineGridProps) {
  const getStatusColor = (status: Machine['status']) => {
    switch (status) {
      case 'operational':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      case 'maintenance':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: Machine['status']) => {
    switch (status) {
      case 'operational':
        return 'Opérationnel';
      case 'warning':
        return 'Attention';
      case 'critical':
        return 'Critique';
      case 'maintenance':
        return 'Maintenance';
      default:
        return 'Inconnu';
    }
  };

  const getStatusBadgeVariant = (status: Machine['status']) => {
    switch (status) {
      case 'operational':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'critical':
        return 'destructive';
      case 'maintenance':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {machines.map((machine) => (
        <Card key={machine.id} className="bg-slate-900 border-slate-800 p-4 hover:border-slate-700 transition-colors">
          <div className="space-y-3">
            {/* En-tête */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(machine.status)} ${machine.status === 'operational' ? 'animate-pulse' : ''}`}></div>
                  <h3 className="font-semibold text-white">{machine.id}</h3>
                </div>
                <p className="text-sm text-slate-400">{machine.name}</p>
              </div>
              <Badge variant={getStatusBadgeVariant(machine.status)} className="text-xs">
                {getStatusLabel(machine.status)}
              </Badge>
            </div>

            {/* Capteurs */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-400">Vibration</span>
                </div>
                <span className={`font-semibold ${machine.sensors.vibration > 75 ? 'text-red-400' : 'text-slate-300'}`}>
                  {machine.sensors.vibration} Hz
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-orange-400" />
                  <span className="text-slate-400">Température</span>
                </div>
                <span className={`font-semibold ${machine.sensors.temperature > 75 ? 'text-red-400' : 'text-slate-300'}`}>
                  {machine.sensors.temperature}°C
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-slate-400">Courant</span>
                </div>
                <span className={`font-semibold ${machine.sensors.current > 85 ? 'text-red-400' : 'text-slate-300'}`}>
                  {machine.sensors.current} A
                </span>
              </div>
            </div>

            {/* Maintenance */}
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3 h-3" />
                <span>Uptime: {machine.uptime.toLocaleString('fr-FR')}h</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Wrench className="w-3 h-3" />
                <span>Prochaine maintenance: {machine.nextMaintenancePrediction}</span>
              </div>
            </div>

            {/* Probabilité de panne */}
            {machine.failureProbability > 30 && (
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Risque de panne</span>
                  <span className={`font-semibold ${
                    machine.failureProbability > 60 ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {machine.failureProbability}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      machine.failureProbability > 60 ? 'bg-red-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${machine.failureProbability}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
