import cron from 'node-cron';
import controller from './controller.js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Main function of the data-collector service.
 */
function main() {
    const execution_callback = () => controller.raws_transfer()
        .then(v => console.log(`${new Date().toISOString()} - ${v}`))
        .catch(v => console.error(`${new Date().toISOString()} - [ERROR] - ${v}`));
    if (process.env.MODE == 'DEV') {
        execution_callback();
    } else {
        cron.schedule(process.env.CRON_CONFIG, execution_callback);
    }
}

main();