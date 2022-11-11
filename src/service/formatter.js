import hash from 'object-hash';
import dotenv from 'dotenv';
import crypto from "crypto";
dotenv.config();

const MIN_DEVICES = process.env.MIN_DEVICES || 0;

export default {
    /**
     * Function to parse timeseries in fingerprints.
     * @param {Object[]} timeseries List of timeseries to parse.
     * @param {Number} min_devices Minimum number of devices for fingerprints.
     * @returns List of fingerprints to export.
     */
    parse_timeseries: (timeseries, min_devices = MIN_DEVICES) => {
        const fingerprints = {};
        for (const timeserie of timeseries) {
            for (const scan of timeserie.payload.scans) {
                const mac_hash = crypto.createHash("sha256").update(scan[3]).digest("hex");
                const unique_fields = {
                    timestamp: timeserie.timestamp_device,
                    mac_hash
                };
                const device_id = timeserie.device_id;
                const rssi = scan[4];
                const fingerpreint_id = hash(unique_fields);
                if (Object.keys(fingerprints).includes(fingerpreint_id)) {
                    if (Object.keys(fingerprints[fingerpreint_id].devices).includes(device_id)) {
                        fingerprints[fingerpreint_id].devices[device_id].push(rssi);
                    } else {
                        fingerprints[fingerpreint_id].devices[device_id] = [rssi];
                    }
                } else {
                    fingerprints[fingerpreint_id] = {
                        ...unique_fields,
                        devices: {}
                    };
                    fingerprints[fingerpreint_id].devices[device_id] = [rssi];
                }
            }
        }
        const fingerprint_list = Object.values(fingerprints);
        for (const fingerprint of fingerprint_list) {
            const devices = [];
            for (const entries of Object.entries(fingerprint.devices)) {
                devices.push({
                    device_id: entries[0],
                    rssi: Number.parseInt(entries[1].reduce((x, y) => x + y) / entries[1].length)
                })
            }
            fingerprint.devices = devices;
        }
        return fingerprint_list.filter(f => f.devices.length >= min_devices);
    }
};