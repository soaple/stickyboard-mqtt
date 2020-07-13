// src/MqttComponent.js

import React from 'react';
import PropTypes from 'prop-types';
import { Textfit } from 'react-textfit';
import styled from 'styled-components';

import MqttClient from './MqttClient';

const Wrapper = styled.div`
    height: 100%;
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #555555;
    border-radius: 16px;
`;

const ServerUrlText = styled.div`
    width: 100%;
    font-size: 12px;
    color: #ffffff;
    text-align: left;
`;

const TopicText = styled.div`
    width: 100%;
    font-size: 12px;
    color: #ffffff;
    text-align: left;
`;

const MessageTextfit = styled(Textfit)`
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
    font-weight: bold;
    color: #ffffff;
`;

const LastUpdatedText = styled.div`
    width: 100%;
    font-size: 12px;
    color: #ffffff;
    text-align: right;
`;

class MqttComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            message: '',
            lastUpdated: null,
        };
    }

    componentDidMount() {
        const { serverUrl, subscribeTopic } = this.props;

        MqttClient.connect(serverUrl, () => {
            MqttClient.subscribe(subscribeTopic, function(err) {
                if (!err) {
                    // setInterval(() => {
                    //     MqttClient.publish(
                    //         'current_time',
                    //         new Date().toString()
                    //     );
                    // }, 1000);
                }
            });
        });

        MqttClient.setOnMessageListener((topic, message) => {
            // message is Buffer
            console.log(`${topic}: ${message.toString()}`);
            this.setState({
                message: message.toString(),
                lastUpdated: new Date(),
            });
        });
    }

    componentWillUnmount() {
        MqttClient.end();
    }

    render() {
        const { message, lastUpdated } = this.state;
        const { serverUrl, subscribeTopic } = this.props;

        return (
            <Wrapper>
                <ServerUrlText>{`Server: ${serverUrl}`}</ServerUrlText>
                <ServerUrlText>{`Topic: ${subscribeTopic}`}</ServerUrlText>

                {/* Message */}
                <MessageTextfit
                    mode="single"
                    min={16}
                    max={224}
                    forceSingleModeWidth={false}>
                    <p>{message}</p>
                </MessageTextfit>

                {lastUpdated && (
                    <LastUpdatedText>
                        {`Last updated: ${lastUpdated.toLocaleString()}`}
                    </LastUpdatedText>
                )}
            </Wrapper>
        );
    }
}

MqttComponent.propTypes = {
    serverUrl: PropTypes.string.isRequired,
    subscribeTopic: PropTypes.string.isRequired,
};

export default MqttComponent;
