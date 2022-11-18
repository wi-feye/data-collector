import hash from 'object-hash';

export default {
    /**
     * Function to parse timeseries in position detections.
     * @param {Object[]} timeseries List of timeseries to parse.
     * @returns List of position detections to export.
     */
    parse_timeseries: (timeseries) => {
        const position_detections = {};
        for (const timeserie of timeseries) {
            for (const scan of timeserie.payload.scans) {
                const unique_fields = {
                    timestamp: timeserie.timestamp_device,
                    mac_hash: scan[3]
                };
                const device_id = timeserie.device_id;
                const rssi = scan[4];
                const position_detection_id = hash(unique_fields);
                if (Object.keys(position_detections).includes(position_detection_id)) {
                    if (Object.keys(position_detections[position_detection_id].devices).includes(device_id)) {
                        position_detections[position_detection_id].devices[device_id].push(rssi);
                    } else {
                        position_detections[position_detection_id].devices[device_id] = [rssi];
                    }
                } else {
                    position_detections[position_detection_id] = {
                        ...unique_fields,
                        devices: {}
                    };
                    position_detections[position_detection_id].devices[device_id] = [rssi];
                }
            }
        }
        const position_detection_list = Object.values(position_detections);
        for (const position_detection of position_detection_list) {
            const devices = [];
            for (const entries of Object.entries(position_detection.devices)) {
                devices.push({
                    device_id: entries[0],
                    rssi: Number.parseInt(entries[1].reduce((x, y) => x + y) / entries[1].length)
                })
            }
            position_detection.devices = devices;
        }
        return position_detection_list;
    }
};