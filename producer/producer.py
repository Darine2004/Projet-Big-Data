import json
import time
import random
import os
from datetime import datetime, timezone
from kafka import KafkaProducer
from kafka.errors import NoBrokersAvailable

KAFKA_BROKER = os.getenv('KAFKA_BROKER', 'localhost:9092')
TOPIC = 'sensor-readings'

MACHINES = [
    {'id': 'M001', 'name': 'Sérigraphe à Pâte 1',       'type': 'Sérigraphe à Pâte'},
    {'id': 'M002', 'name': 'Sérigraphe à Pâte 2',       'type': 'Sérigraphe à Pâte'},
    {'id': 'M003', 'name': 'Sérigraphe à Pâte 3',       'type': 'Sérigraphe à Pâte'},
    {'id': 'M004', 'name': 'Machine Pick & Place 1',    'type': 'Machine Pick & Place'},
    {'id': 'M005', 'name': 'Machine Pick & Place 2',    'type': 'Machine Pick & Place'},
    {'id': 'M006', 'name': 'Four à Refusion 1',         'type': 'Four à Refusion'},
    {'id': 'M007', 'name': 'Four à Refusion 2',         'type': 'Four à Refusion'},
    {'id': 'M008', 'name': 'Four à Refusion 3',         'type': 'Four à Refusion'},
    {'id': 'M009', 'name': 'Four à Refusion 4',         'type': 'Four à Refusion'},
    {'id': 'M010', 'name': 'Inspection Optique AOI 1',  'type': 'Inspection Optique AOI'},
    {'id': 'M011', 'name': 'Inspection Optique AOI 2',  'type': 'Inspection Optique AOI'},
    {'id': 'M012', 'name': 'Inspection Optique AOI 3',  'type': 'Inspection Optique AOI'},
    {'id': 'M013', 'name': 'Soudeuse à Vague 1',        'type': 'Soudeuse à Vague'},
    {'id': 'M014', 'name': 'Soudeuse à Vague 2',        'type': 'Soudeuse à Vague'},
]

uptimes = {m['id']: random.uniform(1000, 8000) for m in MACHINES}

def rand(min_val, max_val, variance=0.1):
    base = min_val + random.random() * (max_val - min_val)
    return round(base + base * variance * (random.random() - 0.5), 2)

def get_status(v, t, c):
    if v > 90 or t > 85 or c > 95:
        return 'critical'
    if v > 75 or t > 75 or c > 85:
        return 'warning'
    if random.random() < 0.05:
        return 'maintenance'
    return 'operational'

def get_failure_prob(status):
    if status == 'critical':    return rand(70, 95)
    if status == 'warning':     return rand(40, 65)
    if status == 'maintenance': return rand(5, 15)
    return rand(1, 20)

def connect_kafka(retries=15):
    for i in range(retries):
        try:
            p = KafkaProducer(bootstrap_servers=[KAFKA_BROKER])
            print(f"Connecté à Kafka ({KAFKA_BROKER})")
            return p
        except NoBrokersAvailable:
            print(f"Kafka non disponible, tentative {i+1}/{retries}...")
            time.sleep(5)
    raise RuntimeError("Impossible de se connecter à Kafka")

def main():
    producer = connect_kafka()
    print(f"Publication sur le topic '{TOPIC}' toutes les 5 secondes...")

    while True:
        for m in MACHINES:
            v = rand(35, 95, 0.15)
            t = rand(45, 90, 0.15)
            c = rand(50, 98, 0.15)
            status = get_status(v, t, c)
            uptimes[m['id']] += 5 / 3600

            msg = {
                'machine_id':   m['id'],
                'machine_name': m['name'],
                'machine_type': m['type'],
                'timestamp':    datetime.now(timezone.utc).isoformat(),
                'sensors': {
                    'vibration':   v,
                    'temperature': t,
                    'current':     c,
                },
                'status':             status,
                'failure_probability': get_failure_prob(status),
                'uptime':             round(uptimes[m['id']], 2),
            }
            producer.send(TOPIC, json.dumps(msg).encode(), key=m['id'].encode())

        producer.flush()
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {len(MACHINES)} lectures envoyées")
        time.sleep(5)

if __name__ == '__main__':
    main()
