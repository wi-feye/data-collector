import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Zerynth api key to do rest api request on zerynth cloud.
 */
const API_KEY = process.env.ZERINTH_API_KEY;

/**
 * Zerynth base url of device manager services.
 */
const BASEURL_DEVICE_MANAGER = process.env.ZERINTH_BASEURL_DEVICE_MANAGER;

/**
 * Zerynth base url of storage services.
 */
const BASEURL_STORAGE = process.env.ZERINTH_BASEURL_STORAGE;

/**
 * Default zerynth workspace id.
 */
const WORKSPACE_ID = process.env.ZERINTH_WORKSPACE_ID;

/**
 * Base function to do a rest api get call to Zerynth cloud.
 * @param {String} url Url where request data.
 * @returns Result of the request.
 */
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

export default {
    /**
     * Retrieve the list of workspeces. We have a workspace that is fixed for our project.
     * @returns List of workspaces.
     */
    workspaces: () => get(`${BASEURL_DEVICE_MANAGER}workspaces`),

    /**
     * Retrieve the devices information related to a certain workspace id.
     * @param {String} workspace_id Workspace id.
     * @returns List of workspaces.
     */
    devices: (workspace_id = WORKSPACE_ID) => get(`${BASEURL_DEVICE_MANAGER}workspaces/${workspace_id}/devices`),

    /**
     * Retrieve fota of a device.
     * @param {String} device_id Device id.
     * @returns Fota information.
     */
    fota: (device_id) => get(`${BASEURL_DEVICE_MANAGER}devices/${device_id}/fota`),

    /**
     * Retrieve jobs of a device.
     * @param {String} device_id Device id.
     * @returns Jobs information.
     */
    jobs: (device_id) => get(`${BASEURL_DEVICE_MANAGER}devices/${device_id}/jobs`),

    /**
     * Retrieve timeseries of a certain workspace related to all the devices.
     * @param {Object} config Configuration object composed by:
     *          - start (Date | undefined): starting timestamp.
     *          - end (Date | undefined): ending timestamp.
     *          - from (Number | undefined): starting pagination point.
     *          - size (Number | undefined): pagination size.
     *          - device_ids (String | undefined): list of devices id to filter timeseries.
     *          - workspace_id (String | undefined): workspace id where make the request to take timeseries from workspace devices.
     * @returns Retrieved timeseries.
     */
    timeseries: async (config = {}) => {
        const start = config.start;
        const end = config.end;
        const from = config.from || 1;
        const size = config.size || 100;
        const device_ids = config.device_ids || [];
        const workspace_id = config.workspace_id || WORKSPACE_ID;
        const start_uri = start ? `&start=${start}` : '';
        const end_uri = end ? `&end=${end}` : '';
        const devices_uri = device_ids.length > 0 ? device_ids.map(v => `&device=${v}`).reduce((x, y) => x + y) : '';
        const url = `${BASEURL_STORAGE}timeseries/${workspace_id}/data?from=${from}&size=${size}${start_uri}${end_uri}${devices_uri}`;
        const timeseries = await get(url);
        return Object.keys(timeseries).includes('result') ? timeseries.result : [];
    }
}