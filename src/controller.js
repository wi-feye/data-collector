import ZerynthApi from './service/zerynth_api.js';
import formatter from './service/formatter.js';
import WifeyeApi from './service/wifeye_api.js';
import dotenv from 'dotenv';
dotenv.config();

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
        for(const user of users) {
            const zerynth_api = new ZerynthApi(user.apik);
            const fingerprint = {
                id: user.id,
                workspaces: []
            };
            for(const workspace of user.workspaces) {
                const timeseries = await zerynth_api.timeseries({...config, workspace_id: workspace.idz});
                if (timeseries.length > 0) {
                    fingerprint.workspaces.push({
                        id: workspace.id,
                        detections: formatter.parse_timeseries(timeseries)
                    });
                }
            }
            fingerprints.push(fingerprint);
        }
        return await wifeye_api.create_fingerprints(fingerprints);
    }
};