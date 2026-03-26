import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from './ui/card';
import { type Machine, generateHistoricalData } from '../utils/dataSimulator';
import { Activity, Thermometer, Zap } from 'lucide-react';

interface SensorChartsProps {
  machines: Machine[];
}

export function SensorCharts({ machines }: SensorChartsProps) {
  const historicalData = generateHistoricalData(machines);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-slate-300 text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value} {entry.dataKey === 'temperature' ? '°C' : entry.dataKey === 'vibration' ? 'Hz' : 'A'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Graphique Vibrations */}
      <Card className="bg-slate-900 border-slate-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-white">Vibrations Moyennes</h3>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="time" 
              stroke="#94a3b8" 
              fontSize={12}
              tick={{ fill: '#94a3b8' }}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={12}
              tick={{ fill: '#94a3b8' }}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="vibration" 
              stroke="#a78bfa" 
              strokeWidth={2}
              dot={false}
              name="Vibration"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-3 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Seuil critique</span>
            <span className="text-red-400 font-semibold">90 Hz</span>
          </div>
        </div>
      </Card>

      {/* Graphique Température */}
      <Card className="bg-slate-900 border-slate-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Thermometer className="w-5 h-5 text-orange-400" />
          <h3 className="font-semibold text-white">Température Moyenne</h3>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="time" 
              stroke="#94a3b8" 
              fontSize={12}
              tick={{ fill: '#94a3b8' }}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={12}
              tick={{ fill: '#94a3b8' }}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="temperature" 
              stroke="#fb923c" 
              strokeWidth={2}
              dot={false}
              name="Température"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-3 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Seuil critique</span>
            <span className="text-red-400 font-semibold">85°C</span>
          </div>
        </div>
      </Card>

      {/* Graphique Courant */}
      <Card className="bg-slate-900 border-slate-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-400" />
          <h3 className="font-semibold text-white">Courant Moyen</h3>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="time" 
              stroke="#94a3b8" 
              fontSize={12}
              tick={{ fill: '#94a3b8' }}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={12}
              tick={{ fill: '#94a3b8' }}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="current" 
              stroke="#facc15" 
              strokeWidth={2}
              dot={false}
              name="Courant"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-3 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Seuil critique</span>
            <span className="text-red-400 font-semibold">95 A</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
