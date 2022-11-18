import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Base url to send storage data of db service.
 */
const BASEURL_STORAGE = process.env.WIFEYE_BASEURL_STORAGE;

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
    get_users() {
        return this.__get(`${BASEURL_STORAGE}users`);
    }

    /**
<<<<<<< HEAD
     * Function able to send the api request to create a list of fingerprints.
     * @param {Object[]} fingerprints Fingerprints to send.
     * @returns Server api response.
     */
    create_fingerprints(fingerprints) {
        return this.__post(`${BASEURL_STORAGE}fingerprints`, fingerprints);
=======
     * Function able to send the api request to create a list of position detections.
     * @param {Object[]} position_detections Position detections to send.
     * @returns Server api response.
     */
    create_position_detections(position_detections) {
        return this.__post(`${BASEURL_STORAGE}create-position-detections`, position_detections);
>>>>>>> c00233e29b8bb23422296a4396f9b5c0218c71c9
    }
}