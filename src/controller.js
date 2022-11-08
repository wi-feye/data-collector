import importer from './service/importer.js';
import formatter from './service/formatter.js';
import exporter from './service/exporter.js';

export default {
    /**
     * Function to list Zerynth workspaces.
     * @returns List of Zerynth workspaces.
     */
    async workspace_list() {
        return await importer.workspaces();
    },
    /**
     * Function to list Zerynth devices givn a workspace.
     * @param {string} workspace_id Workspace id to retrieve his devices.
     * @returns List of devices.
     */
    async device_list(workspace_id) {
        return await importer.devices(workspace_id);
    },
    /**
     * Function to get timeseries, parse them in fingerprints and send them to wi-feye server.
     * @param {Object} config Configuration of filter for timeseries api call.
     * @returns Wi-feye db service response.
     */
    async fingerprints_transfer(config) {
        const timeseries = await importer.timeseries(config);
        const fingerprints = formatter.parse_timeseries(timeseries.result);
        return await exporter.create_fingerprints(fingerprints);
    }
};