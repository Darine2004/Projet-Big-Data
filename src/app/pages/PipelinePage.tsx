import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { fetchPipelineStatus, fetchMachines, fetchKafkaStatus, type PipelineStatus, type KafkaStatus } from '../utils/apiClient';
import { type Machine } from '../utils/dataSimulator';

// ─── Types ────────────────────────────────────────────────────────────────────

type PipelineEvent = {
  id: number;
  ts: string;
  label: string;
  sub: string;
  kind: 'data' | 'alert' | 'ok' | 'system';
};

// ─── CSS keyframes (injected once) ───────────────────────────────────────────

// ─── Kafka helpers ────────────────────────────────────────────────────────────

function fmtBytes(b: number): string {
  if (b < 1024)         return `${b} B`;
  if (b < 1024 * 1024)  return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}
function segName(n: number) { return String(n).padStart(20, '0'); }

// ─── Kafka Structure Panel ────────────────────────────────────────────────────

function KafkaStructurePanel({
  ks, prevTotal, dbRows, machines,
}: {
  ks: KafkaStatus | null;
  prevTotal: number;
  dbRows: number;
  machines: Machine[];
}) {
  // Use real Kafka data when available, fall back to DB row count as offset estimate
  const offset      = ks?.totalMessages   ?? dbRows;
  const committed   = ks?.partitions[0]?.committedOffset ?? offset;
  const lag         = ks?.totalLag        ?? 0;
  const retMs       = ks?.retentionMs     ?? 604800000;
  const broker      = ks?.broker          ?? 'kafka:29092';
  const isReal      = ks !== null;

  const segStart    = Math.floor(offset / 1000) * 1000;
  const logBytes    = offset * 320;
  const retDays     = Math.round(retMs / 86400000);
  const maxEstimate = (retMs / 5000) * 14;
  const fillPct     = Math.min(100, (offset / Math.max(1, maxEstimate)) * 100);

  const delta       = offset - prevTotal;
  const rateStr     = (isReal && prevTotal > 0) ? `${(delta / 2).toFixed(1)} msg/s` : '~2.8 msg/s';

  // Build message preview from current machines (last 4 readings)
  const previewMachines = machines.slice(0, 4);
  const nowMs = Date.now();

  return (
    <section className="bg-slate-900/50 border border-orange-900/40 rounded-2xl p-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📨</span>
          <div>
            <h2 className="text-base font-semibold text-white">
              Structure Kafka —{' '}
              <span className="font-mono text-orange-300">sensor-readings</span>
            </h2>
            <p className="text-xs text-slate-500">
              Broker : <span className="font-mono">{broker}</span>
              {!isReal && <span className="ml-2 text-amber-500">· estimé depuis TimescaleDB</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-lg font-mono ${isReal ? 'bg-green-900/40 text-green-300' : 'bg-amber-900/40 text-amber-300'}`}>
            {isReal ? '● Kafka live' : '○ Estimé'}
          </span>
          <span className="text-xs bg-orange-950/40 text-orange-300 px-2 py-1 rounded-lg font-mono">
            {rateStr}
          </span>
        </div>
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ── Col 1 : Offsets temps réel ── */}
        <div className="flex flex-col gap-3">
          <p className="text-[11px] text-slate-500 uppercase tracking-wider">Offsets — Partition 0</p>

          {/* LEO */}
          <div className="bg-slate-800/60 border border-orange-900/50 rounded-xl p-4">
            <p className="text-[10px] text-slate-500 mb-0.5">Log End Offset (LEO) — produit</p>
            <p
              key={offset}
              className="font-mono text-3xl font-bold text-orange-300"
              style={{ animation: 'slideIn 0.35s ease-out' }}
            >
              {offset.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-600 mt-1">+14 toutes les 5 secondes</p>
          </div>

          {/* Committed */}
          <div className="bg-slate-800/60 border border-teal-900/50 rounded-xl p-4">
            <p className="text-[10px] text-slate-500 mb-0.5">Committed offset — consommé</p>
            <p className="font-mono text-3xl font-bold text-teal-300">
              {committed.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-600 mt-1">groupe : sensor-consumer</p>
          </div>

          {/* Lag */}
          <div className={`bg-slate-800/60 border rounded-xl p-4 ${lag === 0 ? 'border-green-900/50' : 'border-yellow-900/50'}`}>
            <p className="text-[10px] text-slate-500 mb-0.5">Lag (messages non consommés)</p>
            <p className={`font-mono text-3xl font-bold ${lag === 0 ? 'text-green-400' : 'text-yellow-400'}`}>
              {lag === 0 ? '0 ✓' : lag}
            </p>
          </div>

          {/* Progress bar */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
              <span>Consommé / Produit</span>
              <span className="font-mono">{offset > 0 ? Math.round((committed / offset) * 100) : 100}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-600 to-teal-400 rounded-full transition-all duration-700"
                style={{ width: `${offset > 0 ? (committed / offset) * 100 : 100}%` }}
              />
            </div>
          </div>

          {/* Retention fill */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
              <span>Rétention utilisée ({retDays}j)</span>
              <span className="font-mono">{fillPct.toFixed(2)}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-700 to-blue-400 rounded-full transition-all duration-1000"
                style={{ width: `${fillPct}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-600 mt-1">{fmtBytes(logBytes)} utilisés</p>
          </div>
        </div>

        {/* ── Col 2 : Aperçu contenu .log ── */}
        <div className="flex flex-col gap-3">
          <p className="text-[11px] text-slate-500 uppercase tracking-wider">
            Aperçu — <span className="font-mono text-blue-300">{segName(segStart)}.log</span>
          </p>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 font-mono text-[10px] flex-1 overflow-auto max-h-[420px] space-y-3">
            {previewMachines.length === 0 && (
              <p className="text-slate-600">En attente de données...</p>
            )}
            {previewMachines.map((m, i) => {
              const msgOffset = offset - (previewMachines.length - i);
              const ts = nowMs - (previewMachines.length - i) * 357;
              const value = {
                machine_id:          m.id,
                machine_name:        m.name,
                machine_type:        m.type,
                timestamp:           new Date(ts).toISOString(),
                sensors: {
                  vibration:         m.sensors.vibration,
                  temperature:       m.sensors.temperature,
                  current:           m.sensors.current,
                },
                status:              m.status,
                failure_probability: m.failureProbability,
                uptime:              m.uptime,
              };
              const valStr = JSON.stringify(value, null, 2);
              return (
                <div
                  key={m.id}
                  className="border-b border-slate-800 pb-2 last:border-0"
                  style={{ animation: 'slideIn 0.3s ease-out' }}
                >
                  <div className="text-slate-500 mb-0.5">
                    <span className="text-purple-400">offset</span>
                    <span className="text-slate-300">: {msgOffset} </span>
                    <span className="text-purple-400">key</span>
                    <span className="text-slate-300">: {m.id} </span>
                    <span className="text-purple-400">ts</span>
                    <span className="text-slate-300">: {ts}</span>
                  </div>
                  <div className={`text-[9px] leading-relaxed ${
                    m.status === 'critical' ? 'text-red-300'
                    : m.status === 'warning' ? 'text-yellow-300'
                    : 'text-green-300'}`}>
                    {valStr.split('\n').slice(0, 10).map((line, li) => (
                      <div key={li}>{line}</div>
                    ))}
                    {valStr.split('\n').length > 10 && <div className="text-slate-600">  ...</div>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 text-[10px]">
            {[
              { color: 'text-green-300', label: 'operational' },
              { color: 'text-yellow-300', label: 'warning' },
              { color: 'text-red-300',   label: 'critical' },
            ].map(s => (
              <span key={s.label} className={`flex items-center gap-1 ${s.color}`}>
                <span className="w-2 h-2 rounded-full bg-current" />{s.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const STYLES = `
@keyframes pipelineFlow {
  0%   { left: -6px; opacity: 0; }
  8%   { opacity: 1; }
  92%  { opacity: 1; }
  100% { left: calc(100% + 6px); opacity: 0; }
}
@keyframes nodePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.5); }
  50%       { box-shadow: 0 0 0 10px rgba(59,130,246,0); }
}
@keyframes criticalPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
  50%       { box-shadow: 0 0 0 10px rgba(239,68,68,0); }
}
@keyframes slideIn {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

// ─── Node config ──────────────────────────────────────────────────────────────

type NodeCfg = {
  key: keyof PipelineStatus;
  label: string;
  sub: string;
  icon: string;
  techColor: string;
  borderActive: string;
  borderIdle: string;
  bgActive: string;
  dotColor: string;
  flowColor: string;
};

const NODES: NodeCfg[] = [
  {
    key: 'producer',
    label: 'Producer',
    sub: 'producer.py',
    icon: '🏭',
    techColor: 'text-green-400',
    borderActive: 'border-green-500',
    borderIdle: 'border-slate-700',
    bgActive: 'bg-green-950/40',
    dotColor: 'bg-green-400',
    flowColor: '#4ade80',
  },
  {
    key: 'kafka',
    label: 'Kafka',
    sub: 'sensor-readings',
    icon: '📨',
    techColor: 'text-orange-400',
    borderActive: 'border-orange-500',
    borderIdle: 'border-slate-700',
    bgActive: 'bg-orange-950/40',
    dotColor: 'bg-orange-400',
    flowColor: '#fb923c',
  },
  {
    key: 'consumer',
    label: 'Consumer',
    sub: 'consumer.py',
    icon: '⚙️',
    techColor: 'text-teal-400',
    borderActive: 'border-teal-500',
    borderIdle: 'border-slate-700',
    bgActive: 'bg-teal-950/40',
    dotColor: 'bg-teal-400',
    flowColor: '#2dd4bf',
  },
  {
    key: 'database',
    label: 'TimescaleDB',
    sub: 'sensor_readings',
    icon: '🗄️',
    techColor: 'text-blue-400',
    borderActive: 'border-blue-500',
    borderIdle: 'border-slate-700',
    bgActive: 'bg-blue-950/40',
    dotColor: 'bg-blue-400',
    flowColor: '#60a5fa',
  },
  {
    key: 'api',
    label: 'API',
    sub: 'server.js :3001',
    icon: '🌐',
    techColor: 'text-yellow-400',
    borderActive: 'border-yellow-500',
    borderIdle: 'border-slate-700',
    bgActive: 'bg-yellow-950/40',
    dotColor: 'bg-yellow-400',
    flowColor: '#facc15',
  },
  {
    key: 'frontend',
    label: 'Dashboard',
    sub: 'React + Recharts',
    icon: '📊',
    techColor: 'text-purple-400',
    borderActive: 'border-purple-500',
    borderIdle: 'border-slate-700',
    bgActive: 'bg-purple-950/40',
    dotColor: 'bg-purple-400',
    flowColor: '#c084fc',
  },
];

// ─── Helper: metric per node ──────────────────────────────────────────────────

function nodeMetric(key: keyof PipelineStatus, ps: PipelineStatus): string {
  switch (key) {
    case 'producer':  return ps.producer.rate;
    case 'kafka':     return `topic: ${ps.kafka.topic}`;
    case 'consumer':  return `${ps.consumer.rowsLastMinute} ins/min`;
    case 'database':  return `${ps.database.totalRows.toLocaleString()} lignes`;
    case 'api':       return ps.api.responseMs > 0 ? `${ps.api.responseMs} ms` : '—';
    case 'frontend':  return `refresh ${ps.frontend.refreshRate}`;
    default:          return '—';
  }
}

function isActive(key: keyof PipelineStatus, ps: PipelineStatus): boolean {
  const s = (ps[key] as { status: string }).status;
  return s === 'active';
}

// ─── Animated connector ───────────────────────────────────────────────────────

function Connector({ active, color, delay }: { active: boolean; color: string; delay: number }) {
  return (
    <div className="relative flex-1 self-center min-w-[24px] max-w-[60px]">
      {/* line */}
      <div
        className="h-px w-full"
        style={{ background: active ? color : '#334155' }}
      />
      {/* arrowhead */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2"
        style={{
          width: 0, height: 0,
          borderTop: '4px solid transparent',
          borderBottom: '4px solid transparent',
          borderLeft: `6px solid ${active ? color : '#334155'}`,
        }}
      />
      {/* flowing dot */}
      {active && (
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
          style={{
            background: color,
            boxShadow: `0 0 8px 3px ${color}55`,
            animation: `pipelineFlow 1.6s linear ${delay}s infinite`,
          }}
        />
      )}
    </div>
  );
}

// ─── Single node card ─────────────────────────────────────────────────────────

function NodeCard({ cfg, ps }: { cfg: NodeCfg; ps: PipelineStatus }) {
  const active = isActive(cfg.key, ps);
  return (
    <div
      className={`
        flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border transition-all duration-500 min-w-[100px]
        ${active ? `${cfg.borderActive} ${cfg.bgActive}` : 'border-slate-700 bg-slate-900/40'}
      `}
      style={active ? { animation: 'nodePulse 2.5s ease-in-out infinite' } : {}}
    >
      <span className="text-2xl">{cfg.icon}</span>
      <p className="text-xs font-bold text-white text-center leading-tight">{cfg.label}</p>
      <p className="text-[10px] text-slate-400 text-center">{cfg.sub}</p>

      {/* status badge */}
      <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold
        ${active ? 'bg-green-900/60 text-green-300' : 'bg-slate-800 text-slate-500'}`}>
        <span
          className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-400' : 'bg-slate-600'}`}
          style={active ? { animation: 'nodePulse 1.2s ease-in-out infinite' } : {}}
        />
        {active ? 'actif' : 'hors ligne'}
      </div>

      {/* metric */}
      <p className={`text-[10px] font-mono text-center ${cfg.techColor}`}>
        {nodeMetric(cfg.key, ps)}
      </p>
    </div>
  );
}

// ─── Event feed ───────────────────────────────────────────────────────────────

const kindStyle: Record<PipelineEvent['kind'], string> = {
  data:   'text-blue-400',
  alert:  'text-red-400',
  ok:     'text-green-400',
  system: 'text-slate-400',
};
const kindDot: Record<PipelineEvent['kind'], string> = {
  data:   'bg-blue-400',
  alert:  'bg-red-400',
  ok:     'bg-green-400',
  system: 'bg-slate-500',
};

function EventFeed({ events }: { events: PipelineEvent[] }) {
  return (
    <div className="flex flex-col gap-1 max-h-64 overflow-y-auto pr-1">
      {events.length === 0 && (
        <p className="text-xs text-slate-500 text-center py-4">En attente de données…</p>
      )}
      {events.map(ev => (
        <div
          key={ev.id}
          className="flex items-start gap-2 text-xs py-1.5 border-b border-slate-800/60"
          style={{ animation: 'slideIn 0.3s ease-out' }}
        >
          <span className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${kindDot[ev.kind]}`} />
          <div className="min-w-0 flex-1">
            <span className={`font-mono font-semibold ${kindStyle[ev.kind]}`}>{ev.label}</span>
            <span className="text-slate-400 ml-1">{ev.sub}</span>
          </div>
          <span className="text-slate-600 font-mono shrink-0">{ev.ts}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Metric card ──────────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col gap-1">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
      <p className="text-xs text-slate-500">{sub}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

let eventCounter = 0;

export default function PipelinePage() {
  const navigate = useNavigate();
  const [ps, setPs] = useState<PipelineStatus | null>(null);
  const [ks, setKs] = useState<KafkaStatus | null>(null);
  const [prevKafkaTotal, setPrevKafkaTotal] = useState(0);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [events, setEvents] = useState<PipelineEvent[]>([]);
  const [lastRefresh, setLastRefresh] = useState('—');
  const prevMachinesRef = useRef<Machine[]>([]);

  const pushEvent = useCallback((ev: Omit<PipelineEvent, 'id'>) => {
    setEvents(prev => [{ ...ev, id: ++eventCounter }, ...prev].slice(0, 30));
  }, []);

  // Poll pipeline status + Kafka status every 2 s
  useEffect(() => {
    const load = async () => {
      const [pipeData, kafkaData] = await Promise.all([
        fetchPipelineStatus(),
        fetchKafkaStatus(),
      ]);
      setPs(pipeData);
      if (kafkaData) {
        setKs(prev => {
          setPrevKafkaTotal(prev?.totalMessages ?? 0);
          return kafkaData;
        });
      }
      setLastRefresh(new Date().toLocaleTimeString('fr-FR'));
    };
    load();
    const t = setInterval(load, 2000);
    return () => clearInterval(t);
  }, []);

  // Poll machines every 5 s, build event feed from changes
  useEffect(() => {
    const load = async () => {
      const data = await fetchMachines();
      setMachines(data);

      const prev = prevMachinesRef.current;
      const ts = new Date().toLocaleTimeString('fr-FR');

      if (prev.length === 0) {
        // first load — summary event
        pushEvent({ ts, kind: 'system', label: 'Initialisation', sub: `${data.length} machines chargées` });
      } else {
        // detect status changes
        data.forEach(m => {
          const old = prev.find(p => p.id === m.id);
          if (!old) return;
          if (old.status !== m.status) {
            const kind = m.status === 'critical' ? 'alert' : m.status === 'warning' ? 'alert' : 'ok';
            pushEvent({ ts, kind, label: m.id, sub: `${old.status} → ${m.status} (${m.name})` });
          } else if (m.status === 'critical' || m.status === 'warning') {
            pushEvent({
              ts, kind: 'alert', label: m.id,
              sub: `${m.name} — vib ${m.sensors.vibration}Hz, ${m.sensors.temperature}°C`,
            });
          }
        });

        // one batch event per cycle
        const nb = data.filter(m => m.status === 'operational').length;
        pushEvent({ ts, kind: 'data', label: 'Batch reçu', sub: `14 lectures — ${nb} opérationnelles` });
      }

      prevMachinesRef.current = data;
    };

    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [pushEvent]);

  const simMode = ps?.simulationMode ?? true;
  const dbAge   = ps?.database.ageSeconds ?? 999;
  const fresh   = dbAge < 15;

  // stagger connector delays
  const connectorDelays = [0, 0.27, 0.54, 0.81, 1.08];

  return (
    <div className="min-h-screen bg-slate-950">
      <style>{STYLES}</style>
      <Header />

      {/* Breadcrumb */}
      <div className="border-b border-slate-800 bg-slate-900/30">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <Button onClick={() => navigate('/')} variant="ghost" className="text-slate-400 hover:text-white gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
          </Button>
          <div className="flex items-center gap-3 text-xs">
            {simMode
              ? <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-900/50 border border-amber-700 text-amber-300"><WifiOff className="w-3 h-3" /> Mode simulation</span>
              : <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-900/50 border border-green-700 text-green-300"><Wifi className="w-3 h-3" /> Pipeline connecté</span>
            }
            <span className="text-slate-500 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> {lastRefresh}
            </span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8 space-y-8">

        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold text-white">Pipeline en Temps Réel</h1>
          <p className="mt-1 text-slate-400 text-sm">
            Visualisation live du flux de données — de la génération jusqu'à l'affichage.
          </p>
        </div>

        {/* ── Pipeline visual ── */}
        <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Flux de données
            </h2>
            {ps && !simMode && (
              <span className="text-xs text-slate-500 font-mono">
                Dernière insertion : {dbAge < 5 ? 'à l\'instant' : `il y a ${dbAge}s`}
              </span>
            )}
          </div>

          {/* Nodes + connectors */}
          <div className="flex items-center gap-0 overflow-x-auto pb-2">
            {NODES.map((cfg, i) => (
              <div key={cfg.key} className="flex items-center flex-1 min-w-0">
                <NodeCard cfg={cfg} ps={ps ?? {
                  producer: { status: 'idle', rate: '—', machines: 0 },
                  kafka: { status: 'idle', topic: '—', broker: '—' },
                  consumer: { status: 'idle', group: '—', rowsLastMinute: 0 },
                  database: { status: 'idle', totalRows: 0, latestInsert: '', ageSeconds: 999, rowsLastMinute: 0, rowsLast10s: 0 },
                  api: { status: 'idle', responseMs: 0, port: 3001 },
                  frontend: { status: 'active', refreshRate: '5 s' },
                  simulationMode: true,
                }} />
                {i < NODES.length - 1 && ps && (
                  <Connector
                    active={isActive(cfg.key, ps) && isActive(NODES[i + 1].key, ps)}
                    color={cfg.flowColor}
                    delay={connectorDelays[i]}
                  />
                )}
                {i < NODES.length - 1 && !ps && (
                  <div className="flex-1 h-px bg-slate-700 min-w-[24px] max-w-[60px]" />
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Actif — données fraîches (&lt; 15 s)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-600" /> Hors ligne ou non démarré</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-6 h-px bg-blue-400" /><span className="w-2 h-2 rounded-full bg-blue-400" /> Paquet en transit</span>
          </div>
        </section>

        {/* ── Live metrics ── */}
        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Métriques live</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Lignes en base"
              value={ps ? ps.database.totalRows.toLocaleString() : '—'}
              sub="sensor_readings (TimescaleDB)"
              color="text-blue-400"
            />
            <MetricCard
              label="Insertions / min"
              value={ps ? String(ps.database.rowsLastMinute) : '—'}
              sub="via consumer.py → TimescaleDB"
              color="text-teal-400"
            />
            <MetricCard
              label="Fraîcheur des données"
              value={ps ? (ps.database.ageSeconds < 999 ? `${ps.database.ageSeconds} s` : 'N/A') : '—'}
              sub={fresh ? 'Pipeline actif ✓' : 'Données périmées ou hors ligne'}
              color={fresh ? 'text-green-400' : 'text-amber-400'}
            />
            <MetricCard
              label="Latence API"
              value={ps && !simMode ? `${ps.api.responseMs} ms` : '—'}
              sub="/api/pipeline-status"
              color="text-yellow-400"
            />
          </div>
        </section>

        {/* ── TimescaleDB table ── */}
        <section className="bg-slate-900/50 border border-blue-900/40 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🗄️</span>
            <h2 className="text-base font-semibold text-white">Table TimescaleDB</h2>
          </div>
          <p className="text-xs text-slate-500 mb-5 ml-8">
            <span className="font-mono text-blue-300">sensor_readings</span>
            {' '}— Hypertable partitionnée par{' '}
            <span className="font-mono text-blue-300">time</span>
          </p>

          <div className="overflow-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left border-b border-slate-700">
                  <th className="pb-2 pr-6 text-slate-400 font-medium">Colonne</th>
                  <th className="pb-2 pr-6 text-slate-400 font-medium">Type</th>
                  <th className="pb-2 text-slate-400 font-medium">Rôle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {[
                  { name: 'time',         type: 'TIMESTAMPTZ',   role: 'Partition key (hypertable)',                               pk: true  },
                  { name: 'machine_id',   type: 'VARCHAR(10)',    role: 'Identifiant machine ex: M001',                            idx: true },
                  { name: 'machine_name', type: 'VARCHAR(100)',   role: 'Nom lisible ex: Sérigraphe à Pâte 1'                               },
                  { name: 'machine_type', type: 'VARCHAR(100)',   role: 'Catégorie de machine'                                              },
                  { name: 'vibration',    type: 'FLOAT',          role: 'Capteur vibration (Hz) — seuil critique > 90'                      },
                  { name: 'temperature',  type: 'FLOAT',          role: 'Capteur température (°C) — seuil critique > 85'                    },
                  { name: 'current_amp',  type: 'FLOAT',          role: 'Capteur courant (A) — seuil critique > 95'                         },
                  { name: 'status',       type: 'VARCHAR(20)',    role: 'operational | warning | critical | maintenance'                     },
                  { name: 'failure_prob', type: 'FLOAT',          role: 'Probabilité de panne 0–100%'                                       },
                  { name: 'uptime',       type: 'FLOAT',          role: 'Durée de fonctionnement (heures)'                                  },
                ].map(col => (
                  <tr key={col.name} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 pr-6">
                      <span className={`font-mono ${col.pk ? 'text-yellow-400 font-semibold' : col.idx ? 'text-blue-300' : 'text-slate-300'}`}>
                        {col.name}
                      </span>
                      {col.pk  && <span className="ml-1.5 text-[10px] text-yellow-500 font-bold">PK</span>}
                      {col.idx && <span className="ml-1.5 text-[10px] text-blue-500 font-bold">IDX</span>}
                    </td>
                    <td className="py-2 pr-6">
                      <span className="font-mono text-xs text-green-400">{col.type}</span>
                    </td>
                    <td className="py-2 text-xs text-slate-400">{col.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700 font-mono text-xs">
            <span className="text-purple-400">CREATE INDEX</span>
            {' '}<span className="text-slate-300">idx_machine_time</span>
            {' '}<span className="text-slate-500">ON</span>
            {' '}<span className="text-slate-300">sensor_readings</span>
            {' '}<span className="text-slate-500">(</span>
            <span className="text-slate-300">machine_id, time </span>
            <span className="text-slate-500">DESC);</span>
          </div>
        </section>

        {/* ── Kafka structure ── */}
        <KafkaStructurePanel
          ks={ks}
          prevTotal={prevKafkaTotal}
          dbRows={ps?.database.totalRows ?? 0}
          machines={machines}
        />

        {/* ── Bottom panels ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Machines actuelles */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
              État des machines
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {machines.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">En attente…</p>
              )}
              {[...machines]
                .sort((a, b) => {
                  const order = { critical: 0, warning: 1, maintenance: 2, operational: 3 };
                  return order[a.status] - order[b.status];
                })
                .map(m => {
                  const colors: Record<string, string> = {
                    critical:    'text-red-400 bg-red-950/40 border-red-800',
                    warning:     'text-yellow-400 bg-yellow-950/30 border-yellow-800',
                    maintenance: 'text-blue-400 bg-blue-950/30 border-blue-800',
                    operational: 'text-green-400 bg-green-950/30 border-green-800',
                  };
                  return (
                    <div key={m.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${colors[m.status]}`}>
                      <span className="font-mono font-bold w-10 shrink-0">{m.id}</span>
                      <span className="flex-1 text-slate-300 truncate">{m.name}</span>
                      <span className="font-mono shrink-0">{m.sensors.vibration}Hz</span>
                      <span className="font-mono shrink-0">{m.sensors.temperature}°C</span>
                      <span className="font-semibold shrink-0 capitalize">{m.status}</span>
                    </div>
                  );
                })}
            </div>
          </section>

          {/* Activity log */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Journal d'activité
              </h2>
              <button
                onClick={() => setEvents([])}
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
              >
                Effacer
              </button>
            </div>
            <EventFeed events={events} />
          </section>

        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-4 pt-2">
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="border-slate-700 text-slate-300 hover:text-white gap-2">
            Dashboard <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

      </main>
    </div>
  );
}
