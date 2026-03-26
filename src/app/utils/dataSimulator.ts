export type MachineStatus = 'operational' | 'warning' | 'critical' | 'maintenance';

export interface SensorData {
  vibration: number; // Hz
  temperature: number; // °C
  current: number; // A
}

export interface Machine {
  id: string;
  name: string;
  type: string;
  status: MachineStatus;
  sensors: SensorData;
  lastMaintenance: string;
  nextMaintenancePrediction: string;
  failureProbability: number; // 0-100%
  uptime: number; // heures
}

// Génère une valeur aléatoire dans une plage avec variation
const randomInRange = (min: number, max: number, variance: number = 0.1): number => {
  const base = min + Math.random() * (max - min);
  const variation = base * variance * (Math.random() - 0.5);
  return Math.round((base + variation) * 100) / 100;
};

// Détermine le status basé sur les seuils
const determineStatus = (sensors: SensorData): MachineStatus => {
  const { vibration, temperature, current } = sensors;
  
  // Seuils critiques
  if (vibration > 90 || temperature > 85 || current > 95) {
    return 'critical';
  }
  
  // Seuils d'avertissement
  if (vibration > 75 || temperature > 75 || current > 85) {
    return 'warning';
  }
  
  // Maintenance programmée (5% de chance)
  if (Math.random() < 0.05) {
    return 'maintenance';
  }
  
  return 'operational';
};

// Calcule la probabilité de panne basée sur les capteurs
const calculateFailureProbability = (sensors: SensorData, status: MachineStatus): number => {
  if (status === 'critical') return randomInRange(70, 95);
  if (status === 'warning') return randomInRange(40, 65);
  if (status === 'maintenance') return randomInRange(5, 15);
  return randomInRange(1, 20);
};

// Génère les données pour toutes les machines
export const generateMachineData = (): Machine[] => {
  const machineTypes = [
    { type: 'Presse Hydraulique', count: 3 },
    { type: 'Compresseur', count: 2 },
    { type: 'Moteur Principal', count: 4 },
    { type: 'Pompe', count: 3 },
    { type: 'Convoyeur', count: 2 },
  ];

  const machines: Machine[] = [];
  let idCounter = 1;

  machineTypes.forEach(({ type, count }) => {
    for (let i = 1; i <= count; i++) {
      const sensors: SensorData = {
        vibration: randomInRange(35, 95, 0.15),
        temperature: randomInRange(45, 90, 0.15),
        current: randomInRange(50, 98, 0.15),
      };

      const status = determineStatus(sensors);
      const failureProbability = calculateFailureProbability(sensors, status);

      // Dates de maintenance
      const lastMaintenanceDays = Math.floor(Math.random() * 60) + 1;
      const nextMaintenanceDays = status === 'critical' 
        ? Math.floor(Math.random() * 3) + 1
        : status === 'warning'
        ? Math.floor(Math.random() * 7) + 3
        : Math.floor(Math.random() * 30) + 10;

      machines.push({
        id: `M${idCounter.toString().padStart(3, '0')}`,
        name: `${type} ${i}`,
        type,
        status,
        sensors,
        lastMaintenance: `Il y a ${lastMaintenanceDays} jours`,
        nextMaintenancePrediction: `Dans ${nextMaintenanceDays} jours`,
        failureProbability,
        uptime: randomInRange(1000, 8000, 0.2),
      });

      idCounter++;
    }
  });

  return machines;
};

// Génère des données historiques pour les graphiques
export const generateHistoricalData = (machines: Machine[]) => {
  const dataPoints = 20;
  const historicalData = [];

  for (let i = dataPoints - 1; i >= 0; i--) {
    const timestamp = new Date(Date.now() - i * 15 * 60 * 1000); // 15 minutes d'intervalle
    const avgVibration = machines.reduce((sum, m) => sum + m.sensors.vibration, 0) / machines.length;
    const avgTemperature = machines.reduce((sum, m) => sum + m.sensors.temperature, 0) / machines.length;
    const avgCurrent = machines.reduce((sum, m) => sum + m.sensors.current, 0) / machines.length;

    historicalData.push({
      time: timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      vibration: Math.round(avgVibration * 10) / 10,
      temperature: Math.round(avgTemperature * 10) / 10,
      current: Math.round(avgCurrent * 10) / 10,
    });
  }

  return historicalData;
};
