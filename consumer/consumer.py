import json
import os
import time
import psycopg2
from kafka import KafkaConsumer
from kafka.errors import NoBrokersAvailable

KAFKA_BROKER = os.getenv('KAFKA_BROKER', 'localhost:9092')
TOPIC        = 'sensor-readings'
DB_HOST      = os.getenv('DB_HOST',     'localhost')
DB_PORT      = os.getenv('DB_PORT',     '5432')
DB_NAME      = os.getenv('DB_NAME',     'sensors_db')
DB_USER      = os.getenv('DB_USER',     'admin')
DB_PASSWORD  = os.getenv('DB_PASSWORD', 'password')

INSERT = """
INSERT INTO sensor_readings
  (time, machine_id, machine_name, machine_type,
   vibration, temperature, current_amp, status, failure_prob, uptime)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
"""

def connect_db(retries=20):
    for i in range(retries):
        try:
            conn = psycopg2.connect(
                host=DB_HOST, port=DB_PORT, dbname=DB_NAME,
                user=DB_USER, password=DB_PASSWORD
            )
            print("Connecté à TimescaleDB")
            return conn
        except psycopg2.OperationalError:
            print(f"DB non disponible, tentative {i+1}/{retries}...")
            time.sleep(3)
    raise RuntimeError("Impossible de se connecter à la base de données")

def connect_kafka(retries=15):
    for i in range(retries):
        try:
            consumer = KafkaConsumer(
                TOPIC,
                bootstrap_servers=[KAFKA_BROKER],
                auto_offset_reset='latest',
                group_id='sensor-consumer',
                value_deserializer=lambda m: json.loads(m.decode('utf-8'))
            )
            print(f"Connecté à Kafka, écoute du topic '{TOPIC}'")
            return consumer
        except NoBrokersAvailable:
            print(f"Kafka non disponible, tentative {i+1}/{retries}...")
            time.sleep(5)
    raise RuntimeError("Impossible de se connecter à Kafka")

def main():
    conn     = connect_db()
    cursor   = conn.cursor()
    consumer = connect_kafka()

    for message in consumer:
        d = message.value
        try:
            cursor.execute(INSERT, (
                d['timestamp'],
                d['machine_id'],
                d['machine_name'],
                d['machine_type'],
                d['sensors']['vibration'],
                d['sensors']['temperature'],
                d['sensors']['current'],
                d['status'],
                d['failure_probability'],
                d['uptime'],
            ))
            conn.commit()
        except Exception as e:
            print(f"Erreur insertion: {e}")
            conn.rollback()

if __name__ == '__main__':
    main()
