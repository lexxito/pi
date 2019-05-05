/**
 * Returns the basic billing information
 * {
 *   "detailed": [
 *     {
 *       "duration": 1,
 *       "invocations": 1,
 *       "name": "name1",
 *      "price": 1
 *     },
 *    {
 *      "duration": 1,
 *       "invocations": 1,
 *       "name": "name2",
 *       "price": 0.024038
 *     },
 *     ...
 *   ],
 *   "end": 1552402533379,
 *   "rate": 2,
 *   "start": 0,
 *   "total_duration": 2,
 *   "total_invocations": 2,
 *   "total_price": 2
 * }
 *
 * @param apihost The endpoint for OpenWhisk.
 * @param api_key Authentification 'auth' parameter for OpenWhisk account.
 * @param ignore_certs True or False paramter ofr SSl connection.
 * @param start_time The time to start with.
 * @param end_time The end time of usage.
 * @param rate The rate per second of execution, per GB of memory allocated.
 */
var openwhisk = require('openwhisk');

function main(params) {
    // Paramters initializtion
    const apihost = params.apihost || 'https://160.85.252.91:31001';
    const api_key = params.api_key || '';
    const ignore_certs = params.ignore_certs || true;
    const start_time = params.start_time || 0;
    const end_time = params.end_time || 1552402533379;
    const rate = params.rate || 0.000017;
    const options = {'apihost': apihost, 'api_key': api_key, 'ignore_certs': ignore_certs};
    // Create OpenWhisk Client
    const ow = openwhisk(options);
    //Initialize initial response
    let response = {
        'start': start_time,
        'end': end_time,
        'rate': rate,
        'total_invocations': 0,
        'total_duration': 0,
        'total_price': 0,
        'detailed': [

        ]
    };
    return ow.activations.list({since: start_time, upto: end_time}).then(function(action) {
        //First cycle to aggregate all records per function
        let i;
        let detailed_response = {};
        for (i = 0; i < action.length; i++) {
            if (!(action[i].duration == null)){
                if (!(action[i].name  in detailed_response )){
                    detailed_response[action[i].name] = {
                        'invocations': 0,
                        'duration': 0
                    }
                }
                detailed_response[action[i].name].invocations += 1;
                detailed_response[action[i].name].duration += action[i].duration;
            }
        }
	//Second cycle to aggregate total records
        for (let k in detailed_response) {
            if (detailed_response.hasOwnProperty(k)) {
                const duration = detailed_response[k].duration;
                const invocations = detailed_response[k].invocations;
                const price = duration * rate;
                response.total_invocations += invocations;
                response.total_duration += duration;
                response.total_price += price;
                response.detailed.push({
                        'name': k,
                        'invocations': invocations,
                        'duration': duration,
                        'price': price
                    }
                )
            }
        }
        return response


    }).catch(err => {
        console.error('failed to retrieve action', err)
    });
}
