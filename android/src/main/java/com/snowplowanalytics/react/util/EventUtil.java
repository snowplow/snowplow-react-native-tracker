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

    public static Structured getStructuredEvent(String category, String action, String label,
            String property, Number value, ReadableArray contexts) {
        Structured.Builder eventBuilder = Structured.builder()
                .action(action)
                .category(category)
                .value(value.doubleValue())
                .property(property)
                .label(label);
        List<SelfDescribingJson> nativeContexts = EventUtil.getContexts(contexts);
        if (nativeContexts != null) {
            eventBuilder.customContext(nativeContexts);
        }
        return eventBuilder.build();
    }

    public static ScreenView getScreenViewEvent(String screenName, String screenId, String screenType,
            String previousScreenName, String previousScreenType, String previousScreenId,
            String transitionType, ReadableArray contexts) {
        ScreenView.Builder eventBuilder = ScreenView.builder()
                .name(screenName)
                .id(screenId)
                .type(screenType)
                .previousName(previousScreenName)
                .previousId(previousScreenId)
                .previousType(previousScreenType)
                .transitionType(transitionType);
        List<SelfDescribingJson> nativeContexts = EventUtil.getContexts(contexts);
        if (nativeContexts != null) {
            eventBuilder.customContext(nativeContexts);
        }
        return eventBuilder.build();
    }
    
    public static PageView getPageViewEvent(String pageUrl, String pageTitle, String referrer, ReadableArray contexts) {
        PageView.Builder eventBuilder = PageView.builder().pageUrl(pageUrl).pageTitle(pageTitle).referrer(referrer);
        List<SelfDescribingJson> nativeContexts = EventUtil.getContexts(contexts);
        if (nativeContexts != null) {
            eventBuilder.customContext(nativeContexts);
        }
        return eventBuilder.build();
    }
}
