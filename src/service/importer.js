require('dotenv').config()
const axios = require('axios');

const API_KEY = process.env.ZERINTH_API_KEY;
const BASEURL_DEVICE_MANAGER = process.env.ZERINTH_BASEURL_DEVICE_MANAGER;
const BASEURL_STORAGE = process.env.ZERINTH_BASEURL_STORAGE;
const WORKSPACE_ID = process.env.ZERINTH_WORKSPACE_ID;

async function get(url) {
    try {
        const res = await axios.get(url, {
            headers: {
                'X-API-KEY': API_KEY
            }
        });
        return res.data;
    } catch (e) {
        console.error(`Exception of importer in call ${url}`);
        return e.data;
    }
}

module.exports = {
    /**
     * Retrieve the list of workspeces. We have a workspace that is fixed for our project.
     * @returns List of workspaces.
     */
    workspaces: () => get(`${BASEURL_DEVICE_MANAGER}workspaces`),

    /**
     * Retrieve the devices information related to a certain workspace id.
     * @param workspace_id Workspace id.
     * @returns List of workspaces.
     */
    devices: (workspace_id = WORKSPACE_ID) => get(`${BASEURL_DEVICE_MANAGER}workspaces/${workspace_id}/devices`),

    /**
     * Retrieve fota of a device.
     * @param device_id Device id.
     * @returns Fota information.
     */
    fota: (device_id) => get(`${BASEURL_DEVICE_MANAGER}devices/${device_id}/fota`),

    /**
     * Retrieve jobs of a device.
     * @param device_id Device id.
     * @returns Jobs information.
     */
    jobs: (device_id) => get(`${BASEURL_DEVICE_MANAGER}devices/${device_id}/jobs`),

    /**
     * Retrieve timeseries of a certain workspace related to all the devices.
     * @param from Pagination from.
     * @param size Page size using pagination.
     * @param device_ids List of devices id.
     * @param workspace_id Workspace id.
     * @returns Retrieved timeseries.
     */
    timeseries: async (config = {}) => {
        const from = config.from || 1;
        const size = config.size || 100;
        const device_ids = config.device_ids || [];
        const workspace_id = config.workspace_id || WORKSPACE_ID;
        const devices_uri = device_ids.length > 0 ? device_ids.map(v => `&device=${v}`).reduce((x, y) => x + y) : '';
        return await get(`${BASEURL_STORAGE}timeseries/${workspace_id}/data?from=${from}&size=${size}${devices_uri}`);
    }
}