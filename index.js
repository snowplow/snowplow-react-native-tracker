import { NativeModules } from 'react-native';

const { RNSnowplowTracker } = NativeModules;

export default class Tracker {

  static async initialize(argmap) {

    let defaults = {// defaults for optional params
                 method: 'post',
                 protocol: 'https',
                 base64Encoded : true,
                 platformContext : true,
                 applicationContext : false,
                 lifecycleEvents : false,
                 screenContext : true,
                 sessionContext : true,
                 foregroundTimeout : 600,
                 backgroundTimeout : 300,
                 checkInterval : 15,
                 installTracking : false}

    if (typeof argmap.endpoint !== 'undefined' && typeof argmap.appId !== 'undefined' && typeof argmap.namespace !== 'undefined' ) {
      return await RNSnowplowTracker.initialize({...defaults, ...argmap});
    } else if (__DEV__) {
      console.warn("SnowplowTracker: initialize() requires endpoint, namespace and appId parameter to be set")
      return;
    }
  }

  static setSubjectData(argmap) {
    RNSnowplowTracker.setSubjectData(argmap);
  }

  static trackScreenViewEvent(argmap, ctxt=[]) {

    if (typeof argmap.screenName !== 'undefined') {
      return RNSnowplowTracker.trackScreenViewEvent(argmap, ctxt);
    } else if (__DEV__) {
      console.warn("SnowplowTracker: trackScreenViewEvent() requires screenName parameter to be set");
      return;
    }
  }

  static trackSelfDescribingEvent(argmap, ctxt=[]) {
    if (typeof argmap.schema !== 'undefined' && typeof argmap.data !== 'undefined') {
      return RNSnowplowTracker.trackSelfDescribingEvent(argmap, ctxt);
    } else if (__DEV__) {
      console.warn("SnowplowTracker: trackSelfDescribingEvent() requires schema and data parameters to be set");
      return;
    }
  }

  static trackStructuredEvent(argmap, ctxt=[]) {

    if (typeof argmap.category !== 'undefined' && typeof argmap.action !== 'undefined') {
      return RNSnowplowTracker.trackStructuredEvent(argmap, ctxt);
    } else if (__DEV__) {
      console.warn("SnowplowTracker: trackStructuredEvent() requires category and action parameters to be set");
      return;
    }
  }

  static trackPageViewEvent(argmap, ctxt=[]) {

    if (typeof argmap.pageUrl !== 'undefined') {
      return RNSnowplowTracker.trackPageViewEvent(argmap, ctxt);
    } else if (__DEV__) {
      console.warn("SnowplowTracker: trackPageViewEvent() requires pageUrl parameter to be set");
      return;
    }
  }
}
