import { type Machine } from './dataSimulator';
import { generateMachineData, generateHistoricalData } from './dataSimulator';

const API_URL = 'http://localhost:3001';

export type KafkaPartition = {
  partition:       number;
  latestOffset:    number;
  committedOffset: number;
  lag:             number;
  segmentStart:    number;
  logSizeBytes:    number;
};

export type KafkaStatus = {
  topic:          string;
  broker:         string;
  partitionCount: number;
  replication:    number;
  retentionMs:    number;
  partitions:     KafkaPartition[];
  totalMessages:  number;
  totalLag:       number;
};

export type StageStatus = 'active' | 'idle';

export type PipelineStatus = {
  producer:  { status: StageStatus; rate: string; machines: number };
  kafka:     { status: StageStatus; topic: string; broker: string };
  consumer:  { status: StageStatus; group: string; rowsLastMinute: number };
  database:  { status: StageStatus; totalRows: number; latestInsert: string; ageSeconds: number; rowsLastMinute: number; rowsLast10s: number };
  api:       { status: StageStatus; responseMs: number; port: number };
  frontend:  { status: StageStatus; refreshRate: string };
  simulationMode: boolean;
};

export type HistoricalPoint = {
  time: string;
  vibration: number;
  temperature: number;
  current: number;
};

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchMachines(): Promise<Machine[]> {
  try {
    return await fetchJSON<Machine[]>('/api/machines');
  } catch {
    return generateMachineData();
  }
}

export async function fetchKafkaStatus(): Promise<KafkaStatus | null> {
  try {
    return await fetchJSON<KafkaStatus>('/api/kafka-status');
  } catch {
    return null;
  }
}

export async function fetchPipelineStatus(): Promise<PipelineStatus> {
  try {
    return await fetchJSON<PipelineStatus>('/api/pipeline-status');
  } catch {
    return {
      producer:  { status: 'idle', rate: '14 msg / 5 s', machines: 0 },
      kafka:     { status: 'idle', topic: 'sensor-readings', broker: 'kafka:9092' },
      consumer:  { status: 'idle', group: 'sensor-consumer', rowsLastMinute: 0 },
      database:  { status: 'idle', totalRows: 0, latestInsert: '', ageSeconds: 999, rowsLastMinute: 0, rowsLast10s: 0 },
      api:       { status: 'idle', responseMs: 0, port: 3001 },
      frontend:  { status: 'active', refreshRate: '5 s' },
      simulationMode: true,
    };
  }
}

export async function fetchHistory(machines: Machine[]): Promise<HistoricalPoint[]> {
  try {
    const data = await fetchJSON<HistoricalPoint[]>('/api/history');
    if (data.length === 0) throw new Error('empty');
    return data;
  } catch {
    return generateHistoricalData(machines);
  }
}
