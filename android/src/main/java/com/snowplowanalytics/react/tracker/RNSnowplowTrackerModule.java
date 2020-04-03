
package com.snowplowanalytics.react.tracker;

import java.util.UUID;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.snowplowanalytics.react.util.EventUtil;
import com.snowplowanalytics.snowplow.tracker.Emitter;
import com.snowplowanalytics.snowplow.tracker.Tracker;
import com.snowplowanalytics.snowplow.tracker.emitter.HttpMethod;
import com.snowplowanalytics.snowplow.tracker.emitter.RequestSecurity;
import com.snowplowanalytics.snowplow.tracker.events.SelfDescribing;
import com.snowplowanalytics.snowplow.tracker.events.Structured;
import com.snowplowanalytics.snowplow.tracker.events.ScreenView;

public class RNSnowplowTrackerModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;
    private Tracker tracker;
    private Emitter emitter;

    public RNSnowplowTrackerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "RNSnowplowTracker";
    }

    @ReactMethod
    public void initialize(String endpoint, String method, String protocol,
                           String namespace, String appId, ReadableMap options) {
        this.emitter = new Emitter.EmitterBuilder(endpoint, this.reactContext)
                .method(method.equalsIgnoreCase("post") ? HttpMethod.POST : HttpMethod.GET)
                .security(protocol.equalsIgnoreCase("https") ? RequestSecurity.HTTPS : RequestSecurity.HTTP)
                .build();
        this.emitter.waitForEventStore();
        com.snowplowanalytics.snowplow.tracker.Subject subject = new com.snowplowanalytics.snowplow.tracker.Subject.SubjectBuilder()
                .build();
        if (options.hasKey("userId") && options.getString("userId") != null && !options.getString("userId").isEmpty()) {
            subject.setUserId(options.getString("userId"));
        }
        this.tracker = Tracker.init(new Tracker
                .TrackerBuilder(this.emitter, namespace, appId, this.reactContext)
                // setSubject/UserID
                .subject(subject)
                // setBase64Encoded
                .base64(options.hasKey("setBase64Encoded") ? options.getBoolean("setBase64Encoded") : false)
                // setPlatformContext
                .mobileContext(options.hasKey("setPlatformContext") ? options.getBoolean("setPlatformContext") : false)
                .screenviewEvents(options.hasKey("autoScreenView") ? options.getBoolean("autoScreenView") : false)
                // setApplicationContext
                .applicationContext(options.hasKey("setApplicationContext") ? options.getBoolean("setApplicationContext") : false)
                // setSessionContext
                .sessionContext(options.hasKey("setSessionContext") ? options.getBoolean("setSessionContext") : false)
                .sessionCheckInterval(options.hasKey("checkInterval") ? options.getInt("checkInterval") : 15)
                .foregroundTimeout(options.hasKey("foregroundTimeout") ? options.getInt("foregroundTimeout") : 600)
                .backgroundTimeout(options.hasKey("backgroundTimeout") ? options.getInt("backgroundTimeout") : 300)
                // setLifecycleEvents
                .lifecycleEvents(options.hasKey("setLifecycleEvents") ? options.getBoolean("setLifecycleEvents") : false)
                // setScreenContext
                .screenContext(options.hasKey("setScreenContext") ? options.getBoolean("setScreenContext") : false)
                // setGeoLocationContext
                .geoLocationContext(options.hasKey("setGeoLocationContext") ? options.getBoolean("setGeoLocationContext") : false)
                // setInstallEvent
                .installTracking(options.hasKey("setInstallEvent") ? options.getBoolean("setInstallEvent") : false)
                // setExceptionEvents
                .applicationCrash(options.hasKey("setExceptionEvents") ? options.getBoolean("setExceptionEvents") : false)
                .build()
        );
    }

    @ReactMethod
    public void trackSelfDescribingEvent(ReadableMap event, ReadableArray contexts) {
        SelfDescribing trackerEvent = EventUtil.getSelfDescribingEvent(event, contexts);
        if (trackerEvent != null) {
            tracker.track(trackerEvent);
        }
    }

    @ReactMethod
    public void trackStructuredEvent(String category, String action, String label,
                                     String property, Float value, ReadableArray contexts) {
        Structured trackerEvent = EventUtil.getStructuredEvent(category, action, label,
                property, value, contexts);
        if (trackerEvent != null) {
            tracker.track(trackerEvent);
        }
    }

    @ReactMethod
    public void trackScreenViewEvent(String screenName, String screenId, String screenType,
                                     String previousScreenName, String previousScreenType,
                                     String previousScreenId, String transitionType,
                                     ReadableArray contexts) {
        if (screenId == null) {
          screenId = UUID.randomUUID().toString();
        }
        ScreenView trackerEvent = EventUtil.getScreenViewEvent(screenName,
                screenId, screenType, previousScreenName, previousScreenId, previousScreenType,
                transitionType, contexts);
        if (trackerEvent != null) {
            tracker.track(trackerEvent);
        }
    }
    
    @ReactMethod
    public void setUserId(String userId, ReadableMap options) {
        tracker.instance().getSubject().setUserId(userId);
    }
}
