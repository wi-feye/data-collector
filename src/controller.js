import ZerynthApi from './service/zerynth_api.js';
import formatter from './service/formatter.js';
import WifeyeApi from './service/wifeye_api.js';
import dotenv from 'dotenv';
dotenv.config();

const MIN_DEVICES = process.env.MIN_DEVICES || 0;
const wifeye_api = new WifeyeApi(process.env.WIFEYE_API_KEY);

export default {
    /**
     * Function to get timeseries, parse them in fingerprints and send them to wi-feye server.
     * @param {Object} config Configuration of filter for timeseries api call.
     * @returns Wi-feye db service response.
     */
    async fingerprints_transfer(config) {
        const users = await wifeye_api.get_users();
        const fingerprints = [];
        for (const user of users) {
            const zerynth_api = new ZerynthApi(user.apik);
            const fingerprint = {
                id: user.id,
                workspaces: [],
            };
            for (const workspace of user.workspaces) {
                const last_update = new Date();
                const devices_map = Object.fromEntries(workspace.devices.map(v => [v.idz, v.id]));
                const timeseries = await zerynth_api.timeseries({
                    ...config,
                    workspace_id: workspace.idz,
                    start: workspace.last_update
                });
                if (timeseries.length > 0) {
                    const detections = formatter.parse_timeseries(timeseries);
                    if (detections.length > 0) {
                        for(const detection of detections) {
                            for(const device of detection.devices) {
                                device.id = devices_map[device.device_id];
                                delete device.device_id;
                            }
                        }
                        fingerprint.workspaces.push({
                            id: workspace.id,
                            detections: detections.filter(f => f.devices.length >= MIN_DEVICES),
                            last_update
                        });
                    }
                }
            }
            if (fingerprint.workspaces.length > 0) {
                fingerprints.push(fingerprint);
            }
        }
        if (fingerprints.length > 0) {
            return await wifeye_api.create_fingerprints(fingerprints);
        } else {
            return 'No fingerprints retrieved';
        }
    }
};