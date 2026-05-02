const express = require('express');
const { Pool } = require('pg');
const { Kafka } = require('kafkajs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'sensors_db',
  user:     process.env.DB_USER     || 'admin',
  password: process.env.DB_PASSWORD || 'password',
});

// ── Kafka Admin ────────────────────────────────────────────────────────────────
const KAFKA_BROKER = process.env.KAFKA_BROKER || 'kafka:29092';
const kafka = new Kafka({
  clientId: 'backend-admin',
  brokers: [KAFKA_BROKER],
  retry: { initialRetryTime: 5000, retries: 6 },
});
const kafkaAdmin = kafka.admin();
let kafkaReady = false;

(async () => {
  try {
    await kafkaAdmin.connect();
    kafkaReady = true;
    console.log('Kafka admin connecté');
  } catch (e) {
    console.warn('Kafka admin non disponible au démarrage:', e.message);
  }
})();

// Statut détaillé Kafka (topic, partitions, offsets, fichiers)
app.get('/api/kafka-status', async (req, res) => {
  if (!kafkaReady) return res.status(503).json({ error: 'Kafka non disponible' });
  try {
    const TOPIC = 'sensor-readings';
    const GROUP = 'sensor-consumer';

    const [topicOffsets, groupOffsets] = await Promise.all([
      kafkaAdmin.fetchTopicOffsets(TOPIC),
      kafkaAdmin.fetchOffsets({ groupId: GROUP, topics: [TOPIC] }),
    ]);

    const groupParts = groupOffsets[0]?.partitions ?? [];

    const partitions = topicOffsets.map(p => {
      const gp       = groupParts.find(g => g.partition === p.partition);
      const latest   = parseInt(p.offset);
      const raw      = gp ? parseInt(gp.offset) : -1;
      const committed = raw < 0 ? latest : raw;
      const lag      = Math.max(0, latest - committed);
      // Kafka segment file starts at the nearest lower multiple of 1000
      const segStart = Math.floor(latest / 1000) * 1000;
      return {
        partition:      p.partition,
        latestOffset:   latest,
        committedOffset: committed,
        lag,
        segmentStart:   segStart,
        logSizeBytes:   latest * 320, // ~320 B/message estimate
      };
    });

    const totalMessages = partitions.reduce((s, p) => s + p.latestOffset, 0);

    res.json({
      topic:          TOPIC,
      broker:         KAFKA_BROKER,
      partitionCount: partitions.length,
      replication:    1,
      retentionMs:    604800000, // 7 days
      partitions,
      totalMessages,
      totalLag:       partitions.reduce((s, p) => s + p.lag, 0),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Dernier état de chaque machine
app.get('/api/machines', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT DISTINCT ON (machine_id)
        machine_id, machine_name, machine_type,
        vibration, temperature, current_amp,
        status, failure_prob, uptime, time
      FROM sensor_readings
      ORDER BY machine_id, time DESC
    `);
    res.json(rows.map(r => ({
      id:     r.machine_id,
      name:   r.machine_name,
      type:   r.machine_type,
      status: r.status,
      sensors: {
        vibration:   parseFloat(r.vibration),
        temperature: parseFloat(r.temperature),
        current:     parseFloat(r.current_amp),
      },
      failureProbability:       Math.round(parseFloat(r.failure_prob)),
      uptime:                   Math.round(parseFloat(r.uptime)),
      lastMaintenance:          'Voir historique',
      nextMaintenancePrediction: r.status === 'critical' ? 'Dans 1-3 jours'
                               : r.status === 'warning'  ? 'Dans 3-7 jours'
                               : 'Dans 10-30 jours',
    })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Données historiques agrégées par 15 min (pour les graphiques)
app.get('/api/history', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        time_bucket('15 minutes', time) AS bucket,
        ROUND(AVG(vibration)::numeric, 1)   AS vibration,
        ROUND(AVG(temperature)::numeric, 1) AS temperature,
        ROUND(AVG(current_amp)::numeric, 1) AS current
      FROM sensor_readings
      WHERE time > NOW() - INTERVAL '5 hours'
      GROUP BY bucket
      ORDER BY bucket DESC
      LIMIT 20
    `);
    res.json(rows.reverse().map(r => ({
      time:        new Date(r.bucket).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      vibration:   parseFloat(r.vibration),
      temperature: parseFloat(r.temperature),
      current:     parseFloat(r.current),
    })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Alertes récentes
app.get('/api/alerts', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT machine_id, machine_name, machine_type, status, failure_prob, time
      FROM sensor_readings
      WHERE status IN ('critical', 'warning')
        AND time > NOW() - INTERVAL '1 hour'
      ORDER BY time DESC
      LIMIT 20
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Statistiques globales
app.get('/api/stats', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        COUNT(DISTINCT machine_id)                            AS total_machines,
        COUNT(*) FILTER (WHERE status = 'critical')          AS critical,
        COUNT(*) FILTER (WHERE status = 'warning')           AS warning,
        ROUND(AVG(failure_prob)::numeric, 1)                 AS avg_failure_prob,
        COUNT(*)                                             AS total_readings
      FROM (
        SELECT DISTINCT ON (machine_id) *
        FROM sensor_readings
        ORDER BY machine_id, time DESC
      ) latest
    `);
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Statut temps réel du pipeline
app.get('/api/pipeline-status', async (req, res) => {
  const start = Date.now();
  try {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*)                                                          AS total_rows,
        MAX(time)                                                         AS latest_insert,
        COUNT(*) FILTER (WHERE time > NOW() - INTERVAL '1 minute')       AS rows_last_minute,
        COUNT(*) FILTER (WHERE time > NOW() - INTERVAL '10 seconds')     AS rows_last_10s,
        COUNT(DISTINCT machine_id)                                        AS active_machines
      FROM sensor_readings
    `);
    const d = rows[0];
    const latestMs  = d.latest_insert ? new Date(d.latest_insert).getTime() : 0;
    const ageSeconds = Math.round((Date.now() - latestMs) / 1000);
    const isLive    = ageSeconds < 15;

    res.json({
      producer:  { status: isLive ? 'active' : 'idle', rate: '14 msg / 5 s', machines: parseInt(d.active_machines) },
      kafka:     { status: isLive ? 'active' : 'idle', topic: 'sensor-readings', broker: 'kafka:9092' },
      consumer:  { status: isLive ? 'active' : 'idle', group: 'sensor-consumer', rowsLastMinute: parseInt(d.rows_last_minute) },
      database:  {
        status: 'active',
        totalRows:      parseInt(d.total_rows),
        latestInsert:   d.latest_insert,
        ageSeconds,
        rowsLastMinute: parseInt(d.rows_last_minute),
        rowsLast10s:    parseInt(d.rows_last_10s),
      },
      api:      { status: 'active', responseMs: Date.now() - start, port: 3001 },
      frontend: { status: 'active', refreshRate: '5 s' },
      simulationMode: false,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API backend démarrée sur le port ${PORT}`));
