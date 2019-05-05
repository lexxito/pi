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

exports.main = store_point;
