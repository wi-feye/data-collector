import cron from 'node-cron';
import controller from './controller.js';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Main function of the data-collector service.
 */
function main() {
    const cmd = process.argv.length > 2 ? process.argv[2] : '';
    const execution_callback = () => controller.fingerprints_transfer().then(console.log);
    switch (cmd) {
        case 'workspace_list': controller.workspace_list().then(v => console.log(JSON.stringify(v, null, '\t'))); break;
        case 'device_list': controller.device_list().then(v => console.log(JSON.stringify(v, null, '\t'))); break;
        case 'help': console.log('available commands:\n\tworkspace_list\n\tdevice_list'); break;
        default: process.env.MODE == 'DEV' ? execution_callback() : cron.schedule(process.env.CRON_CONFIG, execution_callback);
    }

}

main();