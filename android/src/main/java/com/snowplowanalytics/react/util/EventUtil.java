package com.snowplowanalytics.react.util;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableArray;
import com.snowplowanalytics.snowplow.event.SelfDescribing;
import com.snowplowanalytics.snowplow.event.Structured;
import com.snowplowanalytics.snowplow.payload.SelfDescribingJson;
import com.snowplowanalytics.snowplow.event.ScreenView;
import com.snowplowanalytics.snowplow.event.PageView;
import com.snowplowanalytics.snowplow.event.Timing;
import com.snowplowanalytics.snowplow.event.ConsentGranted;
import com.snowplowanalytics.snowplow.event.ConsentWithdrawn;
import com.snowplowanalytics.snowplow.event.EcommerceTransactionItem;
import com.snowplowanalytics.snowplow.event.EcommerceTransaction;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class EventUtil {

    public static SelfDescribingJson createSelfDescribingJson(ReadableMap json) {
        String schema = json.getString("schema");
        ReadableMap dataMap = json.getMap("data");

        return new SelfDescribingJson(schema, dataMap.toHashMap());
    }

    public static List<SelfDescribingJson> createContexts(ReadableArray contexts) {
        List<SelfDescribingJson> nativeContexts = new ArrayList<>();
        for (int i = 0; i < contexts.size(); i++) {
            SelfDescribingJson json = createSelfDescribingJson(contexts.getMap(i));
            nativeContexts.add(json);
        }

        return nativeContexts;
    }

    public static Structured createStructuredEvent(ReadableMap argmap) {
        Structured.Builder eventBuilder = Structured.builder()
            .category(argmap.getString("category"))
            .action(argmap.getString("action"));

        if (argmap.hasKey("label")) {
            eventBuilder.label(argmap.getString("label"));
        }
        if (argmap.hasKey("property")) {
            eventBuilder.property(argmap.getString("property"));
        }
        // React Native forces primitive double type - so null "value" parameter is handled by not setting at all
        if (argmap.hasKey("value") && !argmap.isNull("value")) {
            eventBuilder.value(argmap.getDouble("value"));
        }

        return eventBuilder.build();
    }

    public static ScreenView createScreenViewEvent(ReadableMap argmap) {
        ScreenView.Builder eventBuilder = ScreenView.builder()
            .name(argmap.getString("name"));

        if (argmap.hasKey("id")) {
            UUID idUUID = UUID.fromString(argmap.getString("id"));
            eventBuilder.id(idUUID.toString());
        }
        if (argmap.hasKey("type")) {
            eventBuilder.type(argmap.getString("type"));
        }
        if (argmap.hasKey("previousName")) {
            eventBuilder.previousName(argmap.getString("previousName"));
        }
        if (argmap.hasKey("previousType")) {
            eventBuilder.previousType(argmap.getString("previousType"));
        }
        if (argmap.hasKey("previousId")) {
            eventBuilder.previousId(argmap.getString("previousId"));
        }
        if (argmap.hasKey("transitionType")) {
            eventBuilder.transitionType(argmap.getString("transitionType"));
        }

        return eventBuilder.build();
    }

    public static PageView createPageViewEvent(ReadableMap argmap) {
        PageView.Builder eventBuilder = PageView.builder()
            .pageUrl(argmap.getString("pageUrl"));

        if (argmap.hasKey("pageTitle")) {
            eventBuilder.pageTitle(argmap.getString("pageTitle"));
        }
        if (argmap.hasKey("referrer")) {
            eventBuilder.referrer(argmap.getString("referrer"));
        }

        return eventBuilder.build();
    }

    public static Timing createTimingEvent(ReadableMap argmap) {
        Timing.Builder eventBuilder = Timing.builder()
            .category(argmap.getString("category"))
            .variable(argmap.getString("variable"))
            .timing(argmap.getInt("timing"));

        if (argmap.hasKey("label")) {
            eventBuilder.label(argmap.getString("label"));
        }

        return eventBuilder.build();
    }

    public static ConsentGranted createConsentGrantedEvent(ReadableMap argmap) {
        ConsentGranted.Builder eventBuilder = ConsentGranted.builder()
            .expiry(argmap.getString("expiry"))
            .documentId(argmap.getString("documentId"))
            .documentVersion(argmap.getString("version"));

        if (argmap.hasKey("name")) {
            eventBuilder.documentName(argmap.getString("name"));
        }
        if (argmap.hasKey("documentDescription")) {
            eventBuilder.documentDescription(argmap.getString("documentDescription"));
        }

        return eventBuilder.build();
    }

    public static ConsentWithdrawn createConsentWithdrawnEvent(ReadableMap argmap) {
        ConsentWithdrawn.Builder eventBuilder = ConsentWithdrawn.builder()
            .all(argmap.getBoolean("all"))
            .documentId(argmap.getString("documentId"))
            .documentVersion(argmap.getString("version"));

        if (argmap.hasKey("name")) {
            eventBuilder.documentName(argmap.getString("name"));
        }
        if (argmap.hasKey("documentDescription")) {
            eventBuilder.documentDescription(argmap.getString("documentDescription"));
        }

        return eventBuilder.build();
    }

    public static List<EcommerceTransactionItem> createEcommerceTransactionItems(ReadableArray items) {
        List<EcommerceTransactionItem> ecomItems = new ArrayList<>();
        for (int i = 0; i < items.size(); i++) {
            ReadableMap argItem = items.getMap(i);
            EcommerceTransactionItem.Builder itemBuilder = EcommerceTransactionItem.builder()
                .sku(argItem.getString("sku"))
                .price(argItem.getDouble("price"))
                .quantity(argItem.getInt("quantity"));

            if (argItem.hasKey("name")) {
                itemBuilder.name(argItem.getString("name"));
            }
            if (argItem.hasKey("category")) {
                itemBuilder.category(argItem.getString("category"));
            }
            if (argItem.hasKey("currency")) {
                itemBuilder.currency(argItem.getString("currency"));
            }

            ecomItems.add(itemBuilder.build());
        }

        return ecomItems;
}

    public static EcommerceTransaction createEcommerceTransactionEvent(ReadableMap argmap) {
        List<EcommerceTransactionItem> ecomItems = createEcommerceTransactionItems(argmap.getArray("items"));

        EcommerceTransaction.Builder eventBuilder = EcommerceTransaction.builder()
            .orderId(argmap.getString("orderId"))
            .totalValue(argmap.getDouble("totalValue"))
            .items(ecomItems);

        if (argmap.hasKey("affiliation")) {
            eventBuilder.affiliation(argmap.getString("affiliation"));
        }
        if (argmap.hasKey("taxValue")) {
            eventBuilder.taxValue(argmap.getDouble("taxValue"));
        }
        if (argmap.hasKey("shipping")) {
            eventBuilder.shipping(argmap.getDouble("shipping"));
        }
        if (argmap.hasKey("city")) {
            eventBuilder.city(argmap.getString("city"));
        }
        if (argmap.hasKey("state")) {
            eventBuilder.state(argmap.getString("state"));
        }
        if (argmap.hasKey("country")) {
            eventBuilder.country(argmap.getString("country"));
        }
        if (argmap.hasKey("currency")) {
            eventBuilder.currency(argmap.getString("currency"));
        }

        return eventBuilder.build();
    }
}
