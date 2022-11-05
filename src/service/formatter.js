const hash = require('object-hash');

module.exports = {
    parse_timeseries: (timeseries) => {
        const fingerprints = {};
        for (const timeserie of timeseries) {
            for (const scan of timeserie.payload.scans) {
                const unique_fields = {
                    timestamp: timeserie.timestamp_device,
                    mac: scan[3]
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
        for(const fingerprint of fingerprint_list) {
            const devices = [];
            for(const entries of Object.entries(fingerprint.devices)) {
                devices.push({
                    device_id: entries[0],
                    rssi: Number.parseInt(entries[1].reduce((x, y) => x+y) / entries[1].length)
                })
            }
            fingerprint.devices = devices;
        }
        return fingerprint_list;
    }
};