package com.snowplowanalytics.react.tracker;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;

import com.snowplowanalytics.snowplow.Snowplow;
import com.snowplowanalytics.snowplow.configuration.Configuration;
import com.snowplowanalytics.snowplow.configuration.EmitterConfiguration;
import com.snowplowanalytics.snowplow.configuration.GdprConfiguration;
import com.snowplowanalytics.snowplow.configuration.NetworkConfiguration;
import com.snowplowanalytics.snowplow.configuration.RemoteConfiguration;
import com.snowplowanalytics.snowplow.configuration.SessionConfiguration;
import com.snowplowanalytics.snowplow.configuration.TrackerConfiguration;
import com.snowplowanalytics.snowplow.configuration.SubjectConfiguration;
import com.snowplowanalytics.snowplow.configuration.GlobalContextsConfiguration;
import com.snowplowanalytics.snowplow.event.DeepLinkReceived;
import com.snowplowanalytics.snowplow.event.MessageNotification;
import com.snowplowanalytics.snowplow.globalcontexts.GlobalContext;
import com.snowplowanalytics.snowplow.controller.TrackerController;
import com.snowplowanalytics.snowplow.payload.SelfDescribingJson;
import com.snowplowanalytics.snowplow.event.SelfDescribing;
import com.snowplowanalytics.snowplow.event.ScreenView;
import com.snowplowanalytics.snowplow.event.Structured;
import com.snowplowanalytics.snowplow.event.PageView;
import com.snowplowanalytics.snowplow.event.Timing;
import com.snowplowanalytics.snowplow.event.ConsentGranted;
import com.snowplowanalytics.snowplow.event.ConsentWithdrawn;
import com.snowplowanalytics.snowplow.event.EcommerceTransactionItem;
import com.snowplowanalytics.snowplow.event.EcommerceTransaction;
import com.snowplowanalytics.snowplow.network.HttpMethod;
import com.snowplowanalytics.snowplow.internal.utils.Util;
import com.snowplowanalytics.snowplow.util.Size;

import java.util.List;
import java.util.ArrayList;

import com.snowplowanalytics.react.util.EventUtil;
import com.snowplowanalytics.react.util.ConfigUtil;

public class RNSnowplowTrackerModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public RNSnowplowTrackerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "RNSnowplowTracker";
    }

    @ReactMethod
    public void createTracker(ReadableMap argmap,
                              Promise promise) {
        try {
            String trackerNs = argmap.getString("namespace");
            ReadableMap networkConfig = argmap.getMap("networkConfig");

            // NetworkConfiguration
            NetworkConfiguration networkConfiguration;
            if (networkConfig.hasKey("method") && !networkConfig.isNull("method")) {
                String method = networkConfig.getString("method");
                networkConfiguration = new NetworkConfiguration(
                    networkConfig.getString("endpoint"),
                    ("get".equalsIgnoreCase(method) ? HttpMethod.GET : HttpMethod.POST));
            } else {
                networkConfiguration = new NetworkConfiguration(networkConfig.getString("endpoint"));
            }

            // Configurations
            List<Configuration> controllers = new ArrayList<Configuration>();

            // TrackerConfiguration
            if (argmap.hasKey("trackerConfig")) {
                ReadableMap trackerConfig = argmap.getMap("trackerConfig");
                TrackerConfiguration trackerConfiguration = ConfigUtil.mkTrackerConfiguration(trackerConfig, this.reactContext);
                controllers.add(trackerConfiguration);
            }

            // SessionConfiguration
            if (argmap.hasKey("sessionConfig")) {
                ReadableMap sessionConfig = argmap.getMap("sessionConfig");
                SessionConfiguration sessionConfiguration = ConfigUtil.mkSessionConfiguration(sessionConfig);
                controllers.add(sessionConfiguration);
            }

            // EmitterConfiguration
            if (argmap.hasKey("emitterConfig")) {
                ReadableMap emitterConfig = argmap.getMap("emitterConfig");
                EmitterConfiguration emitterConfiguration = ConfigUtil.mkEmitterConfiguration(emitterConfig);
                controllers.add(emitterConfiguration);
            }

            // SubjectConfiguration
            if (argmap.hasKey("subjectConfig")) {
                ReadableMap subjectConfig = argmap.getMap("subjectConfig");
                SubjectConfiguration subjectConfiguration = ConfigUtil.mkSubjectConfiguration(subjectConfig);
                controllers.add(subjectConfiguration);
            }

            // GdprConfiguration
            if (argmap.hasKey("gdprConfig")) {
                ReadableMap gdprConfig = argmap.getMap("gdprConfig");
                GdprConfiguration gdprConfiguration = ConfigUtil.mkGdprConfiguration(gdprConfig);
                controllers.add(gdprConfiguration);
            }

            // GCConfiguration
            if (argmap.hasKey("gcConfig")) {
                ReadableArray gcConfig = argmap.getArray("gcConfig");
                GlobalContextsConfiguration gcConfiguration = ConfigUtil.mkGCConfiguration(gcConfig);
                controllers.add(gcConfiguration);
            }

            // create the tracker
            Snowplow.createTracker(this.reactContext,
                                   trackerNs,
                                   networkConfiguration,
                                   controllers.toArray(new Configuration[controllers.size()]));

            promise.resolve(true);

        } catch(Throwable t) {
            promise.reject("ERROR", t.getMessage());
        }
    }

    @ReactMethod
    public void removeTracker(ReadableMap details,
                              Promise promise) {
        try {
            String namespace = details.getString("tracker");
            TrackerController trackerController = Snowplow.getTracker(namespace);

            promise.resolve(Snowplow.removeTracker(trackerController));

        } catch(Throwable t) {
            promise.reject("ERROR", t.getMessage());
        }
    }

    @ReactMethod
    public void removeAllTrackers(Promise promise) {
        try {
            Snowplow.removeAllTrackers();
            promise.resolve(true);

        } catch(Throwable t) {
            promise.reject("ERROR", t.getMessage());
        }
    }

    @ReactMethod
    public void trackSelfDescribingEvent(ReadableMap details,
                                         Promise promise) {
        try {
            String namespace = details.getString("tracker");
            ReadableMap argmap = details.getMap("eventData");
            ReadableArray contexts = details.getArray("contexts");

            TrackerController trackerController = Snowplow.getTracker(namespace);

            SelfDescribingJson sdj = EventUtil.createSelfDescribingJson(argmap);
            SelfDescribing event = new SelfDescribing(sdj);

            List<SelfDescribingJson> evCtxts = EventUtil.createContexts(contexts);
            event.customContexts.addAll(evCtxts);

            trackerController.track(event);
            promise.resolve(true);

        } catch(Throwable t) {
            promise.reject("ERROR", t.getMessage());
        }
    }

    @ReactMethod
    public void trackStructuredEvent(ReadableMap details,
                                     Promise promise) {
        try {
            String namespace = details.getString("tracker");
            ReadableMap argmap = details.getMap("eventData");
            ReadableArray contexts = details.getArray("contexts");

            TrackerController trackerController = Snowplow.getTracker(namespace);

            Structured event = EventUtil.createStructuredEvent(argmap);

            List<SelfDescribingJson> evCtxts = EventUtil.createContexts(contexts);
            event.customContexts.addAll(evCtxts);

            trackerController.track(event);
            promise.resolve(true);

        } catch(Throwable t) {
            promise.reject("ERROR", t.getMessage());
        }
    }

    @ReactMethod
    public void trackScreenViewEvent(ReadableMap details,
                                     Promise promise) {
        try {
            String namespace = details.getString("tracker");
            ReadableMap argmap = details.getMap("eventData");
            ReadableArray contexts = details.getArray("contexts");

            TrackerController trackerController = Snowplow.getTracker(namespace);

            ScreenView event = EventUtil.createScreenViewEvent(argmap);

            List<SelfDescribingJson> evCtxts = EventUtil.createContexts(contexts);
            event.customContexts.addAll(evCtxts);

            trackerController.track(event);
            promise.resolve(true);

        } catch(Throwable t) {
            promise.reject("ERROR", t.getMessage());
        }
    }

    @ReactMethod
    public void trackPageViewEvent(ReadableMap details,
                                   Promise promise) {
        try {
            String namespace = details.getString("tracker");
            ReadableMap argmap = details.getMap("eventData");
            ReadableArray contexts = details.getArray("contexts");

            TrackerController trackerController = Snowplow.getTracker(namespace);

            PageView event = EventUtil.createPageViewEvent(argmap);

            List<SelfDescribingJson> evCtxts = EventUtil.createContexts(contexts);
            event.customContexts.addAll(evCtxts);

            trackerController.track(event);
            promise.resolve(true);

        } catch(Throwable t) {
            promise.reject("ERROR", t.getMessage());
        }
    }

    @ReactMethod
    public void trackTimingEvent(ReadableMap details,
                                 Promise promise) {
        try {
            String namespace = details.getString("tracker");
            ReadableMap argmap = details.getMap("eventData");
            ReadableArray contexts = details.getArray("contexts");

            TrackerController trackerController = Snowplow.getTracker(namespace);

            Timing event = EventUtil.createTimingEvent(argmap);

            List<SelfDescribingJson> evCtxts = EventUtil.createContexts(contexts);
            event.customContexts.addAll(evCtxts);

            trackerController.track(event);
            promise.resolve(true);

        } catch(Throwable t) {
            promise.reject("ERROR", t.getMessage());
        }
    }

    @ReactMethod
    public void trackConsentGrantedEvent(ReadableMap details,
                                         Promise promise) {
        try {
            String namespace = details.getString("tracker");
            ReadableMap argmap = details.getMap("eventData");
            ReadableArray contexts = details.getArray("contexts");

            TrackerController trackerController = Snowplow.getTracker(namespace);

            ConsentGranted event = EventUtil.createConsentGrantedEvent(argmap);

            List<SelfDescribingJson> evCtxts = EventUtil.createContexts(contexts);
            event.customContexts.addAll(evCtxts);

            trackerController.track(event);
            promise.resolve(true);

        } catch(Throwable t) {
            promise.reject("ERROR", t.getMessage());
        }
    }

    @ReactMethod
    public void trackConsentWithdrawnEvent(ReadableMap details,
                                           Promise promise) {
        try {
            String namespace = details.getString("tracker");
            ReadableMap argmap = details.getMap("eventData");
            ReadableArray contexts = details.getArray("contexts");

            TrackerController trackerController = Snowplow.getTracker(namespace);

            ConsentWithdrawn event = EventUtil.createConsentWithdrawnEvent(argmap);

            List<SelfDescribingJson> evCtxts = EventUtil.createContexts(contexts);
            event.customContexts.addAll(evCtxts);

            trackerController.track(event);
            promise.resolve(true);

        } catch(Throwable t) {
            promise.reject("ERROR", t.getMessage());
        }
    }

    @ReactMethod
    public void trackEcommerceTransactionEvent(ReadableMap details,
                                               Promise promise) {
        try {
            String namespace = details.getString("tracker");
            ReadableMap argmap = details.getMap("eventData");
            ReadableArray contexts = details.getArray("contexts");

            TrackerController trackerController = Snowplow.getTracker(namespace);

            EcommerceTransaction event = EventUtil.createEcommerceTransactionEvent(argmap);

            List<SelfDescribingJson> evCtxts = EventUtil.createContexts(contexts);
            event.customContexts.addAll(evCtxts);

            trackerController.track(event);
            promise.resolve(true);

        } catch(Throwable t) {
            promise.reject("ERROR", t.getMessage());
        }
    }

    @ReactMethod
    public void trackDeepLinkReceivedEvent(ReadableMap details,
                                           Promise promise) {
        try {
            String namespace = details.getString("tracker");
            ReadableMap argmap = details.getMap("eventData");
            ReadableArray contexts = details.getArray("contexts");

            TrackerController trackerController = Snowplow.getTracker(namespace);

            DeepLinkReceived event = EventUtil.createDeepLinkReceivedEvent(argmap);

            List<SelfDescribingJson> evCtxts = EventUtil.createContexts(contexts);
            event.customContexts.addAll(evCtxts);

            trackerController.track(event);
            promise.resolve(true);

        } catch(Throwable t) {
            promise.reject("ERROR", t.getMessage());
        }
    }

    @ReactMethod
    public void trackMessageNotificationEvent(ReadableMap details,
                                              Promise promise) {
        try {
            String namespace = details.getString("tracker");
            ReadableMap argmap = details.getMap("eventData");
            ReadableArray contexts = details.getArray("contexts");

            TrackerController trackerController = Snowplow.getTracker(namespace);

            MessageNotification event = EventUtil.createMessageNotificationEvent(argmap);

            List<SelfDescribingJson> evCtxts = EventUtil.createContexts(contexts);
            event.customContexts.addAll(evCtxts);

            trackerController.track(event);
            promise.resolve(true);

        } catch(Throwable t) {
            promise.reject("ERROR", t.getMessage());
        }
    }

    @ReactMethod
    public void removeGlobalContexts(ReadableMap details,
                                     Promise promise) {
        try {
            String namespace = details.getString("tracker");
            String tag = details.getString("removeTag");

            TrackerController trackerController = Snowplow.getTracker(namespace);

            trackerController.getGlobalContexts().remove(tag);
            promise.resolve(true);

        } catch(Throwable t) {
            promise.reject("ERROR", t.getMessage());
        }
    }

    @ReactMethod
    public void addGlobalContexts(ReadableMap details,
                                  Promise promise) {
        try {
            String namespace = details.getString("tracker");
            ReadableMap gcArg = details.getMap("addGlobalContext");

            String tag = gcArg.getString("tag");
            ReadableArray globalContexts = gcArg.getArray("globalContexts") ;

            List<SelfDescribingJson> staticContexts = new ArrayList<>();
            for (int i = 0; i < globalContexts.size(); i++) {
                SelfDescribingJson gContext = EventUtil.createSelfDescribingJson(globalContexts.getMap(i));
                staticContexts.add(gContext);
            }
            GlobalContext gcStatic = new GlobalContext(staticContexts);

            TrackerController trackerController = Snowplow.getTracker(namespace);

            trackerController.getGlobalContexts().add(tag, gcStatic);
            promise.resolve(true);

        } catch(Throwable t) {
            promise.reject("ERROR", t.getMessage());
        }
    }

    @ReactMethod
    public void setUserId(ReadableMap details,
                          Promise promise) {
        try {
            String namespace = details.getString("tracker");
            TrackerController trackerController = Snowplow.getTracker(namespace);

            if (details.isNull("userId")) {
                trackerController.getSubject().setUserId(null);
            } else {
                trackerController.getSubject().setUserId(details.getString("userId"));
            }
            promise.resolve(true);

        } catch(Throwable t) {
            promise.reject("ERROR", t.getMessage());
        }
    }

    @ReactMethod
    public void setNetworkUserId(ReadableMap details,
                                 Promise promise) {
        try {
            String namespace = details.getString("tracker");
            TrackerController trackerController = Snowplow.getTracker(namespace);

            if (details.isNull("networkUserId")) {
                trackerController.getSubject().setNetworkUserId(null);
            } else {
                trackerController.getSubject().setNetworkUserId(details.getString("networkUserId"));
            }
            promise.resolve(true);

        } catch(Throwable t) {
            promise.reject("ERROR", t.getMessage());
        }
    }

    @ReactMethod
    public void setDomainUserId(ReadableMap details,
                                Promise promise) {
        try {
            String namespace = details.getString("tracker");
            TrackerController trackerController = Snowplow.getTracker(namespace);

            if (details.isNull("domainUserId")) {
                trackerController.getSubject().setDomainUserId(null);
            } else {
                trackerController.getSubject().setDomainUserId(details.getString("domainUserId"));
            }
            promise.resolve(true);

        } catch(Throwable t) {
            promise.reject("ERROR", t.getMessage());
        }
    }

    @ReactMethod
    public void setIpAddress(ReadableMap details,
                             Promise promise) {
        try {
            String namespace = details.getString("tracker");
            TrackerController trackerController = Snowplow.getTracker(namespace);

            if (details.isNull("ipAddress")) {
                trackerController.getSubject().setIpAddress(null);
            } else {
                trackerController.getSubject().setIpAddress(details.getString("ipAddress"));
            }
            promise.resolve(true);

        } catch(Throwable t) {
            promise.reject("ERROR", t.getMessage());
        }
    }

    @ReactMethod
    public void setUseragent(ReadableMap details,
                             Promise promise) {
        try {
            String namespace = details.getString("tracker");
            TrackerController trackerController = Snowplow.getTracker(namespace);

            if (details.isNull("useragent")) {
                trackerController.getSubject().setUseragent(null);
            } else {
                trackerController.getSubject().setUseragent(details.getString("useragent"));
            }
            promise.resolve(true);

        } catch(Throwable t) {
            promise.reject("ERROR", t.getMessage());
        }
    }

    @ReactMethod
    public void setTimezone(ReadableMap details,
                            Promise promise) {
        try {
            String namespace = details.getString("tracker");
            TrackerController trackerController = Snowplow.getTracker(namespace);

            if (details.isNull("timezone")) {
                trackerController.getSubject().setTimezone(null);
            } else {
                trackerController.getSubject().setTimezone(details.getString("timezone"));
            }
            promise.resolve(true);

        } catch(Throwable t) {
            promise.reject("ERROR", t.getMessage());
        }
    }

    @ReactMethod
    public void setLanguage(ReadableMap details,
                            Promise promise) {
        try {
            String namespace = details.getString("tracker");
            TrackerController trackerController = Snowplow.getTracker(namespace);

            if (details.isNull("language")) {
                trackerController.getSubject().setLanguage(null);
            } else {
                trackerController.getSubject().setLanguage(details.getString("language"));
            }
            promise.resolve(true);

        } catch(Throwable t) {
            promise.reject("ERROR", t.getMessage());
        }
    }

    @ReactMethod
    public void setScreenResolution(ReadableMap details,
                                    Promise promise) {
        try {
            String namespace = details.getString("tracker");
            TrackerController trackerController = Snowplow.getTracker(namespace);

            if (details.isNull("screenResolution")) {
                trackerController.getSubject().setScreenResolution(null);
            } else {
                ReadableArray screenRes = details.getArray("screenResolution");
                int width = screenRes.getInt(0);
                int height = screenRes.getInt(1);
                Size screenR = new Size(width, height);

                trackerController.getSubject().setScreenResolution(screenR);
            }
            promise.resolve(true);

        } catch(Throwable t) {
            promise.reject("ERROR", t.getMessage());
        }
    }

    @ReactMethod
    public void setScreenViewport(ReadableMap details,
                                  Promise promise) {
        try {
            String namespace = details.getString("tracker");
            TrackerController trackerController = Snowplow.getTracker(namespace);

            if (details.isNull("screenViewport")) {
                trackerController.getSubject().setScreenViewPort(null);
            } else {
                ReadableArray screenView = details.getArray("screenViewport");
                int width = screenView.getInt(0);
                int height = screenView.getInt(1);
                Size screenVP = new Size(width, height);

                trackerController.getSubject().setScreenViewPort(screenVP);
            }
            promise.resolve(true);

        } catch(Throwable t) {
            promise.reject("ERROR", t.getMessage());
        }
    }

    @ReactMethod
    public void setColorDepth(ReadableMap details,
                              Promise promise) {
        try {
            String namespace = details.getString("tracker");
            TrackerController trackerController = Snowplow.getTracker(namespace);

            if (details.isNull("colorDepth")) {
                trackerController.getSubject().setColorDepth(null);
            } else {
                trackerController.getSubject().setColorDepth(details.getInt("colorDepth"));
            }
            promise.resolve(true);

        } catch(Throwable t) {
            promise.reject("ERROR", t.getMessage());
        }
    }

    @ReactMethod
    public void getSessionUserId(ReadableMap details,
                                 Promise promise) {
        try {
            String namespace = details.getString("tracker");
            TrackerController trackerController = Snowplow.getTracker(namespace);

            String suid = trackerController.getSession().getUserId();
            promise.resolve(suid);
        } catch(Throwable t) {
            promise.reject("ERROR", t.getMessage());
        }
    }

    @ReactMethod
    public void getSessionId(ReadableMap details,
                             Promise promise) {
        try {
            String namespace = details.getString("tracker");
            TrackerController trackerController = Snowplow.getTracker(namespace);

            String sid = trackerController.getSession().getSessionId();
            promise.resolve(sid);
        } catch(Throwable t) {
            promise.reject("ERROR", t.getMessage());
        }
    }

    @ReactMethod
    public void getSessionIndex(ReadableMap details,
                                Promise promise) {
        try {
            String namespace = details.getString("tracker");
            TrackerController trackerController = Snowplow.getTracker(namespace);

            int sidx = trackerController.getSession().getSessionIndex();
            promise.resolve(sidx);
        } catch(Throwable t) {
            promise.reject("ERROR", t.getMessage());
        }
    }

    @ReactMethod
    public void getIsInBackground(ReadableMap details,
                                  Promise promise) {
        try {
            String namespace = details.getString("tracker");
            TrackerController trackerController = Snowplow.getTracker(namespace);

            boolean isInBg = trackerController.getSession().isInBackground();
            promise.resolve(isInBg);
        } catch(Throwable t) {
            promise.reject("ERROR", t.getMessage());
        }
    }

    @ReactMethod
    public void getBackgroundIndex(ReadableMap details,
                                   Promise promise) {
        try {
            String namespace = details.getString("tracker");
            TrackerController trackerController = Snowplow.getTracker(namespace);

            int bgIdx = trackerController.getSession().getBackgroundIndex();
            promise.resolve(bgIdx);
        } catch(Throwable t) {
            promise.reject("ERROR", t.getMessage());
        }
    }

    @ReactMethod
    public void getForegroundIndex(ReadableMap details,
                                   Promise promise) {
        try {
            String namespace = details.getString("tracker");
            TrackerController trackerController = Snowplow.getTracker(namespace);

            int fgIdx = trackerController.getSession().getForegroundIndex();
            promise.resolve(fgIdx);
        } catch(Throwable t) {
            promise.reject("ERROR", t.getMessage());
        }
    }

}
