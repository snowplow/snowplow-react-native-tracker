package com.snowplowanalytics.react.util;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;

import com.snowplowanalytics.snowplow.configuration.EmitterConfiguration;
import com.snowplowanalytics.snowplow.configuration.GdprConfiguration;
import com.snowplowanalytics.snowplow.configuration.NetworkConfiguration;
import com.snowplowanalytics.snowplow.configuration.RemoteConfiguration;
import com.snowplowanalytics.snowplow.configuration.SessionConfiguration;
import com.snowplowanalytics.snowplow.configuration.TrackerConfiguration;
import com.snowplowanalytics.snowplow.configuration.SubjectConfiguration;
import com.snowplowanalytics.snowplow.configuration.GlobalContextsConfiguration;
import com.snowplowanalytics.snowplow.globalcontexts.GlobalContext;
import com.snowplowanalytics.snowplow.payload.SelfDescribingJson;
import com.snowplowanalytics.snowplow.tracker.DevicePlatform;
import com.snowplowanalytics.snowplow.tracker.LogLevel;
import com.snowplowanalytics.snowplow.emitter.BufferOption;
import com.snowplowanalytics.snowplow.util.TimeMeasure;
import com.snowplowanalytics.snowplow.util.Basis;
import com.snowplowanalytics.snowplow.util.Size;

import java.util.concurrent.TimeUnit;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

import com.snowplowanalytics.react.util.TrackerVersion;
import com.snowplowanalytics.react.util.EventUtil;

public class ConfigUtil {

    public static DevicePlatform mkDevicePlatform(String devPlatform) {

        DevicePlatform devicePlatform = DevicePlatform.Mobile;
        if (devPlatform.equals("web")) {
            devicePlatform = DevicePlatform.Web;
        }
        else if (devPlatform.equals("srv")) {
            devicePlatform = DevicePlatform.ServerSideApp;
        }
        else if (devPlatform.equals("pc")) {
            devicePlatform = DevicePlatform.Desktop;
        }
        else if (devPlatform.equals("app")) {
            devicePlatform = DevicePlatform.General;
        }
        else if (devPlatform.equals("tv")) {
            devicePlatform = DevicePlatform.ConnectedTV;
        }
        else if (devPlatform.equals("cnsl")) {
            devicePlatform = DevicePlatform.GameConsole;
        }
        else if (devPlatform.equals("iot")) {
            devicePlatform = DevicePlatform.InternetOfThings;
        }

        return devicePlatform;
    }

    public static LogLevel mkLogLevel(String logLvl) {

        LogLevel logLevel = LogLevel.OFF;
        if (logLvl.equals("error")) {
            logLevel = LogLevel.ERROR;
        }
        else if (logLvl.equals("debug")) {
            logLevel = LogLevel.DEBUG;
        }
        else if (logLvl.equals("verbose")) {
            logLevel = LogLevel.VERBOSE;
        }

        return logLevel;
    }

    public static BufferOption mkBufferOption(String bufferOpt) {

        BufferOption bufferOption = BufferOption.Single;
        if (bufferOpt.equals("default")) {
            bufferOption = BufferOption.DefaultGroup;
        }
        else if (bufferOpt.equals("heavy")) {
            bufferOption = BufferOption.HeavyGroup;
        }

        return bufferOption;
    }

    public static Basis mkBasis(String basis) {

        Basis basisForProcessing = Basis.CONSENT;
        if (basis.equals("contract")) {
            basisForProcessing = Basis.CONTRACT;
        }
        if (basis.equals("legal_obligation")) {
            basisForProcessing = Basis.LEGAL_OBLIGATION;
        }
        if (basis.equals("legitimate_interests")) {
            basisForProcessing = Basis.LEGITIMATE_INTERESTS;
        }
        if (basis.equals("public_task")) {
            basisForProcessing = Basis.PUBLIC_TASK;
        }
        if (basis.equals("vital_interests")) {
            basisForProcessing = Basis.VITAL_INTERESTS;
        }

        return basisForProcessing;
    }

    public static TrackerConfiguration mkTrackerConfiguration(ReadableMap trackerConfig,
                                                              ReactApplicationContext context) {
        String appId = trackerConfig.hasKey("appId") ? trackerConfig.getString("appId") : context.getPackageName();

        TrackerConfiguration trackerConfiguration = new TrackerConfiguration(appId)
            .trackerVersionSuffix(TrackerVersion.RN_TRACKER_VERSION);

        if (trackerConfig.hasKey("devicePlatform")) {
            DevicePlatform devicePlatform = mkDevicePlatform(trackerConfig.getString("devicePlatform"));
            trackerConfiguration.devicePlatform(devicePlatform);
        }
        if (trackerConfig.hasKey("logLevel")) {
            LogLevel logLevel = mkLogLevel(trackerConfig.getString("logLevel"));
            trackerConfiguration.logLevel(logLevel);
        }
        if (trackerConfig.hasKey("base64Encoding")) {
            trackerConfiguration.base64encoding(trackerConfig.getBoolean("base64Encoding"));
        }
        if (trackerConfig.hasKey("applicationContext")) {
            trackerConfiguration.applicationContext(trackerConfig.getBoolean("applicationContext"));
        }
        if (trackerConfig.hasKey("platformContext")) {
            trackerConfiguration.platformContext(trackerConfig.getBoolean("platformContext"));
        }
        if (trackerConfig.hasKey("geoLocationContext")) {
            trackerConfiguration.geoLocationContext(trackerConfig.getBoolean("geoLocationContext"));
        }
        if (trackerConfig.hasKey("sessionContext")) {
            trackerConfiguration.sessionContext(trackerConfig.getBoolean("sessionContext"));
        }
        if (trackerConfig.hasKey("screenContext")) {
            trackerConfiguration.screenContext(trackerConfig.getBoolean("screenContext"));
        }
        if (trackerConfig.hasKey("screenViewAutotracking")) {
            trackerConfiguration.screenViewAutotracking(trackerConfig.getBoolean("screenViewAutotracking"));
        }
        if (trackerConfig.hasKey("lifecycleAutotracking")) {
            trackerConfiguration.lifecycleAutotracking(trackerConfig.getBoolean("lifecycleAutotracking"));
        }
        if (trackerConfig.hasKey("installAutotracking")) {
            trackerConfiguration.installAutotracking(trackerConfig.getBoolean("installAutotracking"));
        }
        if (trackerConfig.hasKey("exceptionAutotracking")) {
            trackerConfiguration.exceptionAutotracking(trackerConfig.getBoolean("exceptionAutotracking"));
        }
        if (trackerConfig.hasKey("diagnosticAutotracking")) {
            trackerConfiguration.diagnosticAutotracking(trackerConfig.getBoolean("diagnosticAutotracking"));
        }
        if (trackerConfig.hasKey("deepLinkContext")) {
            trackerConfiguration.deepLinkContext(trackerConfig.getBoolean("deepLinkContext"));
        }

        return trackerConfiguration;
    }

    public static SessionConfiguration mkSessionConfiguration(ReadableMap sessionConfig) {
        long foregroundTimeout = (long) sessionConfig.getDouble("foregroundTimeout");

        long backgroundTimeout = (long) sessionConfig.getDouble("backgroundTimeout");

        SessionConfiguration sessionConfiguration = new SessionConfiguration(
            new TimeMeasure(foregroundTimeout, TimeUnit.SECONDS),
            new TimeMeasure(backgroundTimeout, TimeUnit.SECONDS));

        return sessionConfiguration;
    }

    public static EmitterConfiguration mkEmitterConfiguration(ReadableMap emitterConfig) {
        EmitterConfiguration emitterConfiguration = new EmitterConfiguration();

        if (emitterConfig.hasKey("bufferOption")) {
            BufferOption bufferOption = mkBufferOption(emitterConfig.getString("bufferOption"));
            emitterConfiguration.bufferOption(bufferOption);
        }
        if (emitterConfig.hasKey("emitRange")) {
            int emitRange = (int) emitterConfig.getDouble("emitRange");
            emitterConfiguration.emitRange(emitRange);
        }
        if (emitterConfig.hasKey("threadPoolSize")) {
            int threadPoolSize = (int) emitterConfig.getDouble("threadPoolSize");
            emitterConfiguration.threadPoolSize(threadPoolSize);
        }
        if (emitterConfig.hasKey("byteLimitPost")) {
            int byteLimitPost = (int) emitterConfig.getDouble("byteLimitPost");
            emitterConfiguration.byteLimitPost(byteLimitPost);
        }
        if (emitterConfig.hasKey("byteLimitGet")) {
            int byteLimitGet = (int) emitterConfig.getDouble("byteLimitGet");
            emitterConfiguration.byteLimitGet(byteLimitGet);
        }

        return emitterConfiguration;
    }

    public static SubjectConfiguration mkSubjectConfiguration(ReadableMap subjectConfig) {
        SubjectConfiguration subjectConfiguration = new SubjectConfiguration();

        if (subjectConfig.hasKey("userId")) {
            if (subjectConfig.isNull("userId")) {
                subjectConfiguration.userId(null);
            }
            else {
                subjectConfiguration.userId(subjectConfig.getString("userId"));
            }
        }
        if (subjectConfig.hasKey("networkUserId")) {
            if (subjectConfig.isNull("networkUserId")) {
                subjectConfiguration.networkUserId(null);
            }
            else {
                subjectConfiguration.networkUserId(subjectConfig.getString("networkUserId"));
            }
        }
        if (subjectConfig.hasKey("domainUserId")) {
            if (subjectConfig.isNull("domainUserId")) {
                subjectConfiguration.domainUserId(null);
            }
            else {
                subjectConfiguration.domainUserId(subjectConfig.getString("domainUserId"));
            }
        }
        if (subjectConfig.hasKey("useragent")) {
            if (subjectConfig.isNull("useragent")) {
                subjectConfiguration.useragent(null);
            }
            else {
                subjectConfiguration.useragent(subjectConfig.getString("useragent"));
            }
        }
        if (subjectConfig.hasKey("ipAddress")) {
            if (subjectConfig.isNull("ipAddress")) {
                subjectConfiguration.ipAddress(null);
            }
            else {
                subjectConfiguration.ipAddress(subjectConfig.getString("ipAddress"));
            }
        }
        if (subjectConfig.hasKey("timezone")) {
            if (subjectConfig.isNull("timezone")) {
                subjectConfiguration.timezone(null);
            }
            else {
                subjectConfiguration.timezone(subjectConfig.getString("timezone"));
            }
        }
        if (subjectConfig.hasKey("language")) {
            if (subjectConfig.isNull("language")) {
                subjectConfiguration.language(null);
            }
            else {
                subjectConfiguration.language(subjectConfig.getString("language"));
            }
        }
        if (subjectConfig.hasKey("screenResolution")) {
            if (subjectConfig.isNull("screenResolution")) {
                subjectConfiguration.screenResolution(null);
            }
            else {
                ReadableArray screenRes = subjectConfig.getArray("screenResolution");
                int screenWidth = (int) screenRes.getDouble(0);
                int screenHeight = (int) screenRes.getDouble(1);

                Size screenResolution = new Size(screenWidth, screenHeight);
                subjectConfiguration.screenResolution(screenResolution);
            }
        }
        if (subjectConfig.hasKey("screenViewport")) {
            if (subjectConfig.isNull("screenViewport")) {
                subjectConfiguration.screenViewPort(null);
            }
            else {
                ReadableArray screenVP = subjectConfig.getArray("screenViewport");
                int screenVPWidth = (int) screenVP.getDouble(0);
                int screenVPHeight = (int) screenVP.getDouble(1);

                Size screenViewport = new Size(screenVPWidth, screenVPHeight);
                subjectConfiguration.screenViewPort(screenViewport);
            }
        }
        if (subjectConfig.hasKey("colorDepth")) {
            if (subjectConfig.isNull("colorDepth")) {
                subjectConfiguration.colorDepth(null);
            }
            else {
                int colorDepth = (int) subjectConfig.getDouble("colorDepth");
                subjectConfiguration.colorDepth(colorDepth);
            }
        }

        return subjectConfiguration;
    }

    public static GdprConfiguration mkGdprConfiguration(ReadableMap gdprConfig) {
        Basis basis = mkBasis(gdprConfig.getString("basisForProcessing"));
        String docId = gdprConfig.getString("documentId");
        String docVer = gdprConfig.getString("documentVersion");
        String docDesc = gdprConfig.getString("documentDescription");

        GdprConfiguration gdprConfiguration = new GdprConfiguration(basis,
                                                                    docId,
                                                                    docVer,
                                                                    docDesc);

        return gdprConfiguration;
    }

    public static GlobalContextsConfiguration mkGCConfiguration(ReadableArray gcConfig) {

        HashMap contextGens = new HashMap<>();
        for (int i = 0; i < gcConfig.size(); i++) {
            ReadableMap gcMap = gcConfig.getMap(i);

            String itag = gcMap.getString("tag");
            ReadableArray globalContexts = gcMap.getArray("globalContexts");

            List<SelfDescribingJson> staticContexts = new ArrayList<>();
            for (int x = 0; x < globalContexts.size(); x++) {
                SelfDescribingJson gContext = EventUtil.createSelfDescribingJson(globalContexts.getMap(x));
                staticContexts.add(gContext);
            }

            GlobalContext gcStatic = new GlobalContext(staticContexts);

            if (!contextGens.containsKey(itag)) {
                contextGens.put(itag, gcStatic);
            }
        }

        GlobalContextsConfiguration gcConfiguration = new GlobalContextsConfiguration(contextGens);

        return gcConfiguration;
    }
}
