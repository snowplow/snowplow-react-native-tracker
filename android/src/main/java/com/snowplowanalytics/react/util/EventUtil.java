package com.snowplowanalytics.react.util;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableArray;
import com.snowplowanalytics.snowplow.event.DeepLinkReceived;
import com.snowplowanalytics.snowplow.event.MessageNotification;
import com.snowplowanalytics.snowplow.event.MessageNotificationAttachment;
import com.snowplowanalytics.snowplow.event.MessageNotificationTrigger;
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

    public static DeepLinkReceived createDeepLinkReceivedEvent(ReadableMap argmap) {
        DeepLinkReceived event = new DeepLinkReceived(
                Objects.requireNonNull(argmap.getString("url"), "url can't be null")
        );

        if (argmap.hasKey("referrer")) {
            event.referrer(argmap.getString("referrer"));
        }

        return event;
    }

    public static List<MessageNotificationAttachment> createMessageNotificationAttachments(ReadableArray items) {
        List<MessageNotificationAttachment> attachments = new ArrayList<>();
        for (int i = 0; i < items.size(); i++) {
            ReadableMap argItem = items.getMap(i);
            MessageNotificationAttachment attachment = new MessageNotificationAttachment(
                    Objects.requireNonNull(argItem.getString("identifier"), "identifier can't be null"),
                    Objects.requireNonNull(argItem.getString("type"), "type can't be null"),
                    Objects.requireNonNull(argItem.getString("url"), "url can't be null")
            );
            attachments.add(attachment);
        }

        return attachments;
    }

    public static List<String> createStrings(ReadableArray items) {
        List<String> results = new ArrayList<>();
        for (int i = 0; i < items.size(); i++) {
            results.add(items.getString(i));
        }
        return results;
    }

    public static MessageNotification createMessageNotificationEvent(ReadableMap argmap) {

        MessageNotificationTrigger trigger;
        switch (Objects.requireNonNull(argmap.getString("trigger"), "trigger can't be null")) {
            case "push":
                trigger = MessageNotificationTrigger.push;
                break;
            case "location":
                trigger = MessageNotificationTrigger.location;
                break;
            case "calendar":
                trigger = MessageNotificationTrigger.calendar;
                break;
            case "timeInterval":
                trigger = MessageNotificationTrigger.timeInterval;
                break;
            default:
                trigger = MessageNotificationTrigger.other;
                break;
        }

        MessageNotification event = new MessageNotification(
                Objects.requireNonNull(argmap.getString("title"), "title can't be null"),
                Objects.requireNonNull(argmap.getString("body"), "body can't be null"),
                trigger
        );

        if (argmap.hasKey("action")) {
            event.action(argmap.getString("action"));
        }
        if (argmap.hasKey("attachments")) {
            ReadableArray attachments = argmap.getArray("attachments");
            if (attachments != null) {
                event.attachments(createMessageNotificationAttachments(attachments));
            }
        }
        if (argmap.hasKey("bodyLocArgs")) {
            ReadableArray bodyLocArgs = argmap.getArray("bodyLocArgs");
            if (bodyLocArgs != null) {
                event.bodyLocArgs(createStrings(bodyLocArgs));
            }
        }
        if (argmap.hasKey("bodyLocKey")) {
            event.bodyLocKey(argmap.getString("bodyLocKey"));
        }
        if (argmap.hasKey("category")) {
            event.category(argmap.getString("category"));
        }
        if (argmap.hasKey("contentAvailable")) {
            event.contentAvailable(argmap.getBoolean("contentAvailable"));
        }
        if (argmap.hasKey("group")) {
            event.group(argmap.getString("group"));
        }
        if (argmap.hasKey("icon")) {
            event.icon(argmap.getString("icon"));
        }
        if (argmap.hasKey("notificationCount")) {
            event.notificationCount(argmap.getInt("notificationCount"));
        }
        if (argmap.hasKey("notificationTimestamp")) {
            event.notificationTimestamp(argmap.getString("notificationTimestamp"));
        }
        if (argmap.hasKey("sound")) {
            event.sound(argmap.getString("sound"));
        }
        if (argmap.hasKey("subtitle")) {
            event.subtitle(argmap.getString("subtitle"));
        }
        if (argmap.hasKey("tag")) {
            event.tag(argmap.getString("tag"));
        }
        if (argmap.hasKey("threadIdentifier")) {
            event.threadIdentifier(argmap.getString("threadIdentifier"));
        }
        if (argmap.hasKey("titleLocArgs")) {
            ReadableArray titleLocArgs = argmap.getArray("titleLocArgs");
            if (titleLocArgs != null) {
                event.titleLocArgs(createStrings(titleLocArgs));
            }
        }
        if (argmap.hasKey("titleLocKey")) {
            event.titleLocKey(argmap.getString("titleLocKey"));
        }

        return event;
    }
}
