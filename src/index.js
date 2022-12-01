import cron from 'node-cron';
import controller from './controller.js';
import dotenv from 'dotenv';
dotenv.config();

const OLD_DATA_START_DATE = process.env.OLD_DATA_START_DATE || '2022-11-30T16:00:00Z';
const DEFAULT_MAX_PKG_SIZE = process.env.DEFAULT_MAX_PKG_SIZE || 500;

const execution_callback = (config) => controller.raws_transfer(config)
    .then(v => console.log(`${new Date().toLocaleString()} - ${v}`))
    .catch(v => console.error(`${new Date().toLocaleString()} - [ERROR] - ${v}`));

async function load_old_data() {
    console.log('Start load old data...');
    const milliseconds_gap = 60 * 60 * 1000;
    let start_date = new Date(new Date(OLD_DATA_START_DATE).getTime() - 60 * 60 * 1000);
    let now = new Date();
    const createEndDate = () => {
        const date = new Date(start_date.getTime() + milliseconds_gap);
        return date.getTime() < now.getTime() ? date : now;
    };
    let end_date = createEndDate();
    while (start_date.getTime() < now.getTime()) {
        console.log(`Start load from ${start_date.toLocaleString()} to ${end_date.toLocaleString()}`);
        await execution_callback({ size: DEFAULT_MAX_PKG_SIZE, start: start_date, end: end_date });
        start_date = new Date(start_date.getTime() + milliseconds_gap);
        end_date = createEndDate();
        now = new Date();
    }
    console.log('Stop load old data');
}

/**
 * Main function of the data-collector service.
 */
function main() {
    if (process.env.MODE == 'DEV') {
        execution_callback();
    } else {
        load_old_data().then(() => cron.schedule(process.env.CRON_CONFIG, execution_callback));
    }
}

main();