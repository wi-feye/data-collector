import ZerynthApi from './service/zerynth_api.js';
import formatter from './service/formatter.js';
import WifeyeApi from './service/wifeye_api.js';
import dotenv from 'dotenv';
dotenv.config();

const MIN_DEVICES = process.env.MIN_DEVICES || 0;
const wifeye_api = new WifeyeApi(process.env.WIFEYE_API_KEY);

export default {
    /**
     * Function to get timeseries, parse them in position detections and send them to wi-feye server.
     * @param {Object} config Configuration of filter for timeseries api call.
     * @returns Wi-feye db service response.
     */
    async position_detections_transfer(config) {
        const users = await wifeye_api.get_users();
        const position_detections = [];
        for (const user of users) {
            const zerynth_api = new ZerynthApi(user.apikey_zerynth);
            const position_detection = {
                id: user.id,
                buildings: [],
            };
            for (const building of user.buildings) {
                const last_update = new Date();
                const sniffers_map = Object.fromEntries(building.sniffers.map(v => [v.id_zerynth, v.id]));
                const timeseries = await zerynth_api.timeseries({
                    ...config,
                    workspace_id: building.id_zerynth,
                    start: building.last_update
                });
                if (timeseries.length > 0) {
                    const detections = formatter.parse_timeseries(timeseries);
                    if (detections.length > 0) {
                        const position_detections = [];
                        for (const detection of detections) {
                            const sniffers = [];
                            for (const device of detection.devices) {
                                sniffers.push({
                                    id: sniffers_map[device.device_id],
                                    rssi: device.rssi,
                                });
                            }
                            if (sniffers.length >= MIN_DEVICES) {
                                position_detections.push({
                                    timestamp: detection.timestamp,
                                    mac_hash: detection.mac_hash,
                                    sniffers
                                });
                            }
                        }
                        position_detection.buildings.push({
                            id: building.id,
                            position_detections,
                            last_update
                        });
                    }
                }
            }
            if (position_detection.buildings.length > 0) {
                position_detections.push(position_detection);
            }
        }
        if (position_detections.length > 0) {
            const res = await wifeye_api.create_position_detections(position_detections);
            return res.status ? 'OK' : 'ERROR';
        } else {
            return 'No position_detections retrieved';
        }
    }
};