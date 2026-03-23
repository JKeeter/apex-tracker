#!/usr/bin/env python3
"""Generate QR codes from supplement or workout config JSON files."""

import gzip
import base64
import json
import sys
import os
import subprocess

def main():
    if len(sys.argv) != 2 or sys.argv[1] not in ('supplements', 'workouts'):
        print("Usage: python3 generate_qr.py <supplements|workouts>")
        sys.exit(1)

    mode = sys.argv[1]
    script_dir = os.path.dirname(os.path.abspath(__file__))
    workout_dir = os.path.join(script_dir, "workout")

    config_file = os.path.join(workout_dir, f"config_{mode}.json")
    output_file = os.path.join(workout_dir, f"qr_{mode}.png")
    fragment_param = 's' if mode == 'supplements' else 'w'

    if not os.path.exists(config_file):
        print(f"Error: Config file not found: {config_file}")
        sys.exit(1)

    try:
        import qrcode
    except ImportError:
        print('Error: qrcode library is not installed.')
        print('Install it with: pip3 install "qrcode[pil]"')
        sys.exit(1)

    with open(config_file, 'r') as f:
        data = json.load(f)

    minified = json.dumps(data, separators=(',', ':'))
    compressed = gzip.compress(minified.encode('utf-8'))
    encoded = base64.urlsafe_b64encode(compressed).rstrip(b'=').decode('ascii')

    print(f"Encoded data size: {len(encoded)} characters")
    if len(encoded) > 4000:
        print(f"Warning: Encoded data ({len(encoded)} chars) exceeds 4000 characters — QR code may be too dense to scan reliably.")

    url = f"https://jkeeter.github.io/apex-tracker/#{fragment_param}={encoded}"
    print(f"URL: {url}")

    qr = qrcode.QRCode(
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    img.save(output_file)
    print(f"QR code saved to: {output_file}")

    subprocess.run(['open', output_file])

if __name__ == '__main__':
    main()
