/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
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

import {Colors, Header} from 'react-native/Libraries/NewAppScreen';

import {
  createTracker,
  removeTracker,
  // removeAllTrackers,
} from '@snowplow/react-native-tracker';

const Section = ({children, title}) => {
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

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const tracker = createTracker(
    'sp1',
    {
      endpoint: 'placeholder',
    },
    {
      trackerConfig: {
        appId: 'DemoAppId',
        base64Encoding: false,
        devicePlatform: 'iot',
        screenViewAutotracking: false, // for tests predictability
        installAutotracking: false,
      },
      subjectConfig: {
        userId: 'tester',
        screenViewport: [200, 200],
        language: 'fr',
      },
      gdprConfig: {
        basisForProcessing: 'consent',
        documentId: 'docId',
        documentVersion: '0.0.1',
        documentDescription: 'test gdpr document',
      },
      gcConfig: [
        {
          tag: 'testTag',
          globalContexts: [
            {
              schema:
                'iglu:com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0',
              data: {impressionId: 'test_global_contexts_0'},
            },
            {
              schema:
                'iglu:com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0',
              data: {impressionId: 'test_global_contexts_1'},
            },
          ],
        },
      ],
    },
  );

  const secTracker = createTracker(
    'sp2',
    {
      endpoint: 'placeholder',
    },
    {
      trackerConfig: {
        screenViewAutotracking: false, // for tests predictability
        installAutotracking: false,
      },
    },
  );

  const onPressTrackScreenViewEvent = () => {
    tracker.trackScreenViewEvent({name: 'onlyRequired'});
    tracker.trackScreenViewEvent({
      name: 'allPopulated',
      type: 'allPopulated',
      transitionType: 'test',
    });
    tracker.trackScreenViewEvent({
      name: 'allOptionalsNull',
      type: null,
      transitionType: null,
    });
    tracker.trackScreenViewEvent({
      name: 'allOptionalsUndefined',
      type: undefined,
      transitionType: undefined,
    });
    tracker.trackScreenViewEvent(
      {
        name: 'withContext and screenId',
        id: '5d79770b-015b-4af8-8c91-b2ed6faf4b1e',
      },
      [
        {
          schema:
            'iglu:com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0',
          data: {impressionId: 'test_imp_id'},
        },
      ],
    );
    tracker.trackScreenViewEvent({name: 'withEmptyArrayContext'}, []);
  };

  const onPressTrackSelfDescribingEvent = () => {
    tracker.trackSelfDescribingEvent({
      schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
      data: {targetUrl: 'test.test'},
    });
    tracker.trackTimingEvent({
      category: 'testTimingCategory',
      variable: 'testTimingVariable',
      timing: 10,
    });
    tracker.trackConsentGrantedEvent({
      expiry: '2022-01-01T00:00:00Z',
      documentId: '0123',
      version: '0.1.0',
    });
    tracker.trackConsentWithdrawnEvent({
      all: true,
      documentId: '0987',
      version: '0.2.0',
    });
    tracker.trackEcommerceTransactionEvent(
      {
        orderId: '0000',
        totalValue: 10,
        items: [
          {
            sku: '123',
            price: 5,
            quantity: 2,
          },
        ],
      },
      [],
    );
  };

  const onPressTrackStructuredEvent = () => {
    tracker.trackStructuredEvent({
      category: 'SeTest',
      action: 'allPopulated',
      label: 'valueIsFloat',
      property: 'property',
      value: 50.1,
    });
    tracker.trackStructuredEvent({
      category: 'SeTest',
      action: 'allPopulated',
      label: 'valueIsNullAndSoIsProperty',
      property: null,
      value: null,
    });

    tracker.trackStructuredEvent({
      category: 'SeTest',
      action: 'allPopulated',
      label: 'valueIsUndefined',
      property: 'property',
      value: undefined,
    });
    tracker.trackStructuredEvent({category: 'SeTest', action: 'onlyRequired'});
  };

  const onPressTrackPageViewEvent = () => {
    tracker.trackPageViewEvent({
      pageUrl: 'https://allpopulated.com',
      pageTitle: 'some title',
      referrer: 'http://refr.com',
    });
    tracker.trackPageViewEvent({pageUrl: 'https://onlyrequired.com'});
    tracker.trackPageViewEvent({
      pageUrl: 'https://alloptionalsnull.com',
      pageTitle: null,
      referrer: null,
    });
    tracker.trackPageViewEvent({
      pageUrl: 'https://alloptionalsundefined.com',
      pageTitle: undefined,
      referrer: undefined,
    });
  };

  const onPressTrackDeepLinkReceivedEvent = () => {
    tracker.trackDeepLinkReceivedEvent({
      url: 'https://deeplink.com',
      referrer: 'http://refr.com',
    });
  };

  const onPressTrackMessageNotificationEvent = () => {
    tracker.trackMessageNotificationEvent({
      title: 'title1',
      body: 'body1',
      trigger: 'push',
      action: 'action1',
      attachments: [
        {
          identifier: 'att_id1',
          type: 'att_type1',
          url: 'http://att.url.1',
        },
      ],
      bodyLocArgs: ['bodyArg1', 'bodyArg2'],
      bodyLocKey: 'bodyKey1',
      category: 'category1',
      contentAvailable: true,
      group: 'group1',
      icon: 'icon1',
      notificationCount: 3,
      notificationTimestamp: '2022-02-02T15:17:42.767Z',
      sound: 'sound1',
      subtitle: 'subtitle1',
      tag: 'tag1',
      threadIdentifier: 'threadIdentifier1',
      titleLocArgs: ['titleArg1', 'titleArg2'],
      titleLocKey: 'titleKey1',
    });
  };

  const onPressShowMeSomeWarnings = () => {
    tracker.trackSelfDescribingEvent({});
    tracker.trackStructuredEvent({});
    tracker.trackPageViewEvent({});
    tracker.trackScreenViewEvent({});
  };

  const onPressTestSetSubject = async () => {
    try {
      await tracker.setSubjectData({
        userId: 'nextTester',
        domainUserId: '5d79770b-015b-4af8-8c91-b2ed6faf4b1e',
        language: 'es',
        colorDepth: 50,
        timezone: 'Europe/London',
        screenResolution: [300, 300],
      });
      await tracker.trackScreenViewEvent({name: 'afterSetSubjectTestSV'});
    } catch (e) {
      console.log(e.message);
    }
  };

  const onPressTestSecondTracker = () => {
    secTracker.trackScreenViewEvent({name: 'fromSecondTracker'});
    secTracker.trackStructuredEvent({
      category: 'SecTracker',
      action: 'trackStructured',
    });
  };

  const onPressPlayGC = async () => {
    try {
      await tracker.removeGlobalContexts('testTag');
      await tracker.addGlobalContexts({
        tag: 'testTagReloaded',
        globalContexts: [
          {
            schema:
              'iglu:com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0',
            data: {impressionId: 'test_global_contexts_Reloaded'},
          },
        ],
      });
      await tracker.trackPageViewEvent({pageUrl: 'afterGCChange.test'});
    } catch (e) {
      console.log(e.message);
    }
  };

  const onPressRemoveSecTracker = () => {
    removeTracker('sp2');
    // removeAllTrackers();
  };

  const onPressLogSessionData = async () => {
    try {
      const sessionUserId = await tracker.getSessionUserId();
      const sessionId = await tracker.getSessionId();
      const sessionIdx = await tracker.getSessionIndex();
      const isInBg = await tracker.getIsInBackground();
      const bgIndex = await tracker.getBackgroundIndex();
      const fgIndex = await tracker.getForegroundIndex();

      const sessionData = {
        userId: sessionUserId,
        sessionId: sessionId,
        sessionIndex: sessionIdx,
        isInBackground: isInBg,
        backgroundIndex: bgIndex,
        foregroundIndex: fgIndex,
      };
      console.log(
        'SnowplowTracker: Session Data: ' + JSON.stringify(sessionData),
      );
    } catch (e) {
      console.log(e.message);
    }
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        testID="scrollView"
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
          <Section title="Deep Link">
            <Button
              onPress={onPressTrackDeepLinkReceivedEvent}
              title="Track a Deep Link Received Event"
              color="#841584"
              accessibilityLabel="testDeepLinkReceived"
            />
          </Section>
          <Section title="Message Notification">
            <Button
              onPress={onPressTrackMessageNotificationEvent}
              title="Track a Message Notification Event"
              color="#841584"
              accessibilityLabel="testMessageNotification"
            />
          </Section>
          <Section title="Second tracker">
            <Button
              onPress={onPressTestSecondTracker}
              title="Track events with second tracker"
              color="#841584"
              accessibilityLabel="testSecTracker"
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
          <Section title="SessionData">
            <Button
              onPress={onPressLogSessionData}
              title="Show me session data"
              color="#f6bd3b"
              accessibilityLabel="testSessionData"
            />
          </Section>

          <Section title="GC">
            <Button
              onPress={onPressPlayGC}
              title="Remove and Add Global Contexts"
              color="#228B22"
              accessibilityLabel="testGC"
            />
          </Section>
          <Section title="Removals">
            <Button
              onPress={onPressRemoveSecTracker}
              title="Remove Tracker"
              color="#AA2222"
              accessibilityLabel="testRemove"
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
