const importer = require('./service/importer.js');
const formatter = require('./service/formatter.js');
const exporter = require('./service/exporter.js');

module.exports = {

    async workspace_list() {
        return await importer.workspaces();
    },
    async device_list() {
        return await importer.devices();
    },
    async fingerprints_transfer(config) {
        const timeseries = await importer.timeseries(config);
        const fingerprints = [];
        for (const timeserie of timeseries.result) {
            fingerprints.push(...formatter.parse_timeserie(timeserie));
        }
        return await exporter.create_fingerprints(fingerprints);
    }
};