import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Header } from '../components/Header';
import { BigDataStats } from '../components/BigDataStats';
import { MachineGrid } from '../components/MachineGrid';
import { AlertsPanel } from '../components/AlertsPanel';
import { SensorCharts } from '../components/SensorCharts';
import { generateMachineData, type Machine } from '../utils/dataSimulator';
import { Button } from '../components/ui/button';

export default function Dashboard() {
  const navigate = useNavigate();
  const [machines, setMachines] = useState<Machine[]>([]);

  useEffect(() => {
    // Initialisation des données
    setMachines(generateMachineData());

    // Mise à jour toutes les 5 secondes
    const interval = setInterval(() => {
      setMachines(generateMachineData());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Séparer les machines avec alertes
  const machinesWithAlerts = machines.filter(m => m.status === 'warning' || m.status === 'critical');

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      
      {/* Bouton retour */}
      <div className="border-b border-slate-800 bg-slate-900/30">
        <div className="container mx-auto px-6 py-3">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-slate-400 hover:text-white gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Button>
        </div>
      </div>
      
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Statistiques Big Data */}
        <BigDataStats />

        {/* Alertes et Prédictions */}
        {machinesWithAlerts.length > 0 && (
          <AlertsPanel machines={machinesWithAlerts} />
        )}

        {/* Grille des machines */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">État des Machines</h2>
          <MachineGrid machines={machines} />
        </section>

        {/* Graphiques des capteurs */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Surveillance en Temps Réel</h2>
          <SensorCharts machines={machines} />
        </section>
      </main>
    </div>
  );
}
