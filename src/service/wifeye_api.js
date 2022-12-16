import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Base url to get data manager information.
 */
const BASEURL_USER_MANAGER = process.env.WIFEYE_BASEURL_USER_MANAGER;
/**
 * Base url to get and send data manager instances.
 */
const BASEURL_DATA_MANAGER = process.env.WIFEYE_BASEURL_DATA_MANAGER;

/**
 * Wifeye api class that wraps all the api calls to get and send resources to wifeye db service.
 */
export default class WifeyeApi {

    /**
     * Wifeye api constructor.
     * @param {string} api_key Wifeye api key to authorize rest api calls.
     */
    constructor(api_key) {
        this.api_key = api_key;
    }
    /**
     * Base function to send a post api request to the db service.
     * @param {String} url Url where send the request.
     * @param {Object} data Body of the request.
     * @returns Rest api response of server.
     */
    async __post(url, data) {
        try {
            const res = await axios.post(url, data, {
                headers: {
                    'Authorization': `Bearer ${this.api_key}`,
                    'Content-type': 'application/json'
                }
            });
            return res.data;
        } catch (e) {
            console.error(`Exception of wi-feye api in call ${url}`);
            return e.data;
        }
    }
    /**
     * Base function to send a get api request to the db service.
     * @param {String} url Url where get the resource.
     * @returns Rest api response of server.
     */
    async __get(url) {
        try {
            const res = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${this.api_key}`,
                }
            });
            return res.data;
        } catch (e) {
            console.error(`Exception of wi-feye api in call ${url}`);
            return e.data;
        }
    }

    /**
     * Function able to send the api request to retrieve list of users.
     * @returns Server api response.
     */
    async get_users() {
        const users = (await this.__get(`${BASEURL_USER_MANAGER}users/`));
        const users_map = Object.fromEntries(users.map(u => [u.id, u]));
        const buildings = await this.__get(`${BASEURL_DATA_MANAGER}api/details/datacollector/`);
        for (const building of buildings) {
            if (!Object.keys(users_map).includes(`${building.id_user}`)) {
                continue;
            }
            const user = users_map[building.id_user];
            if (user.buildings) {
                user.buildings.push(building);
            } else {
                user.buildings = [building];
            }
        }
        return users;
    }

    /**
     * Function able to send the api request to create a list of raw detections.
     * @param {Object[]} raws Raw detections to send.
     * @returns Server api response.
     */
    create_raws(raws) {
        return this.__post(`${BASEURL_DATA_MANAGER}api/raw/push/datacollector/`, raws);
    }
}