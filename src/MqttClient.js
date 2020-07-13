var mqtt = require('mqtt');

var client = null;

const MqttClient = {
    connect: (serverUrl, callback) => {
        client = mqtt.connect(serverUrl);

        client.on('connect', callback);
    },

    subscribe: (topic, callback) => {
        client.subscribe(topic, callback);
    },

    publish: (topic, message) => {
        client.publish(topic, message);
    },

    setOnMessageListener: (listener) => {
        if (!client) {
            return;
        }

        client.on('message', listener);
    },

    end: () => {
        if (client) {
            client.end();
        }
    },
};

module.exports = MqttClient;
