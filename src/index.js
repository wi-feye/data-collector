import cron from 'node-cron';
import controller from './controller.js';
import dotenv from 'dotenv';
dotenv.config();

/**
 * List of possible base commands.
 */
const base_commands = {
    workspace_list: controller.workspace_list,
    device_list: controller.device_list,
    timeseries_list: controller.timeseries_list,
};

/**
 * Main function of the data-collector service.
 */
function main() {
    const cmd = process.argv.length > 2 ? process.argv[2] : '';
    if (cmd == 'help') {
        const commands_str = Object.keys(base_commands).map(x => `\n\t> ${x}`).reduce((x, y) => `${x}${y}`);
        console.log(`available commands:${commands_str}\n`);
    } else if (Object.keys(base_commands).includes(cmd)) {
        base_commands[cmd]().then(v => console.log(JSON.stringify(v, null, '\t')));
    } else {
        const execution_callback = () => controller.fingerprints_transfer().then(console.log);
        process.env.MODE == 'DEV' ? execution_callback() : cron.schedule(process.env.CRON_CONFIG, execution_callback);
    }
    const execution_callback = () => controller.fingerprints_transfer().then(console.log);

}

main();