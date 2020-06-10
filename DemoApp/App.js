/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
} from 'react-native';

import Tracker from '@snowplow/react-native-tracker';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

const App: () => React$Node = () => {
  const initPromise = Tracker.initialize({
    // required
    endpoint: 'test-endpoint',
    method: 'post',
    protocol: 'https',
    namespace: 'namespace',
    appId: 'my-app-id',

    // optional
    setPlatformContext: true,
    setBase64Encoded: true,
    setApplicationContext:true,
    setLifecycleEvents: true,
    setScreenContext: true,
    setSessionContext: false,
    foregroundTimeout: 10, // set unreasonably low for testing purposes
    backgroundTimeout: 10, // set unreasonably low for testing purposes
    checkInterval: 5,
    setInstallEvent: true
    });

    Tracker.setSubjectData({
      userId: 'test-userId',
      screenWidth: 123,
      screenHeight: 456,
      colorDepth: 20,
      timezone: 'Europe/London',
      language: 'fr',
      ipAddress: '123.45.67.89',
      useragent: '[some-user-agent-string]',
      networkUserId: '5d79770b-015b-4af8-8c91-b2ed6faf4b1e',
      domainUserId: '5d79770b-015b-4af8-8c91-b2ed6faf4b1e',
      viewportWidth: 123,
      viewportHeight: 456
    });

  initPromise.then(() => Tracker.trackScreenViewEvent({screenName: 'firstScreenView'}));

  const onPresstrackStructuredEvent = () => {
    Tracker.trackStructuredEvent({category: 'SeTest', action: 'allPopulated', label: 'valueIsFloat', property: 'property', value: 50.00});
    Tracker.trackStructuredEvent({category: 'SeTest', action: 'allPopulated', label: 'valueIsNullAndSoIsProperty', property: null, value: null});
    Tracker.trackStructuredEvent({category: 'SeTest', action: 'allPopulated', label: 'valueIsUndefined', property: 'property', value: undefined});
    Tracker.trackStructuredEvent({category: 'SeTest', action: 'onlyRequired'});
  }
  const onPresstrackScreenViewEvent = () => {
    Tracker.trackScreenViewEvent({screenName: 'onlyRequired'});
    Tracker.trackScreenViewEvent({screenName: 'allPopulated', screenType: 'allPopulated', transitionType: 'test' });
    Tracker.trackScreenViewEvent({screenName: 'allOptionalsNull', screenType: null, transitionType: null});
    Tracker.trackScreenViewEvent({screenName: 'allOptionalsUndefined', screenType: undefined,transitionType: undefined});
    Tracker.trackScreenViewEvent({screenName: 'withAContext'}, [{schema: "iglu:com.snowplowanalytics.snowplow/gdpr/jsonschema/1-0-0", data: {basisForProcessing: "consent"}}]);
    Tracker.trackScreenViewEvent({screenName: 'withEmptyArrayContext'}, []);
  }
  const onPresstrackSelfDescribingEvent = () => {
    Tracker.trackSelfDescribingEvent({schema: 'iglu:com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0', data: {'impressionId': 'test_imp_id'}});
  }
  const onPresstrackPageViewEvent = () => {
    Tracker.trackPageViewEvent({pageUrl: 'https://allpopulated.com', pageTitle: 'some title', pageReferrer: 'http://refr.com'});
    Tracker.trackPageViewEvent({pageUrl: 'https://onlyrequired.com'});
    Tracker.trackPageViewEvent({pageUrl: 'https://alloptionalsnull.com', pageTitle: null, pageReferrer: null});
    Tracker.trackPageViewEvent({pageUrl: 'https://alloptionalsundefined.com', pageTitle: undefined, pageReferrer: undefined});
  }
  const onPressShowMeSomeWarnings = () => {
    Tracker.trackSelfDescribingEvent({});
    Tracker.trackStructuredEvent({});
    Tracker.trackPageViewEvent({});
    Tracker.trackScreenViewEvent({});
  }
  const onPressTestSetSubject = () => {
    Tracker.setSubjectData({
      userId: null,
      timezone: null,
      language: null,
      ipAddress: null,
      useragent: null,
      networkUserId: null,
      domainUserId: null,
      screenWidth: 123,
      screenHeight: 456,
      colorDepth: 20,
      viewportWidth: 123,
      viewportHeight: 456
    });
  }
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <Header />
          {global.HermesInternal == null ? null : (
            <View style={styles.engine}>
              <Text style={styles.footer}>Engine: Hermes</Text>
            </View>
          )}
          <View style={styles.body}>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Test trackScreenViewEvent:</Text>
              <Button
                  onPress={onPresstrackScreenViewEvent}
                  title="Track some Screen View Events"
                  color="#841584"
                  accessibilityLabel="testScreenView"
              />
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Test trackSelfDescribingEvent (custom events):</Text>
              <Button
                  onPress={onPresstrackSelfDescribingEvent}
                  title="Track some Self-Describing Events"
                  color="#841584"
                  accessibilityLabel="testSelfDesc"
              />
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Test trackStructuredEvent:</Text>
              <Button
                  onPress={onPresstrackStructuredEvent}
                  title="Track some Structured Events"
                  color="#841584"
                  accessibilityLabel="testStruct"
              />
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Test trackPageViewEvent:</Text>
              <Button
                  onPress={onPresstrackPageViewEvent}
                  title="Track some Page View Events"
                  color="#841584"
                  accessibilityLabel="testPageView"
              />
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Test throwing warnings due to missing input:</Text>
              <Button
                  onPress={onPressShowMeSomeWarnings}
                  title="Show me some warnings"
                  color="#ADFF2F"
                  accessibilityLabel="testWrongInputs"
              />
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Test setting the Subject</Text>
              <Button
                  onPress={onPressTestSetSubject}
                  title="Set the Subject again"
                  color="#228B22"
                  accessibilityLabel="testSetSubject"
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 16,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
