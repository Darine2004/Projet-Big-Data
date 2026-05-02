CREATE EXTENSION IF NOT EXISTS timescaledb;

CREATE TABLE IF NOT EXISTS sensor_readings (
  time            TIMESTAMPTZ     NOT NULL,
  machine_id      VARCHAR(10)     NOT NULL,
  machine_name    VARCHAR(100),
  machine_type    VARCHAR(100),
  vibration       FLOAT,
  temperature     FLOAT,
  current_amp     FLOAT,
  status          VARCHAR(20),
  failure_prob    FLOAT,
  uptime          FLOAT
);

SELECT create_hypertable('sensor_readings', 'time', if_not_exists => TRUE);

CREATE INDEX IF NOT EXISTS idx_machine_time ON sensor_readings (machine_id, time DESC);
