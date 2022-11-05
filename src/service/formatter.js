module.exports = {
    parse_timeserie: (timeserie) => {
        return timeserie.payload.scans.map(v => {
            return {
                device_id: timeserie.device_id,
                timestamp: timeserie.timestamp_device,
                mac: v[3],
                rssi: v[4]
            }
        });
    }
};