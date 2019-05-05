/**
 * Store the datapoint to the database
 *
 * @payload contains the datapoint in the following structure:
 * {
 *   "count": 1,
 *   "name": "Serhii",
 *   "time": "Thu Mar 21 13:07:24 2019"
 * }
 */

function delete_points(params) {
    const start_time = params.start_time || 0;
    const end_time = params.end_time || 1565512709409;
    const influxData = params.db || {
        host: '160.85.252.115',
        database: 'cab-ns'
    };
    const Influx = require('influx');
    const influx = new Influx.InfluxDB(influxData);
    var query = "DELETE FROM lexxito WHERE time >= " + start_time + " AND time <= " + end_time;
    return influx.query(query).then((successMessage) => {
        return successMessage}).catch(err => {
        return err.toString()
    })
}
exports.main = delete_points;
