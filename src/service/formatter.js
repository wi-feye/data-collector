import hash from 'object-hash';

export default {
    /**
     * Function to parse timeseries in raw detections.
     * @param {Object[]} timeseries List of timeseries to parse.
     * @returns List of raw detections to export.
     */
    parse_timeseries: (timeseries) => {
        const raws = {};
        for (const timeserie of timeseries) {
            if (!timeserie.payload.scans) continue; // I'LL WORK, I'M SURE
            for (const scan of timeserie.payload.scans) {
                const unique_fields = {
                    timestamp: timeserie.timestamp_device,
                    mac_hash: scan[3]
                };
                const device_id = timeserie.device_id;
                const rssi = scan[4];
                const raw_id = hash(unique_fields);
                if (Object.keys(raws).includes(raw_id)) {
                    if (Object.keys(raws[raw_id].devices).includes(device_id)) {
                        raws[raw_id].devices[device_id].push(rssi);
                    } else {
                        raws[raw_id].devices[device_id] = [rssi];
                    }
                } else {
                    raws[raw_id] = {
                        ...unique_fields,
                        devices: {}
                    };
                    raws[raw_id].devices[device_id] = [rssi];
                }
            }
        }
        const raw_list = Object.values(raws);
        for (const raw of raw_list) {
            const devices = [];
            for (const entries of Object.entries(raw.devices)) {
                devices.push({
                    device_id: entries[0],
                    rssi: Number.parseInt(entries[1].reduce((x, y) => x + y) / entries[1].length)
                })
            }
            raw.devices = devices;
        }
        return raw_list;
    }
};