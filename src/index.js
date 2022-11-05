require('dotenv').config();
const cron = require('node-cron');

const controller = require('./controller.js');

function main() {
    const cmd = process.argv.length > 2 ? process.argv[2] : '';
    switch (cmd) {
        case 'workspace_list': controller.workspace_list().then(v => console.log(JSON.stringify(v, null, '\t'))); break;
        case 'device_list': controller.device_list().then(v => console.log(JSON.stringify(v, null, '\t'))); break;
        case 'help': console.log('available commands:\n\tworkspace_list\n\tdevice_list'); break;
        default: cron.schedule(process.env.CRON_CONFIG, () => controller.fingerprints_transfer().then(console.log));
    }
    
}

main();