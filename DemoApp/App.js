/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import Tracker from '@snowplow/react-native-tracker';

const Section = ({children, title}): Node => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const initPromise = Tracker.initialize({
    // required
    endpoint: 'test-url',
    namespace: 'namespace',
    appId: 'my-app-id',

    // optional
    method: 'post',
    protocol: 'https',
    platformContext: true,
    base64Encoded: true,
    applicationContext:true,
    lifecycleEvents: true,
    screenContext: true,
    sessionContext: true,
    foregroundTimeout: 10, // set unreasonably low for testing purposes
    backgroundTimeout: 10, // set unreasonably low for testing purposes
    checkInterval: 5,
    installTracking: true
    })

    initPromise.then(() => Tracker.setSubjectData({
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
    }))

    initPromise.then(() => Tracker.trackScreenViewEvent({screenName: 'firstScreenView'}));

    const onPressTrackStructuredEvent = async () => {
      await initPromise;
      Tracker.trackStructuredEvent({category: 'SeTest', action: 'allPopulated', label: 'valueIsFloat', property: 'property', value: 50.00});
      Tracker.trackStructuredEvent({category: 'SeTest', action: 'allPopulated', label: 'valueIsNullAndSoIsProperty', property: null, value: null});
      Tracker.trackStructuredEvent({category: 'SeTest', action: 'allPopulated', label: 'valueIsUndefined', property: 'property', value: undefined});
      Tracker.trackStructuredEvent({category: 'SeTest', action: 'onlyRequired'});
    }
    const onPressTrackScreenViewEvent = async () => {
      await initPromise;
      Tracker.trackScreenViewEvent({screenName: 'onlyRequired'});
      Tracker.trackScreenViewEvent({screenName: 'allPopulated', screenType: 'allPopulated', transitionType: 'test' });
      Tracker.trackScreenViewEvent({screenName: 'allOptionalsNull', screenType: null, transitionType: null});
      Tracker.trackScreenViewEvent({screenName: 'allOptionalsUndefined', screenType: undefined,transitionType: undefined});
      Tracker.trackScreenViewEvent({screenName: 'withAContext'}, [{schema: "iglu:com.snowplowanalytics.snowplow/gdpr/jsonschema/1-0-0", data: {basisForProcessing: "consent"}}]);
      Tracker.trackScreenViewEvent({screenName: 'withEmptyArrayContext'}, []);
    }
    const onPressTrackSelfDescribingEvent = async () => {
      await initPromise;
      Tracker.trackSelfDescribingEvent({schema: 'iglu:com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0', data: {'impressionId': 'test_imp_id'}});
    }
    const onPressTrackPageViewEvent = async () => {
      await initPromise;
      Tracker.trackPageViewEvent({pageUrl: 'https://allpopulated.com', pageTitle: 'some title', pageReferrer: 'http://refr.com'});
      Tracker.trackPageViewEvent({pageUrl: 'https://onlyrequired.com'});
      Tracker.trackPageViewEvent({pageUrl: 'https://alloptionalsnull.com', pageTitle: null, pageReferrer: null});
      Tracker.trackPageViewEvent({pageUrl: 'https://alloptionalsundefined.com', pageTitle: undefined, pageReferrer: undefined});
    }
    const onPressShowMeSomeWarnings = async () => {
      await initPromise;
      Tracker.trackSelfDescribingEvent({});
      Tracker.trackStructuredEvent({});
      Tracker.trackPageViewEvent({});
      Tracker.trackScreenViewEvent({});
    }
    const onPressTestSetSubject = async () => {
      await initPromise;
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
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="Screen Views">
            <Button
                  onPress={onPressTrackScreenViewEvent}
                  title="Track some Screen View Events"
                  color="#841584"
                  accessibilityLabel="testScreenView"
            />
          </Section>
          <Section title="Self-Describing Events">
            <Button
                  onPress={onPressTrackSelfDescribingEvent}
                  title="Track some Self-Describing Events"
                  color="#841584"
                  accessibilityLabel="testSelfDesc"
              />
          </Section>
          <Section title="Structured Events">
            <Button
                  onPress={onPressTrackStructuredEvent}
                  title="Track some Structured Events"
                  color="#841584"
                  accessibilityLabel="testStruct"
              />
          </Section>
          <Section title="Page Views">
            <Button
                onPress={onPressTrackPageViewEvent}
                title="Track some Page View Events"
                color="#841584"
                accessibilityLabel="testPageView"
            />
          </Section>
          <Section title="Warnings">
            <Button
                onPress={onPressShowMeSomeWarnings}
                title="Show me some warnings"
                color="#f6bd3b"
                accessibilityLabel="testWrongInputs"
            />
          </Section>
          <Section title="Set the Subject">
            <Button
                onPress={onPressTestSetSubject}
                title="Set the Subject again"
                color="#228B22"
                accessibilityLabel="testSetSubject"
            />
          </Section>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
