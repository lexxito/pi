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

function aggregate_points(params) {
    const start_time = params.start_time || 0;
    const end_time = params.end_time || 1565512709409000000;
    const influxData = params.db || {
        host: '160.85.252.115',
        database: 'cab-ns'
    };
    const Influx = require('influx');
    const influx = new Influx.InfluxDB(influxData);
    return influx.query("SELECT * FROM lexxito WHERE time >= " + start_time + " AND time <= " + end_time).then(result => {
        var finalRes = [];
        for(let i = 0; i < result.length; i++){
            var firstElement = true;
            for(let j = 0; j < finalRes.length; j++){
                if (finalRes[j].name == result[i].name){
                    finalRes[j].count += result[i].count;
                    finalRes[j].time = result[i].time.getTime();
                    firstElement = false;
                    break
                }
            }
            if (firstElement){
                finalRes.push({
                    name: result[i].name,
                    count: result[i].count,
                    time: result[i].time.getTime()
                })
            }
        }
        return {'data': finalRes}
    }).catch(err => {
        return err.toString()
    })
}


exports.main = aggregate_points;
