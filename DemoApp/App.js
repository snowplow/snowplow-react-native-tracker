/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Button, Platform, StyleSheet, Text, View, NativeModules} from 'react-native';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};
export default class App extends Component<Props> {
  render() {
    let RNSnowplowTracker = NativeModules.RNSnowplowTracker;
    RNSnowplowTracker.initialize('test-endpoint', 'post', 'https', 'namespace', 'app-id');
    let onPressSendEvent = () => {
      RNSnowplowTracker.trackSelfDescribingEvent({'schema': 'iglu:com.acme/event/jsonschema/1-0-0', 'data': {'message': 'hello world'}}, []);
      RNSnowplowTracker.trackStructuredEvent('category', 'action', 'label', 'property', 50.00, []);
    }
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome to React Native!</Text>
        <Text style={styles.instructions}>To get started, edit App.js</Text>
        <Text style={styles.instructions}>{instructions}</Text>
        <Button
            onPress={onPressSendEvent}
            title="Send event"
            color="#841584"
            accessibilityLabel="Send an event"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
