import ZerynthApi from './service/zerynth_api.js';
import formatter from './service/formatter.js';
import WifeyeApi from './service/wifeye_api.js';
import dotenv from 'dotenv';
dotenv.config();

const MIN_DEVICES = process.env.MIN_DEVICES || 3;
const wifeye_api = new WifeyeApi(process.env.WIFEYE_API_KEY);

export default {
    /**
     * Function to get timeseries, parse them in raw detections and send them to wi-feye server.
     * @param {Object} config Configuration of filter for timeseries api call.
     * @returns Wi-feye db service response.
     */
    async raws_transfer(config) {
        const users = await wifeye_api.get_users();
        const raws = [];
        for (const user of users) {
            const zerynth_api = new ZerynthApi(user.apikey_zerynth);
            if(!user.buildings) {
                continue;
            }
            for (const building of user.buildings) {
                const lastupdate = new Date();
                const sniffers_map = Object.fromEntries(building.sniffers.map(v => [v.id_zerynth, v.id]));
                const timeseries = await zerynth_api.timeseries({
                    ...config,
                    workspace_id: building.id_zerynth,
                    start: building.lastupdate
                });
                if (timeseries.length > 0) {
                    const detections = formatter.parse_timeseries(timeseries);
                    if (detections.length > 0) {
                        const records = [];
                        for (const detection of detections) {
                            const rssi_device = [];
                            for (const device of detection.devices) {
                                rssi_device.push({
                                    id: sniffers_map[device.device_id],
                                    rssi: device.rssi,
                                });
                            }
                            if (rssi_device.length >= MIN_DEVICES) {
                                records.push({
                                    timestamp: detection.timestamp,
                                    mac_hash: detection.mac_hash,
                                    rssi_device
                                });
                            }
                        }
                        raws.push({
                            id_building: building.id,
                            records,
                            lastupdate
                        });
                    }
                }
            }
        }
        if (raws.length > 0) {
            const res = await wifeye_api.create_raws(raws);
            return res.status ? res.message : res;
        } else {
            return 'No raws retrieved';
        }
    }
};