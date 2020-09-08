// src/MqttComponent.js

import React from 'react';
import PropTypes from 'prop-types';
import { Textfit } from 'react-textfit';
import styled, { keyframes } from 'styled-components';
import PuffLoader from 'react-spinners/PuffLoader';

import MqttClient from './MqttClient';

const maxFlickerAnim = keyframes`
    0% {
        color: #ff4747;
    }
    50% {
        color: #ffffff;
    }`;

const minFlickerAnim = keyframes`
    0% {
        color: #3b59f5;
    }
    50% {
        color: #ffffff;
    }`;

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
    ${(props) =>
        props.active &&
        `
            animation: ${
                props.active === 'max' ? maxFlickerAnim : minFlickerAnim
            } 1s 1s
                infinite linear alternate;
        `};
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
            message: null,
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

    getActiveType() {
        const { message } = this.state;
        const { maxValue, minValue } = this.props;

        let activeType = null;
        if (message > maxValue) {
            activeType = 'max';
        } else if (message < minValue) {
            activeType = 'min';
        }
        return activeType;
    }

    render() {
        const { message, lastUpdated } = this.state;
        const { serverUrl, subscribeTopic } = this.props;

        if (!message) {
            return (
                <Wrapper>
                    <PuffLoader size={56} color={'#ffffff'} loading={true} />
                </Wrapper>
            );
        }

        const activeType = this.getActiveType();

        return (
            <Wrapper>
                <ServerUrlText>{`Server: ${serverUrl}`}</ServerUrlText>
                <TopicText>{`Topic: ${subscribeTopic}`}</TopicText>

                <MessageTextfit
                    mode="single"
                    min={16}
                    max={224}
                    forceSingleModeWidth={false}
                    active={activeType}>
                    {message}
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
    minValue: PropTypes.string,
    maxValue: PropTypes.string,
};

export default MqttComponent;
