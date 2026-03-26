import { Database, Activity, Zap, Server } from 'lucide-react';
import { Card } from './ui/card';

export function BigDataStats() {
  const stats = [
    {
      icon: Database,
      label: 'Volume de données',
      value: '2.4 To/jour',
      subtext: 'Collecte en continu',
      color: 'text-blue-400',
      bgColor: 'bg-blue-950/50',
    },
    {
      icon: Zap,
      label: 'Messages par seconde',
      value: '850k msg/s',
      subtext: 'Kafka Streaming',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-950/50',
    },
    {
      icon: Activity,
      label: 'Capteurs actifs',
      value: '1,247',
      subtext: 'IoT Devices',
      color: 'text-green-400',
      bgColor: 'bg-green-950/50',
    },
    {
      icon: Server,
      label: 'Latence moyenne',
      value: '12 ms',
      subtext: 'TimescaleDB',
      color: 'text-purple-400',
      bgColor: 'bg-purple-950/50',
    },
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">Infrastructure Big Data & IoT</h2>
        <div className="text-sm text-slate-400">
          Mise à jour : {new Date().toLocaleTimeString('fr-FR')}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-slate-900 border-slate-800 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="text-sm text-slate-400">{stat.label}</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-500">
                  {stat.subtext}
                </div>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
