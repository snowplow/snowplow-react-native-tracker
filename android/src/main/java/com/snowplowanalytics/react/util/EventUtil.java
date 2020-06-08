package com.snowplowanalytics.react.util;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableArray;
import com.snowplowanalytics.snowplow.tracker.events.SelfDescribing;
import com.snowplowanalytics.snowplow.tracker.events.Structured;
import com.snowplowanalytics.snowplow.tracker.payload.SelfDescribingJson;
import com.snowplowanalytics.snowplow.tracker.events.ScreenView;
import com.snowplowanalytics.snowplow.tracker.events.PageView;

import java.util.ArrayList;
import java.util.List;

public class EventUtil {
    public static List<SelfDescribingJson> getContexts(ReadableArray contexts) {
        List<SelfDescribingJson> nativeContexts = new ArrayList<>();
        for (int i = 0; i < contexts.size(); i++) {
          SelfDescribingJson json = EventUtil.getSelfDescribingJson(contexts.getMap(i));
          nativeContexts.add(json);
        }
        return nativeContexts;
    }

    public static SelfDescribingJson getSelfDescribingJson(ReadableMap json) {
        String schema = json.getString("schema");
        ReadableMap dataMap = json.getMap("data");
        if (schema != null && dataMap != null) {
            return new SelfDescribingJson(schema, dataMap.toHashMap());
        } else {
            // log error
        }
        return null;
    }

    public static SelfDescribing getSelfDescribingEvent(ReadableMap event, ReadableArray contexts) {
        SelfDescribingJson data = EventUtil.getSelfDescribingJson(event);
        List<SelfDescribingJson> nativeContexts = EventUtil.getContexts(contexts);
        SelfDescribing.Builder eventBuilder = SelfDescribing.builder();
        if (data == null) return null;
        eventBuilder.eventData(data);
        if (nativeContexts != null) {
            eventBuilder.customContext(nativeContexts);
        }
        return eventBuilder.build();
    }

    public static Structured getStructuredEvent(ReadableMap details, ReadableArray contexts) {

        // build with required arguments
        Structured.Builder eventBuilder = Structured.builder()
            .category(details.getString("category"))
            .action(details.getString("action"));

        // add any optional arguments
        if (details.hasKey("label")) eventBuilder.label(details.getString("label"));
        if (details.hasKey("property")) eventBuilder.property(details.getString("property"));

        // React Native forces primitive double type - so null "value" parameter is handled by not setting at all
        if (details.hasKey("value") && !details.isNull("value")) eventBuilder.value(details.getDouble("value"));

        List<SelfDescribingJson> nativeContexts = EventUtil.getContexts(contexts);
        if (nativeContexts != null) {
            eventBuilder.customContext(nativeContexts);
        }
        return eventBuilder.build();
    }

    public static ScreenView getScreenViewEvent(ReadableMap details, ReadableArray contexts) {

        // build with required arguments
        ScreenView.Builder eventBuilder = ScreenView.builder()
                .name(details.getString("screenName"));

        // add any optional arguments
        if (details.hasKey("screenType")) eventBuilder.type(details.getString("screenType"));
        if (details.hasKey("transitionType")) eventBuilder.transitionType(details.getString("transitionType"));

        List<SelfDescribingJson> nativeContexts = EventUtil.getContexts(contexts);
        if (nativeContexts != null) {
            eventBuilder.customContext(nativeContexts);
        }
        return eventBuilder.build();
    }

    public static PageView getPageViewEvent(ReadableMap details, ReadableArray contexts) {

        // build with required arguments
        PageView.Builder eventBuilder = PageView.builder()
            .pageUrl(details.getString("pageUrl"));

        // add any optional arguments
        if (details.hasKey("pageTitle")) eventBuilder.pageTitle(details.getString("pageTitle"));
        if (details.hasKey("pageReferrer")) eventBuilder.referrer(details.getString("pageReferrer"));

        List<SelfDescribingJson> nativeContexts = EventUtil.getContexts(contexts);
        if (nativeContexts != null) {
            eventBuilder.customContext(nativeContexts);
        }
        return eventBuilder.build();
    }
}
