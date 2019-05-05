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

function bill_mqtt(params) {
    var mqtt=require('mqtt');
    const mqtt_server = "mqtt://160.85.252.91";
    const mqtt_port = 32483;
    const mqtt_metric = 'broker/messages/received';
    const rate_per_unit = 0.000027;
    var client = mqtt.connect(mqtt_server,{clientId:"mqttjs", port: mqtt_port});
    client.subscribe('\$SYS/' + mqtt_metric)
    client.on('message', (topic, message) => {
        // message is Buffer
        const usage = Number(message.toString());
        const response = {
            'metric': mqtt_metric,
            'usage': usage,
            'rate': rate_per_unit,
            'host': mqtt_server + ':' + mqtt_port,
            'price': rate_per_unit*usage,
            'time': new Date().getTime()
        };
        client.end();
        console.log(response);
    });
    function wait(ms){
        var start = new Date().getTime();
        var end = start;
        while(end < start + ms) {
            end = new Date().getTime();
        }
    }
    wait(3000);
    return {result: "success"}
}
exports.main = bill_mqtt;
