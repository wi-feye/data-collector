import cron from 'node-cron';
import controller from './controller.js';
import dotenv from 'dotenv';
dotenv.config();

const OLD_DATA_START_DATE = process.env.OLD_DATA_START_DATE || '2022-11-30T16:00:00Z';
const DEFAULT_MAX_PKG_SIZE = process.env.DEFAULT_MAX_PKG_SIZE || 500;

const execution_callback = (config, lastupdate_gen) => controller.raws_transfer(config, lastupdate_gen)
    .then(v => console.log(`${new Date().toLocaleString()} - ${v}`))
    .catch(v => console.error(`${new Date().toLocaleString()} - [ERROR] - ${v}`));

async function load_old_data() {
    console.log(`${new Date().toLocaleString()} - Start load old data...`);
    const milliseconds_gap = 60 * 60 * 1000;
    let start_date = new Date(new Date(OLD_DATA_START_DATE).getTime() - 60 * 60 * 1000);
    let now = new Date();
    const create_next_date = (value) => {
        return new Date(value.getTime() + milliseconds_gap);
    };
    let end_date = create_next_date(start_date);
    const config = { size: DEFAULT_MAX_PKG_SIZE, end: end_date };
    const gen_lastupdate = (building) => {
        if (building.id != 3) {
            building.lastupdate = new Date('3000-01-01T00:00:00Z').toISOString();
            return building.lastupdate;
        } else {
            if (start_date.getTime() > new Date(building.lastupdate).getTime()) {
                building.lastupdate = start_date.toISOString();
            }
            start_date = new Date(building.lastupdate);
            end_date = create_next_date(start_date);
            config.end = end_date;
            return end_date;
        }
    };
    while (end_date.getTime() < now.getTime()) {
        await execution_callback(config, gen_lastupdate);
        console.log(`${new Date().toLocaleString()} - Loaded from ${start_date.toLocaleString()} to ${end_date.toLocaleString()}`);
        start_date = end_date;
        now = new Date();
    }
    console.log(`${new Date().toLocaleString()} - Stop load old data`);
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