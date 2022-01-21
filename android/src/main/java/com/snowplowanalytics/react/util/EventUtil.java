package com.snowplowanalytics.react.util;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableArray;
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
import java.util.Objects;
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
        Structured event = new Structured(
                Objects.requireNonNull(argmap.getString("category"), "category can't be null"),
                Objects.requireNonNull(argmap.getString("action"), "action can't be null")
        );

        if (argmap.hasKey("label")) {
            event.label(argmap.getString("label"));
        }
        if (argmap.hasKey("property")) {
            event.property(argmap.getString("property"));
        }
        // React Native forces primitive double type - so null "value" parameter is handled by not setting at all
        if (argmap.hasKey("value") && !argmap.isNull("value")) {
            event.value(argmap.getDouble("value"));
        }

        return event;
    }

    public static ScreenView createScreenViewEvent(ReadableMap argmap) {
        @NonNull String name = Objects.requireNonNull(argmap.getString("name"), "name can't be null");
        ScreenView event = (
                argmap.hasKey("id") ?
                        new ScreenView(name, UUID.fromString(argmap.getString("id"))) :
                        new ScreenView(name)
        );

        if (argmap.hasKey("type")) {
            event.type(argmap.getString("type"));
        }
        if (argmap.hasKey("previousName")) {
            event.previousName(argmap.getString("previousName"));
        }
        if (argmap.hasKey("previousType")) {
            event.previousType(argmap.getString("previousType"));
        }
        if (argmap.hasKey("previousId")) {
            event.previousId(argmap.getString("previousId"));
        }
        if (argmap.hasKey("transitionType")) {
            event.transitionType(argmap.getString("transitionType"));
        }

        return event;
    }

    public static PageView createPageViewEvent(ReadableMap argmap) {
        PageView event = new PageView(
                Objects.requireNonNull(argmap.getString("pageUrl"), "pageUrl can't be null")
        );

        if (argmap.hasKey("pageTitle")) {
            event.pageTitle(argmap.getString("pageTitle"));
        }
        if (argmap.hasKey("referrer")) {
            event.referrer(argmap.getString("referrer"));
        }

        return event;
    }

    public static Timing createTimingEvent(ReadableMap argmap) {
        Timing event = new Timing(
                Objects.requireNonNull(argmap.getString("category"), "category can't be null"),
                Objects.requireNonNull(argmap.getString("variable"), "variable can't be null"),
                argmap.getInt("timing")
        );

        if (argmap.hasKey("label")) {
            event.label(argmap.getString("label"));
        }

        return event;
    }

    public static ConsentGranted createConsentGrantedEvent(ReadableMap argmap) {
        ConsentGranted event = new ConsentGranted(
                Objects.requireNonNull(argmap.getString("expiry"), "expiry can't be null"),
                Objects.requireNonNull(argmap.getString("documentId"), "documentId can't be null"),
                Objects.requireNonNull(argmap.getString("version"), "version can't be null")
        );

        if (argmap.hasKey("name")) {
            event.documentName(argmap.getString("name"));
        }
        if (argmap.hasKey("documentDescription")) {
            event.documentDescription(argmap.getString("documentDescription"));
        }

        return event;
    }

    public static ConsentWithdrawn createConsentWithdrawnEvent(ReadableMap argmap) {
        ConsentWithdrawn event = new ConsentWithdrawn(
                argmap.getBoolean("all"),
                Objects.requireNonNull(argmap.getString("documentId"), "documentId can't be null"),
                Objects.requireNonNull(argmap.getString("version"), "version can't be null")
        );

        if (argmap.hasKey("name")) {
            event.documentName(argmap.getString("name"));
        }
        if (argmap.hasKey("documentDescription")) {
            event.documentDescription(argmap.getString("documentDescription"));
        }

        return event;
    }

    public static List<EcommerceTransactionItem> createEcommerceTransactionItems(ReadableArray items) {
        List<EcommerceTransactionItem> ecomItems = new ArrayList<>();
        for (int i = 0; i < items.size(); i++) {
            ReadableMap argItem = items.getMap(i);
            EcommerceTransactionItem item = new EcommerceTransactionItem(
                    Objects.requireNonNull(argItem.getString("sku"), "sku can't be null"),
                    argItem.getDouble("price"),
                    argItem.getInt("quantity")
            );

            if (argItem.hasKey("name")) {
                item.name(argItem.getString("name"));
            }
            if (argItem.hasKey("category")) {
                item.category(argItem.getString("category"));
            }
            if (argItem.hasKey("currency")) {
                item.currency(argItem.getString("currency"));
            }

            ecomItems.add(item);
        }

        return ecomItems;
    }

    public static EcommerceTransaction createEcommerceTransactionEvent(ReadableMap argmap) {
        List<EcommerceTransactionItem> ecomItems = createEcommerceTransactionItems(
                Objects.requireNonNull(argmap.getArray("items"), "items can't be null")
        );

        EcommerceTransaction event = new EcommerceTransaction(
                Objects.requireNonNull(argmap.getString("orderId"), "orderId can't be null"),
                argmap.getDouble("totalValue"),
                ecomItems
        );

        if (argmap.hasKey("affiliation")) {
            event.affiliation(argmap.getString("affiliation"));
        }
        if (argmap.hasKey("taxValue")) {
            event.taxValue(argmap.getDouble("taxValue"));
        }
        if (argmap.hasKey("shipping")) {
            event.shipping(argmap.getDouble("shipping"));
        }
        if (argmap.hasKey("city")) {
            event.city(argmap.getString("city"));
        }
        if (argmap.hasKey("state")) {
            event.state(argmap.getString("state"));
        }
        if (argmap.hasKey("country")) {
            event.country(argmap.getString("country"));
        }
        if (argmap.hasKey("currency")) {
            event.currency(argmap.getString("currency"));
        }

        return event;
    }
}
