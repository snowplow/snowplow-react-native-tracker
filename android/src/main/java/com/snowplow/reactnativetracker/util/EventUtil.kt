package com.snowplow.reactnativetracker.util

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.snowplowanalytics.snowplow.event.*
import com.snowplowanalytics.snowplow.payload.SelfDescribingJson
import java.util.*

object EventUtil {
  fun createSelfDescribingJson(json: ReadableMap): SelfDescribingJson {
    val schema: String = json.getString("schema")!!
    val dataMap: ReadableMap = json.getMap("data")!!
    return SelfDescribingJson(schema, dataMap.toHashMap())
  }

  fun createContexts(contexts: ReadableArray): List<SelfDescribingJson> {
    val nativeContexts: MutableList<SelfDescribingJson> = ArrayList()
    for (i in 0 until contexts.size()) {
      val json = createSelfDescribingJson(contexts.getMap(i))
      nativeContexts.add(json)
    }
    return nativeContexts
  }

  fun createStructuredEvent(argmap: ReadableMap): Structured {
    val event = Structured(
      argmap.getString("category")!!,
      argmap.getString("action")!!
    )
    argmap.getString("label")?.let { event.label(it) }
    argmap.getString("property")?.let { event.property(it) }
    // React Native forces primitive double type - so null "value" parameter is handled by not setting at all
    if (argmap.hasKey("value") && !argmap.isNull("value")) {
      event.value(argmap.getDouble("value"))
    }
    return event
  }

  fun createScreenViewEvent(argmap: ReadableMap): ScreenView {
    val name: String = argmap.getString("name")!!
    val event = if (argmap.hasKey("id")) ScreenView(
      name,
      UUID.fromString(argmap.getString("id"))
    ) else ScreenView(name)
    argmap.getString("type")?.let { event.type(it) }
    argmap.getString("previousName")?.let { event.previousName(it) }
    argmap.getString("previousType")?.let { event.previousType(it) }
    argmap.getString("previousId")?.let { event.previousId(it) }
    argmap.getString("transitionType")?.let { event.transitionType(it) }
    return event
  }

  fun createScrollChangedEvent(argmap: ReadableMap): ScrollChanged {
    val event = ScrollChanged(
      yOffset = if (argmap.hasKey("yOffset")) { argmap.getDouble("yOffset").toInt() } else { null },
      xOffset = if (argmap.hasKey("xOffset")) { argmap.getDouble("xOffset").toInt() } else { null },
      viewHeight = if (argmap.hasKey("viewHeight")) { argmap.getDouble("viewHeight").toInt() } else { null },
      viewWidth = if (argmap.hasKey("viewWidth")) { argmap.getDouble("viewWidth").toInt() } else { null },
      contentHeight = if (argmap.hasKey("contentHeight")) { argmap.getDouble("contentHeight").toInt() } else { null },
      contentWidth = if (argmap.hasKey("contentWidth")) { argmap.getDouble("contentWidth").toInt() } else { null },
    )
    return event
  }

  fun createListItemViewEvent(argmap: ReadableMap): ListItemView {
    val event = ListItemView(
      index = argmap.getDouble("index").toInt(),
      itemsCount = if (argmap.hasKey("itemsCount")) { argmap.getDouble("itemsCount").toInt() } else { null },
    )
    return event
  }

  fun createPageViewEvent(argmap: ReadableMap): PageView {
    val event = PageView(argmap.getString("pageUrl")!!)
    argmap.getString("pageTitle")?.let { event.pageTitle(it) }
    argmap.getString("referrer")?.let { event.referrer(it) }
    return event
  }

  fun createTimingEvent(argmap: ReadableMap): Timing {
    val event = Timing(
      argmap.getString("category")!!,
      argmap.getString("variable")!!,
      argmap.getDouble("timing").toInt()
    )
    argmap.getString("label")?.let { label ->
      event.label(label)
    }
    return event
  }

  fun createConsentGrantedEvent(argmap: ReadableMap): ConsentGranted {
    val event = ConsentGranted(
      argmap.getString("expiry")!!,
      argmap.getString("documentId")!!,
      argmap.getString("version")!!
    )
    argmap.getString("name")?.let { event.documentName(it) }
    argmap.getString("documentDescription")?.let { event.documentDescription(it) }
    return event
  }

  fun createConsentWithdrawnEvent(argmap: ReadableMap): ConsentWithdrawn {
    val event = ConsentWithdrawn(
      argmap.getBoolean("all"),
      argmap.getString("documentId")!!,
      argmap.getString("version")!!
    )
    argmap.getString("name")?.let { event.documentName(it) }
    argmap.getString("documentDescription")?.let { event.documentDescription(it) }
    return event
  }

  fun createEcommerceTransactionItems(items: ReadableArray): List<EcommerceTransactionItem> {
    val ecomItems: MutableList<EcommerceTransactionItem> = ArrayList()
    for (i in 0 until items.size()) {
      val argItem: ReadableMap = items.getMap(i)
      val item = EcommerceTransactionItem(
        argItem.getString("sku")!!,
        argItem.getDouble("price"),
        argItem.getDouble("quantity").toInt()
      )
      argItem.getString("name")?.let { item.name(it) }
      argItem.getString("category")?.let { item.category(it) }
      argItem.getString("currency")?.let { item.currency(it) }
      ecomItems.add(item)
    }
    return ecomItems
  }

  fun createEcommerceTransactionEvent(argmap: ReadableMap): EcommerceTransaction {
    val ecomItems = createEcommerceTransactionItems(
      argmap.getArray("items")!!
    )
    val event = EcommerceTransaction(
      argmap.getString("orderId")!!,
      argmap.getDouble("totalValue"),
      ecomItems
    )
    argmap.getString("affiliation")?.let { event.affiliation(it) }
    if (argmap.hasKey("taxValue")) {
      event.taxValue(argmap.getDouble("taxValue"))
    }
    if (argmap.hasKey("shipping")) {
      event.shipping(argmap.getDouble("shipping"))
    }
    argmap.getString("city")?.let { event.city(it) }
    argmap.getString("state")?.let { event.state(it) }
    argmap.getString("country")?.let { event.country(it) }
    argmap.getString("currency")?.let { event.currency(it) }
    return event
  }

  fun createDeepLinkReceivedEvent(argmap: ReadableMap): DeepLinkReceived {
    val event = DeepLinkReceived(
      argmap.getString("url")!!
    )
    argmap.getString("referrer")?.let { event.referrer(it) }
    return event
  }

  fun createMessageNotificationAttachments(items: ReadableArray): List<MessageNotificationAttachment> {
    val attachments: MutableList<MessageNotificationAttachment> = ArrayList()
    for (i in 0 until items.size()) {
      val argItem: ReadableMap = items.getMap(i)
      val attachment = MessageNotificationAttachment(
        argItem.getString("identifier")!!,
        argItem.getString("type")!!,
        argItem.getString("url")!!
      )
      attachments.add(attachment)
    }
    return attachments
  }

  fun createStrings(items: ReadableArray): List<String> {
    val results: MutableList<String> = ArrayList()
    for (i in 0 until items.size()) {
      results.add(items.getString(i))
    }
    return results
  }

  fun createMessageNotificationEvent(argmap: ReadableMap): MessageNotification {
    val trigger: MessageNotificationTrigger
    trigger =
      when (argmap.getString("trigger")!!) {
        "push" -> MessageNotificationTrigger.push
        "location" -> MessageNotificationTrigger.location
        "calendar" -> MessageNotificationTrigger.calendar
        "timeInterval" -> MessageNotificationTrigger.timeInterval
        else -> MessageNotificationTrigger.other
      }
    val event = MessageNotification(
      argmap.getString("title")!!,
      argmap.getString("body")!!,
      trigger
    )
    argmap.getString("action")?.let { event.action(it) }
    if (argmap.hasKey("attachments")) {
      argmap.getArray("attachments")?.let { attachments ->
        event.attachments(createMessageNotificationAttachments(attachments))
      }
    }
    if (argmap.hasKey("bodyLocArgs")) {
      argmap.getArray("bodyLocArgs")?.let { bodyLocArgs ->
        event.bodyLocArgs(createStrings(bodyLocArgs))
      }
    }
    argmap.getString("bodyLocKey")?.let { event.bodyLocKey(it) }
    argmap.getString("category")?.let { event.category(it) }
    if (argmap.hasKey("contentAvailable")) {
      event.contentAvailable(argmap.getBoolean("contentAvailable"))
    }
    argmap.getString("group")?.let { event.group(it) }
    argmap.getString("icon")?.let { event.icon(it) }
    if (argmap.hasKey("notificationCount")) {
      event.notificationCount(argmap.getDouble("notificationCount").toInt())
    }
    argmap.getString("notificationTimestamp")?.let { event.notificationTimestamp(it) }
    argmap.getString("sound")?.let { event.sound(it) }
    argmap.getString("subtitle")?.let { event.subtitle(it) }
    argmap.getString("tag")?.let { event.tag(it) }
    argmap.getString("threadIdentifier")?.let { event.threadIdentifier(it) }
    if (argmap.hasKey("titleLocArgs")) {
      argmap.getArray("titleLocArgs")?.let { titleLocArgs ->
        event.titleLocArgs(createStrings(titleLocArgs))
      }
    }
    argmap.getString("titleLocKey")?.let { event.titleLocKey(it) }
    return event
  }
}
