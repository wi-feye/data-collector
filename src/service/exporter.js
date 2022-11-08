import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Api key auth to send post requests to wi-feye db service.
 */
const API_KEY = process.env.WIFEYE_API_KEY;

/**
 * Base url to send storage data of db service.
 */
const BASEURL_STORAGE = process.env.WIFEYE_BASEURL_STORAGE;

/**
 * Base function to send a post api request to the db service.
 * @param {String} url Url where send the request.
 * @param {Object} data Body of the request.
 * @returns Rest api response of server.
 */
async function post(url, data) {
    try {
        const res = await axios.post(url, data, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-type': 'application/json'
            }
        });
        return res.data;
    } catch (e) {
        console.error(`Exception of exporter in call ${url}`);
        return e.data;
    }
}

export default {
    /**
     * Function able to send the api request to create a list of fingerprints.
     * @param {Object[]} fingerprints Fingerprints to send.
     * @returns Server api response.
     */
    create_fingerprints: (fingerprints) => post(`${BASEURL_STORAGE}fingerprints`, fingerprints)
}