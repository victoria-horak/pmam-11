from flask import Flask, render_template, request, jsonify, send_file
import requests
import csv
import os
import pandas as pd
from datetime import datetime

app = Flask(__name__)

SAMPLES_CSV = 'samples.csv'
GOOGLE_KEY = 'AIzaSyC_Ya-R0BRl5WP3RdoyvG0EAiHVInkL1R8'
TOMTOM_KEY = 'FBf9IxQ5FV25Ck8jprol7trZYDy5X9Su'

if not os.path.isfile(SAMPLES_CSV):
    with open(SAMPLES_CSV, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([
            'index', 'datetime', 'time_of_day', 'segment',
            'current_speed', 'free_flow_speed', 'speed_ratio',
            'current_travel_time', 'free_flow_travel_time', 'travel_time_ratio',
            'confidence', 'has_roadwork', 'has_accident'
        ])


def get_time_of_day(hour):
    if 6 <= hour < 12:
        return 'morning'
    elif 12 <= hour < 18:
        return 'day'
    elif 18 <= hour < 22:
        return 'evening'
    else:
        return 'night'


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/geocode', methods=['POST'])
def geocode():
    origin = request.form['origin_address']
    destination = request.form['destination_address']
    olat, olng = geocode_address(origin)
    dlat, dlng = geocode_address(destination)
    if olat and dlat:
        return jsonify({
            'origin_lat': olat, 'origin_lng': olng,
            'destination_lat': dlat, 'destination_lng': dlng
        })
    return jsonify({'error': 'Не вдалося знайти одну з адрес.'}), 400


def geocode_address(address):
    url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={GOOGLE_KEY}"
    resp = requests.get(url)
    if resp.status_code == 200:
        data = resp.json()
        if data.get('status') == 'OK':
            loc = data['results'][0]['geometry']['location']
            return loc['lat'], loc['lng']
    return None, None


@app.route('/traffic', methods=['POST'])
def traffic_proxy():
    data = request.json
    point = data.get('point')
    if not point:
        return jsonify({'error': 'Missing point'}), 400
    url = (
        f"https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json"
        f"?point={point}&key={TOMTOM_KEY}"
    )
    try:
        resp = requests.get(url)
        return jsonify(resp.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/sample', methods=['POST'])
def record_sample():
    data = request.json
    df = pd.read_csv(SAMPLES_CSV)

    if data.get('segment') == 'meta':
        current_index = df['index'].dropna().astype(int).max() if not df.empty else 0
        current_index = 1 if pd.isna(current_index) else int(current_index) + 1

        now = datetime.now()
        dt_string = now.strftime('%Y-%m-%d %H:%M:%S')
        time_of_day = get_time_of_day(now.hour)

        with open(SAMPLES_CSV, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([
                current_index, dt_string, time_of_day, 'meta',
                '', '', '', '', '', '', '', '', ''
            ])
        return jsonify({'status': 'meta recorded', 'index': current_index})

    index = data.get('index')
    segment = data.get('segment')
    current_speed = data.get('speed', 0)
    free_flow_speed = data.get('free_flow', 1)
    speed_ratio = current_speed / free_flow_speed if free_flow_speed else 0

    current_tt = data.get('current_travel_time', 0)
    free_flow_tt = data.get('free_flow_travel_time', 1)
    tt_ratio = current_tt / free_flow_tt if free_flow_tt else 0

    confidence = data.get('confidence', 0)
    roadwork = data.get('has_roadwork', 0)
    accident = data.get('has_accident', 0)

    now = datetime.now()
    dt_string = now.strftime('%Y-%m-%d %H:%M:%S')
    time_of_day = get_time_of_day(now.hour)

    with open(SAMPLES_CSV, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([
            index, dt_string, time_of_day, segment,
            current_speed, free_flow_speed, speed_ratio,
            current_tt, free_flow_tt, tt_ratio,
            confidence, roadwork, accident
        ])

    return jsonify({'status': 'segment recorded', 'index': index})


@app.route('/samples.csv')
def get_csv():
    return send_file(SAMPLES_CSV, mimetype='text/csv')


if __name__ == '__main__':
    app.run(debug=True)
