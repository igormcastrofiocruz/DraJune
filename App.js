import React, { Component } from 'react';
import {View} from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { Dialogflow_V2 } from 'react-native-dialogflow';
import { dialogflowConfig } from './env';

const BOT_USER = {
  _id: 2,
  name: 'Dra June',
  avatar: 'https://firebasestorage.googleapis.com/v0/b/simeos-1-nnluqx.appspot.com/o/june72x72.png?alt=media&token=764e187a-7f37-4355-af00-ca01ed769c23'
};
class App extends Component {

  state = {
    messages: [
      {
        _id: 1,
        text: 'Olá! Sou a Dra June.\n\nComo posso te ajudar?',
        createdAt: new Date(),
        user: BOT_USER
      }
    ]
  };

  componentDidMount() {
    Dialogflow_V2.setConfiguration(
      dialogflowConfig.client_email,
      dialogflowConfig.private_key,
      Dialogflow_V2.LANG_PORTUGUESE_BRAZIL,
      dialogflowConfig.project_id
    );
  }



  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages)
    }));

    let message = messages[0].text;
    Dialogflow_V2.requestQuery(
      message,
      result => this.handleGoogleResponse(result),
      error => console.log(error)
    );
  }

  handleGoogleResponse(result) {
    let text = result.queryResult.fulfillmentMessages[0].text.text[0];
    this.sendBotResponse(text);
  }

  sendBotResponse(text) {
    let msg = {
      _id: this.state.messages.length + 1,
      text,
      createdAt: new Date(),
      user: BOT_USER
    };

    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, [msg])
    }));
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <GiftedChat
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={{
            _id: 1
          }}
        />
      </View>
    );
  }
}
export default App;


import React, { Component, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { Dialogflow_V2 } from 'react-native-dialogflow';
import { dialogflowConfig } from './env';
import SpeechAndroid from 'react-native-android-voice';
import uuid from "uuid";
import Tts from 'react-native-tts';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-elements';

const BOT_USER = {
  _id: 2,
  name: 'Dra June',
  avatar: 'https://firebasestorage.googleapis.com/v0/b/simeos-1-nnluqx.appspot.com/o/june48x48.png?alt=media&token=d8785056-3768-4226-8e4a-d361915b79ac'
};

var speak=0;

class App extends Component {
  state = {
    messages: [
      {
        _id: 1,
        text: 'Olá! Sou a Dra June .\n\nComo posso ajudar você?',
        createdAt: new Date(),
        user: BOT_USER,
      }
    ],
  };

  componentDidMount() {
    Dialogflow_V2.setConfiguration(
      dialogflowConfig.client_email,
      dialogflowConfig.private_key,
      Dialogflow_V2.LANG_PORTUGUESE_BRAZIL,
      dialogflowConfig.project_id
    );
  }

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages)
    }));

    let message = messages[0].text;
    Dialogflow_V2.requestQuery(
      message,
      result => this.handleGoogleResponse(result),
      error => console.log(error)
    );
  }

  handleGoogleResponse(result) {
    let receivedText = '';
    let splitReceivedText = '';
    var extractDate = '';
    const dateRegex = /\d{4}\-\d{2}\-\d{2}?/gm;

    receivedText = result.queryResult.fulfillmentMessages[0].text.text[0];
    splitReceivedText = receivedText.split('on')[0];
    extractDate = receivedText.match(dateRegex);

    if (extractDate != null) {
      var completeTimeValue = splitResponseForTime(receivedText);
      var timeValue = getTimeValue(completeTimeValue);
      function splitResponseForTime(str) {
        return str.split('at')[1];
      }

      function getTimeValue(str) {
        let time1 = str.split('T')[1];
        let hour = time1.split(':')[0];
        let min = time1.split(':')[1];
        return hour + ":" + min;
      }
      splitReceivedText = splitReceivedText + 'on ' + extractDate[0] + ' at ' + timeValue;
    }
    this.sendBotResponse(splitReceivedText);
  }

  sendBotResponse(text) {
    let msg = {
      _id: this.state.messages.length + 1,
      text,
      createdAt: new Date(),
      user: BOT_USER
    };

    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, msg)
    }));

    if (speak) {
      speak=0;
      Tts.getInitStatus().then(() => {
        Tts.speak(text);
      }, (err) => {
        if (err.code === 'no_engine') {
          Tts.requestInstallEngine();
        }
      });
    }
  }

  uuidGen = () => {
    return uuid.v4();
  }

  micHandler = async () => {
    try {
      let textSpeech = await SpeechAndroid.startSpeech("Speak now", SpeechAndroid.ENGLISH);
      speak=1;
      let StateVariable = [{
        "text": textSpeech,
        "user": {
          "_id": 1
        },
        "createdAt": new Date(),
        "_id": this.uuidGen()
      }];
      await this.onSend(StateVariable);

      await ToastAndroid.show(spokenText, ToastAndroid.LONG);
    } catch (error) {
      switch (error) {
        case SpeechAndroid.E_VOICE_CANCELLED:
          ToastAndroid.show("Voice Recognizer cancelled", ToastAndroid.LONG);
          break;
        case SpeechAndroid.E_NO_MATCH:
          ToastAndroid.show("No match for what you said", ToastAndroid.LONG);
          break;
        case SpeechAndroid.E_SERVER_ERROR:
          ToastAndroid.show("Google Server Error", ToastAndroid.LONG);
          break;
      }
    }
  }


  render() {
    return (
      < View style={styles.screen} >
        <GiftedChat
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={{
            _id: 1
          }}
        />
        <Button
          icon={
            <Icon
              name="microphone"
              size={24}
              color="white"
            />
          }
          onPress={this.micHandler}
          />
        </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff'
  },
});
export default App;