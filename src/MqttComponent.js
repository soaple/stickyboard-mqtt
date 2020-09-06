// src/MqttComponent.js

import React from 'react';
import PropTypes from 'prop-types';
import { Textfit } from 'react-textfit';
import styled, { keyframes, css }  from 'styled-components';
import ClipLoader from "react-spinners/ClipLoader";

import MqttClient from './MqttClient';

const maxFlicker = keyframes`
    0% {
      color: red;
    }
    50% {
      color: #ffffff;
    }`

const minFlicker = keyframes`
    0% {
      color: #0000ff;
    }
    50% {
      color: #ffffff;
    }`

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

const MessageTextfit = styled(Textfit)`
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
    font-weight: bold;
    color: #ffffff;
    ${props =>
      props.active &&
      css`
      animation: ${props.active == 'max' ? maxFlicker : minFlicker} 1s 1s infinite linear alternate;
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

    getActiveType(){
      const { message } = this.state;
      const { maxValue, minValue} = this.props;
      let activeType = "";

      if(message.slice(0, -3) > maxValue){
        activeType = "max";
      }else if(message.slice(0, -3) < minValue){
        activeType = "min";
      }
      return activeType;
    }

    render() {
        const { message, lastUpdated } = this.state;
        const { serverUrl, subscribeTopic } = this.props;
        const activeType = this.getActiveType();

        if (message == ''){
          return (
            <Wrapper>
              <ClipLoader
                size={80}
                color={"#39C2F7"}/>
            </Wrapper>
          );
        }else {
          return (
            <Wrapper>
              <ServerUrlText>{`Server: ${serverUrl}`}</ServerUrlText>
              <ServerUrlText>{`Topic: ${subscribeTopic}`}</ServerUrlText>

              <MessageTextfit
                mode="single"
                min={16}
                max={224}
                forceSingleModeWidth={false}
                active={activeType}
                >
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
}

MqttComponent.propTypes = {
    serverUrl: PropTypes.string.isRequired,
    subscribeTopic: PropTypes.string.isRequired,
};

export default MqttComponent;
