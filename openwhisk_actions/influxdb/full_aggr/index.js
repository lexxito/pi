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
function store_point(params) {
    const Influx = require('influx');
    const influxData = params.db || {
        host: '160.85.252.115',
        database: 'cab-ns'
    };
    const measure = params.measurement || 'lexxito';
    const tags = params.tags || ['name'];
    let data = {};
    console.log(params)
    if ('body' in params) {
        data = JSON.parse(params['body'].replace(/'/g, '"'));
    } else {
        data = params['data'];
    }
    const influx = new Influx.InfluxDB(influxData);
    if (!(Array.isArray(data))) {
        data = [data]
    }
    let finalRes = [];
    for(let i = 0; i < data.length; i++){
        let sTags = {};
        let sFields = {};
        let sTime;
        for (let field in data[i]){
            if (field != 'time'){
                if (tags.includes(field)){
                    sTags[field] = data[i][field]
                } else {
                    sFields[field] = data[i][field]
                }
            } else {
                sTime = new Date(data[i][field])
            }
        }
        finalRes.push({
            measurement: measure,
            tags: sTags,
            timestamp: sTime,
            fields: sFields
        })
    }
    return influx.writePoints(finalRes).then(result => {return result}).catch(err => {
        console.error(`Error saving data to InfluxDB! ${err.stack}`)
        return err
    })
}

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

function full_aggr(params) {
    const time_ago = params.start_time || 900000000000;
    const end_time = params.end_time || new Date().getTime()*1000000;
    const start_time = params.start_time || end_time - time_ago;

    const influxData = params.db || {
        host: '160.85.252.115',
        database: 'my_db'
    };
     return aggregate_points(
        {'end_time': end_time, 'start_time':start_time,
            'db': {host: '160.85.252.115', database: 'cab-ns'}
        }
        ).then((result) => {
            store_point(
            {data: result['data'],
                'db': influxData}).then((result) => {
                    delete_points({
                        'end_time': end_time,
                        'start_time':start_time})
     }
     )
        }
        )

}

exports.main = full_aggr;
