import React from "react";
import ReactDOM from "react-dom";
import reactToWebComponent from "react-to-webcomponent";
import {addResponseMessage, Widget} from 'react-chat-widget';
import App from './App';
import MyCounter from './AIChatWidget'

interface State {
  count: number;
}
interface Props {}

export default class MyCounter extends React.Component<Props, State> {
  sessionId: string;
  sessionToken: string;
  isSessionOpen: boolean;

  constructor(props) {
    super(props);
    this.state = {
      count: 0
    };
  }

  handleNewUserMessage(newMessage) {
    sendMessage(newMessage)
        .then(response => {
            response.forEach(messageJson => {
                addResponseMessage(messageJson["text"]);
            });
        })
        .catch(error => console.error(error));
  }

    const handleWidgetToggled = (toggle) => {
        if (toggle && !isSessionOpen) {
            initNewSession();
        }
    };

    initNewSession() {
        const myHeaders = new Headers();
        myHeaders.append("Origin", "http://localhost:3000");
        myHeaders.append("X-Vgai-Key", "QaqUPMnoh2i9naBQ9IWNvj7DzUXumG");
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({"agent_id": "6239ccf1fa522cc5caaf93a2"});

        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch("http://localhost:8080/https://studio-api-eu.ai.vonage.com/http/init", requestOptions)
            .then(result => result.json())
            .then(result => {
                sessionId = result["session_id"];
                sessionToken = result["session_token"];
                isSessionOpen = true;
            })
            .catch(error => console.error('error', error));

    }

    sendMessage(message): Promise<string[]> {
        return new Promise(function (myResolve, myReject) {
            let myHeaders = new Headers();
            myHeaders.append("Authorization", "Bearer " + sessionToken);
            myHeaders.append("Content-Type", "application/json");

            let raw = JSON.stringify({"input": message});

            let requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };

            fetch("https://studio-api-eu.ai.vonage.com/http/" + sessionId + "/step", requestOptions)
                .then(result => result.json())
                .then(result => {
                    myResolve(result["messages"]);
                })
                .catch(error => {
                    console.error('error', error);
                    myReject(error);
                });
        });

    }


  render() {
    const styles = `
    .rcw-close-widget-container {
      height: max-content;
      width: max-content;
    }
    `;
    return (
      <div className="my-counter">
        <style>{styles}</style>
        <Widget/>
      </div>
    );
  }
}
