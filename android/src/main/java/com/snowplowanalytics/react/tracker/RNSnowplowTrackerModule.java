
package com.snowplowanalytics.react.tracker;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

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
import com.snowplowanalytics.snowplow.tracker.events.PageView;

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
    public void initialize(ReadableMap options,
                          Promise promise) {

        // throw if index.js has failed to pass a complete options object
        if (!(options.hasKey("endpoint") &&
            options.hasKey("namespace") &&
            options.hasKey("appId") &&
            options.hasKey("method") &&
            options.hasKey("protocol") &&
            options.hasKey("setBase64Encoded") &&
            options.hasKey("setPlatformContext") &&
            options.hasKey("setApplicationContext") &&
            options.hasKey("setLifecycleEvents") &&
            options.hasKey("setScreenContext") &&
            options.hasKey("setSessionContext") &&
            options.hasKey("foregroundTimeout") &&
            options.hasKey("backgroundTimeout") &&
            options.hasKey("checkInterval") &&
            options.hasKey("setInstallEvent")
            )) {
              promise.reject("ERROR", "SnowplowTracker: initialize() method - missing parameter with no default found");
            }

        this.emitter = new Emitter.EmitterBuilder(options.getString("endpoint"), this.reactContext)
                .method(options.getString("method").equalsIgnoreCase("post") ? HttpMethod.POST : HttpMethod.GET)
                .security(options.getString("protocol").equalsIgnoreCase("https") ? RequestSecurity.HTTPS : RequestSecurity.HTTP)
                .build();
        this.emitter.waitForEventStore();

        com.snowplowanalytics.snowplow.tracker.Subject subject = new com.snowplowanalytics.snowplow.tracker.Subject.SubjectBuilder()
                .build();

        this.tracker = Tracker.init(new Tracker
                .TrackerBuilder(this.emitter, options.getString("namespace"), options.getString("appId"), this.reactContext)
                .subject(subject)
                .base64(options.getBoolean("setBase64Encoded"))
                .mobileContext(options.getBoolean("setPlatformContext"))
                .applicationContext(options.getBoolean("setApplicationContext"))
                .sessionContext(options.getBoolean("setSessionContext"))
                .sessionCheckInterval(options.getInt("checkInterval"))
                .foregroundTimeout(options.getInt("foregroundTimeout"))
                .backgroundTimeout(options.getInt("backgroundTimeout"))
                .lifecycleEvents(options.getBoolean("setLifecycleEvents"))
                .screenContext(options.getBoolean("setScreenContext"))
                .installTracking(options.getBoolean("setInstallEvent"))
                .build()
        );

        if (this.tracker != null) {
          promise.resolve(true);
        } else {
          promise.reject("ERROR", "SnowplowTracker: initialize() method - tracker initialisation failed");
        }
    }

    @ReactMethod
    public void setSubjectData(ReadableMap options,
                              Promise promise) {

        if (options.hasKey("userId")) {
            tracker.instance().getSubject().setUserId(options.getString("userId"));
        }
        if (options.hasKey("timezone")) {
            tracker.instance().getSubject().setTimezone(options.getString("timezone"));
        }
        if (options.hasKey("language")) {
            tracker.instance().getSubject().setLanguage(options.getString("language"));
        }
        if (options.hasKey("ipAddress")) {
            tracker.instance().getSubject().setIpAddress(options.getString("ipAddress"));
        }
        if (options.hasKey("useragent")) {
            tracker.instance().getSubject().setUseragent(options.getString("useragent"));
        }
        if (options.hasKey("networkUserId")) {
            tracker.instance().getSubject().setNetworkUserId(options.getString("networkUserId"));
        }
        if (options.hasKey("domainUserId")) {
            tracker.instance().getSubject().setDomainUserId(options.getString("domainUserId"));
        }
        // integer values will throw an exception if set to null explicitly
        if (options.hasKey("viewportWidth") && options.hasKey("viewportHeight")) {
            if (options.isNull("viewportWidth") || options.isNull("viewportHeight")) {
                promise.reject("ERROR", "SnowplowTracker: setSubjectData() method - viewportWidth and viewportHeight cannot be null");
            } else {
                tracker.instance().getSubject().setViewPort(options.getInt("viewportWidth"), options.getInt("viewportHeight"));
            }
        }
        if (options.hasKey("screenWidth") && options.hasKey("screenHeight")) {
            if (options.isNull("screenWidth") || options.isNull("screenHeight")) {
                promise.reject("ERROR", "SnowplowTracker: setSubjectData() method - screenWidth and screenHeight cannot be null");
            } else {
                tracker.instance().getSubject().setScreenResolution(options.getInt("screenWidth"), options.getInt("screenHeight"));
            }
        }
        if (options.hasKey("colorDepth")) {
            if (options.isNull("colorDepth")) {
                promise.reject("ERROR", "SnowplowTracker: setSubjectData() method - colorDepth cannot be null");
            } else {
                tracker.instance().getSubject().setColorDepth(options.getInt("colorDepth"));
            }
        }
    }

    @ReactMethod
    public void trackSelfDescribingEvent(ReadableMap event, ReadableArray contexts) {
        SelfDescribing trackerEvent = EventUtil.getSelfDescribingEvent(event, contexts);
        if (trackerEvent != null) {
            tracker.track(trackerEvent);
        }
    }

    @ReactMethod
    public void trackStructuredEvent(ReadableMap details,
                                     ReadableArray contexts) {

        Structured trackerEvent = EventUtil.getStructuredEvent(
          details,
          contexts);
        if (trackerEvent != null) {
            tracker.track(trackerEvent);
        }
    }

    @ReactMethod
    public void trackScreenViewEvent(ReadableMap details,
                                     ReadableArray contexts) {

        ScreenView trackerEvent = EventUtil.getScreenViewEvent(
          details,
          contexts);
        if (trackerEvent != null) {
            tracker.track(trackerEvent);
        }
    }

    @ReactMethod
    public void trackPageViewEvent(ReadableMap details,
                                  ReadableArray contexts) {

        PageView trackerEvent = EventUtil.getPageViewEvent(
            details,
            contexts);
        if (trackerEvent != null) {
            tracker.track(trackerEvent);
        }
    }
}
