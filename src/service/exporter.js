require('dotenv').config()
const axios = require('axios');

const API_KEY = process.env.WIFEYE_API_KEY;
const BASEURL_STORAGE = process.env.WIFEYE_BASEURL_STORAGE;

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

module.exports = {
    create_fingerprints: (fingerprints) => post(`${BASEURL_STORAGE}fingerprints`, fingerprints)
}