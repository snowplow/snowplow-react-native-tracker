package com.snowplow.reactnativetracker

import com.facebook.react.bridge.*
import com.snowplow.reactnativetracker.util.ConfigUtil
import com.snowplow.reactnativetracker.util.EventUtil
import com.snowplowanalytics.snowplow.Snowplow
import com.snowplowanalytics.snowplow.Snowplow.defaultTracker
import com.snowplowanalytics.snowplow.Snowplow.removeAllTrackers
import com.snowplowanalytics.snowplow.Snowplow.removeTracker
import com.snowplowanalytics.snowplow.configuration.*
import com.snowplowanalytics.snowplow.controller.TrackerController
import com.snowplowanalytics.snowplow.event.*
import com.snowplowanalytics.snowplow.globalcontexts.GlobalContext
import com.snowplowanalytics.snowplow.network.CollectorCookieJar
import com.snowplowanalytics.snowplow.network.HttpMethod
import com.snowplowanalytics.snowplow.payload.SelfDescribingJson
import com.snowplowanalytics.snowplow.util.Size
import com.snowplowanalytics.snowplow.configuration.Configuration
import com.snowplowanalytics.snowplow.configuration.EmitterConfiguration
import com.snowplowanalytics.snowplow.configuration.GdprConfiguration
import com.snowplowanalytics.snowplow.configuration.NetworkConfiguration
import com.snowplowanalytics.snowplow.configuration.SessionConfiguration
import com.snowplowanalytics.snowplow.configuration.TrackerConfiguration
import com.snowplowanalytics.snowplow.configuration.SubjectConfiguration
import com.snowplowanalytics.snowplow.configuration.GlobalContextsConfiguration
import com.snowplowanalytics.snowplow.event.DeepLinkReceived
import com.snowplowanalytics.snowplow.event.MessageNotification
import com.snowplowanalytics.snowplow.event.SelfDescribing
import com.snowplowanalytics.snowplow.event.ScreenView
import com.snowplowanalytics.snowplow.event.Structured
import com.snowplowanalytics.snowplow.event.PageView
import com.snowplowanalytics.snowplow.event.Timing
import com.snowplowanalytics.snowplow.event.ConsentGranted
import com.snowplowanalytics.snowplow.event.ConsentWithdrawn
import com.snowplowanalytics.snowplow.event.EcommerceTransaction
import java.util.concurrent.TimeUnit

import okhttp3.OkHttpClient
import okhttp3.Request

class ReactNativeTrackerModule(val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
  fun createTracker(
    argmap: ReadableMap,
    promise: Promise
  ) {
    try {
      val trackerNs = argmap.getString("namespace")!!
      val networkConfig = argmap.getMap("networkConfig")!!

      // NetworkConfiguration
      val endpoint = networkConfig.getString("endpoint")!!
      val networkConfiguration = networkConfig.getString("method")?.let { method ->
        NetworkConfiguration(
          endpoint,
          if ("get".equals(method, ignoreCase = true)) HttpMethod.GET else HttpMethod.POST
        )
      } ?: NetworkConfiguration(endpoint)
      networkConfig.getString("customPostPath")?.let { customPostPath ->
        networkConfiguration.customPostPath = customPostPath
      }
      if (networkConfig.hasKey("requestHeaders") && !networkConfig.isNull("requestHeaders")) {
        networkConfig.getMap("requestHeaders")?.let { requestHeaders ->
          val client: OkHttpClient = OkHttpClient.Builder()
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(15, TimeUnit.SECONDS)
            .cookieJar(CollectorCookieJar(reactContext))
            .addInterceptor { chain ->
              val requestBuilder: Request.Builder = chain.request().newBuilder()
              val it: ReadableMapKeySetIterator = requestHeaders.keySetIterator()
              while (it.hasNextKey()) {
                val key = it.nextKey()
                val value = requestHeaders.getString(key)
                if (value != null) {
                  requestBuilder.header(key, value)
                }
              }
              chain.proceed(requestBuilder.build())
            }.build()
          networkConfiguration.okHttpClient(client)
        }
      }

      // Configurations
      val controllers: MutableList<Configuration> = ArrayList()

      // TrackerConfiguration
      val trackerConfiguration = ConfigUtil.mkTrackerConfiguration(argmap.getMap("trackerConfig"), this.reactContext)
      controllers.add(trackerConfiguration)

      // SessionConfiguration
      argmap.getMap("sessionConfig")?.let { sessionConfig ->
        val sessionConfiguration: SessionConfiguration =
          ConfigUtil.mkSessionConfiguration(sessionConfig)
        controllers.add(sessionConfiguration)
      }

      // EmitterConfiguration
      argmap.getMap("emitterConfig")?.let { emitterConfig ->
        val emitterConfiguration: EmitterConfiguration =
          ConfigUtil.mkEmitterConfiguration(emitterConfig)
        controllers.add(emitterConfiguration)
      }

      // SubjectConfiguration
      argmap.getMap("subjectConfig")?.let { subjectConfig ->
        val subjectConfiguration: SubjectConfiguration =
          ConfigUtil.mkSubjectConfiguration(subjectConfig)
        controllers.add(subjectConfiguration)
      }

      // GdprConfiguration
      argmap.getMap("gdprConfig")?.let { gdprConfig ->
        val gdprConfiguration: GdprConfiguration = ConfigUtil.mkGdprConfiguration(gdprConfig)
        controllers.add(gdprConfiguration)
      }

      // GCConfiguration
      argmap.getArray("gcConfig")?.let { gcConfig ->
        val gcConfiguration: GlobalContextsConfiguration = ConfigUtil.mkGCConfiguration(gcConfig)
        controllers.add(gcConfiguration)
      }

      // create the tracker
      Snowplow.createTracker(
        this.reactContext,
        trackerNs,
        networkConfiguration,
        *controllers.toTypedArray()
      )
      promise.resolve(true)
    } catch (t: Throwable) {
      promise.reject("ERROR", t.message)
    }
  }

  @ReactMethod
  fun removeTracker(
    details: ReadableMap,
    promise: Promise
  ) {
    try {
      val namespace = details.getString("tracker")
      val trackerController = getTracker(namespace)
      promise.resolve(removeTracker(trackerController))
    } catch (t: Throwable) {
      promise.reject("ERROR", t.message)
    }
  }

  @ReactMethod
  fun removeAllTrackers(promise: Promise) {
    try {
      removeAllTrackers()
      promise.resolve(true)
    } catch (t: Throwable) {
      promise.reject("ERROR", t.message)
    }
  }

  @ReactMethod
  fun trackSelfDescribingEvent(
    details: ReadableMap,
    promise: Promise
  ) {
    try {
      val namespace = details.getString("tracker")
      val argmap = details.getMap("eventData")!!
      val contexts = details.getArray("contexts")!!
      val trackerController = getTracker(namespace)
      val sdj: SelfDescribingJson = EventUtil.createSelfDescribingJson(argmap)
      val event = SelfDescribing(sdj)
      val evCtxts: List<SelfDescribingJson> = EventUtil.createContexts(contexts)
      event.entities.addAll(evCtxts)
      trackerController.track(event)
      promise.resolve(true)
    } catch (t: Throwable) {
      promise.reject("ERROR", t.message)
    }
  }

  @ReactMethod
  fun trackStructuredEvent(
    details: ReadableMap,
    promise: Promise
  ) {
    try {
      val namespace = details.getString("tracker")
      val argmap = details.getMap("eventData")!!
      val contexts: ReadableArray = details.getArray("contexts")!!
      val trackerController = getTracker(namespace)
      val event: Structured = EventUtil.createStructuredEvent(argmap)
      val evCtxts: List<SelfDescribingJson> = EventUtil.createContexts(contexts)
      event.entities.addAll(evCtxts)
      trackerController.track(event)
      promise.resolve(true)
    } catch (t: Throwable) {
      promise.reject("ERROR", t.message)
    }
  }

  @ReactMethod
  fun trackScreenViewEvent(
    details: ReadableMap,
    promise: Promise
  ) {
    try {
      val namespace = details.getString("tracker")
      val argmap = details.getMap("eventData")!!
      val contexts = details.getArray("contexts")!!
      val trackerController = getTracker(namespace)
      val event: ScreenView = EventUtil.createScreenViewEvent(argmap)
      val evCtxts: List<SelfDescribingJson> = EventUtil.createContexts(contexts)
      event.entities.addAll(evCtxts)
      trackerController.track(event)
      promise.resolve(true)
    } catch (t: Throwable) {
      promise.reject("ERROR", t.message)
    }
  }

  @ReactMethod
  fun trackScrollChangedEvent(
    details: ReadableMap,
    promise: Promise
  ) {
    try {
      val namespace = details.getString("tracker")
      val argmap = details.getMap("eventData")!!
      val contexts = details.getArray("contexts")!!
      val trackerController = getTracker(namespace)
      val event: ScrollChanged = EventUtil.createScrollChangedEvent(argmap)
      val evCtxts: List<SelfDescribingJson> = EventUtil.createContexts(contexts)
      event.entities.addAll(evCtxts)
      trackerController.track(event)
      promise.resolve(true)
    } catch (t: Throwable) {
      promise.reject("ERROR", t.message)
    }
  }

  @ReactMethod
  fun trackListItemViewEvent(
    details: ReadableMap,
    promise: Promise
  ) {
    try {
      val namespace = details.getString("tracker")
      val argmap = details.getMap("eventData")!!
      val contexts = details.getArray("contexts")!!
      val trackerController = getTracker(namespace)
      val event: ListItemView = EventUtil.createListItemViewEvent(argmap)
      val evCtxts: List<SelfDescribingJson> = EventUtil.createContexts(contexts)
      event.entities.addAll(evCtxts)
      trackerController.track(event)
      promise.resolve(true)
    } catch (t: Throwable) {
      promise.reject("ERROR", t.message)
    }
  }

  @ReactMethod
  fun trackPageViewEvent(
    details: ReadableMap,
    promise: Promise
  ) {
    try {
      val namespace = details.getString("tracker")
      val argmap = details.getMap("eventData")!!
      val contexts = details.getArray("contexts")!!
      val trackerController = getTracker(namespace)
      val event: PageView = EventUtil.createPageViewEvent(argmap)
      val evCtxts: List<SelfDescribingJson> = EventUtil.createContexts(contexts)
      event.entities.addAll(evCtxts)
      trackerController.track(event)
      promise.resolve(true)
    } catch (t: Throwable) {
      promise.reject("ERROR", t.message)
    }
  }

  @ReactMethod
  fun trackTimingEvent(
    details: ReadableMap,
    promise: Promise
  ) {
    try {
      val namespace = details.getString("tracker")
      val argmap = details.getMap("eventData")!!
      val contexts = details.getArray("contexts")!!
      val trackerController = getTracker(namespace)
      val event: Timing = EventUtil.createTimingEvent(argmap)
      val evCtxts: List<SelfDescribingJson> = EventUtil.createContexts(contexts)
      event.entities.addAll(evCtxts)
      trackerController.track(event)
      promise.resolve(true)
    } catch (t: Throwable) {
      promise.reject("ERROR", t.message)
    }
  }

  @ReactMethod
  fun trackConsentGrantedEvent(
    details: ReadableMap,
    promise: Promise
  ) {
    try {
      val namespace = details.getString("tracker")
      val argmap = details.getMap("eventData")!!
      val contexts = details.getArray("contexts")!!
      val trackerController = getTracker(namespace)
      val event: ConsentGranted = EventUtil.createConsentGrantedEvent(argmap)
      val evCtxts: List<SelfDescribingJson> = EventUtil.createContexts(contexts)
      event.entities.addAll(evCtxts)
      trackerController.track(event)
      promise.resolve(true)
    } catch (t: Throwable) {
      promise.reject("ERROR", t.message)
    }
  }

  @ReactMethod
  fun trackConsentWithdrawnEvent(
    details: ReadableMap,
    promise: Promise
  ) {
    try {
      val namespace = details.getString("tracker")
      val argmap = details.getMap("eventData")!!
      val contexts = details.getArray("contexts")!!
      val trackerController = getTracker(namespace)
      val event: ConsentWithdrawn = EventUtil.createConsentWithdrawnEvent(argmap)
      val evCtxts: List<SelfDescribingJson> = EventUtil.createContexts(contexts)
      event.entities.addAll(evCtxts)
      trackerController.track(event)
      promise.resolve(true)
    } catch (t: Throwable) {
      promise.reject("ERROR", t.message)
    }
  }

  @ReactMethod
  fun trackEcommerceTransactionEvent(
    details: ReadableMap,
    promise: Promise
  ) {
    try {
      val namespace = details.getString("tracker")
      val argmap = details.getMap("eventData")!!
      val contexts = details.getArray("contexts")!!
      val trackerController = getTracker(namespace)
      val event: EcommerceTransaction = EventUtil.createEcommerceTransactionEvent(argmap)
      val evCtxts: List<SelfDescribingJson> = EventUtil.createContexts(contexts)
      event.entities.addAll(evCtxts)
      trackerController.track(event)
      promise.resolve(true)
    } catch (t: Throwable) {
      promise.reject("ERROR", t.message)
    }
  }

  @ReactMethod
  fun trackDeepLinkReceivedEvent(
    details: ReadableMap,
    promise: Promise
  ) {
    try {
      val namespace = details.getString("tracker")
      val argmap = details.getMap("eventData")!!
      val contexts = details.getArray("contexts")!!
      val trackerController = getTracker(namespace)
      val event: DeepLinkReceived = EventUtil.createDeepLinkReceivedEvent(argmap)
      val evCtxts: List<SelfDescribingJson> = EventUtil.createContexts(contexts)
      event.entities.addAll(evCtxts)
      trackerController.track(event)
      promise.resolve(true)
    } catch (t: Throwable) {
      promise.reject("ERROR", t.message)
    }
  }

  @ReactMethod
  fun trackMessageNotificationEvent(
    details: ReadableMap,
    promise: Promise
  ) {
    try {
      val namespace = details.getString("tracker")
      val argmap = details.getMap("eventData")!!
      val contexts = details.getArray("contexts")!!
      val trackerController = getTracker(namespace)
      val event: MessageNotification = EventUtil.createMessageNotificationEvent(argmap)
      val evCtxts: List<SelfDescribingJson> = EventUtil.createContexts(contexts)
      event.entities.addAll(evCtxts)
      trackerController.track(event)
      promise.resolve(true)
    } catch (t: Throwable) {
      promise.reject("ERROR", t.message)
    }
  }

  @ReactMethod
  fun removeGlobalContexts(
    details: ReadableMap,
    promise: Promise
  ) {
    try {
      val namespace = details.getString("tracker")
      val tag = details.getString("removeTag")!!
      val trackerController = getTracker(namespace)
      trackerController.globalContexts.remove(tag)
      promise.resolve(true)
    } catch (t: Throwable) {
      promise.reject("ERROR", t.message)
    }
  }

  @ReactMethod
  fun addGlobalContexts(
    details: ReadableMap,
    promise: Promise
  ) {
    try {
      val namespace = details.getString("tracker")
      val gcArg = details.getMap("addGlobalContext")!!
      val tag = gcArg.getString("tag")!!
      val globalContexts = gcArg.getArray("globalContexts")!!
      val staticContexts: MutableList<SelfDescribingJson> = ArrayList()
      for (i in 0 until globalContexts.size()) {
        val gContext: SelfDescribingJson =
          EventUtil.createSelfDescribingJson(globalContexts.getMap(i))
        staticContexts.add(gContext)
      }
      val gcStatic = GlobalContext(staticContexts)
      val trackerController = getTracker(namespace)
      trackerController.globalContexts.add(tag, gcStatic)
      promise.resolve(true)
    } catch (t: Throwable) {
      promise.reject("ERROR", t.message)
    }
  }

  @ReactMethod
  fun setUserId(
    details: ReadableMap,
    promise: Promise
  ) {
    try {
      val namespace = details.getString("tracker")
      val trackerController = getTracker(namespace)
      if (details.isNull("userId")) {
        trackerController.subject.userId = null
      } else {
        trackerController.subject.userId = details.getString("userId")
      }
      promise.resolve(true)
    } catch (t: Throwable) {
      promise.reject("ERROR", t.message)
    }
  }

  @ReactMethod
  fun setNetworkUserId(
    details: ReadableMap,
    promise: Promise
  ) {
    try {
      val namespace = details.getString("tracker")
      val trackerController = getTracker(namespace)
      if (details.isNull("networkUserId")) {
        trackerController.subject.networkUserId = null
      } else {
        trackerController.subject.networkUserId = details.getString("networkUserId")
      }
      promise.resolve(true)
    } catch (t: Throwable) {
      promise.reject("ERROR", t.message)
    }
  }

  @ReactMethod
  fun setDomainUserId(
    details: ReadableMap,
    promise: Promise
  ) {
    try {
      val namespace = details.getString("tracker")
      val trackerController = getTracker(namespace)
      if (details.isNull("domainUserId")) {
        trackerController.subject.domainUserId = null
      } else {
        trackerController.subject.domainUserId = details.getString("domainUserId")
      }
      promise.resolve(true)
    } catch (t: Throwable) {
      promise.reject("ERROR", t.message)
    }
  }

  @ReactMethod
  fun setIpAddress(
    details: ReadableMap,
    promise: Promise
  ) {
    try {
      val namespace = details.getString("tracker")
      val trackerController = getTracker(namespace)
      if (details.isNull("ipAddress")) {
        trackerController.subject.ipAddress = null
      } else {
        trackerController.subject.ipAddress = details.getString("ipAddress")
      }
      promise.resolve(true)
    } catch (t: Throwable) {
      promise.reject("ERROR", t.message)
    }
  }

  @ReactMethod
  fun setUseragent(
    details: ReadableMap,
    promise: Promise
  ) {
    try {
      val namespace = details.getString("tracker")
      val trackerController = getTracker(namespace)
      if (details.isNull("useragent")) {
        trackerController.subject.useragent = null
      } else {
        trackerController.subject.useragent = details.getString("useragent")
      }
      promise.resolve(true)
    } catch (t: Throwable) {
      promise.reject("ERROR", t.message)
    }
  }

  @ReactMethod
  fun setTimezone(
    details: ReadableMap,
    promise: Promise
  ) {
    try {
      val namespace = details.getString("tracker")
      val trackerController = getTracker(namespace)
      if (details.isNull("timezone")) {
        trackerController.subject.timezone = null
      } else {
        trackerController.subject.timezone = details.getString("timezone")
      }
      promise.resolve(true)
    } catch (t: Throwable) {
      promise.reject("ERROR", t.message)
    }
  }

  @ReactMethod
  fun setLanguage(
    details: ReadableMap,
    promise: Promise
  ) {
    try {
      val namespace = details.getString("tracker")
      val trackerController = getTracker(namespace)
      if (details.isNull("language")) {
        trackerController.subject.language = null
      } else {
        trackerController.subject.language = details.getString("language")
      }
      promise.resolve(true)
    } catch (t: Throwable) {
      promise.reject("ERROR", t.message)
    }
  }

  @ReactMethod
  fun setScreenResolution(
    details: ReadableMap,
    promise: Promise
  ) {
    try {
      val namespace = details.getString("tracker")
      val trackerController = getTracker(namespace)
      if (details.isNull("screenResolution")) {
        trackerController.subject.screenResolution = null
      } else {
        val screenRes = details.getArray("screenResolution")!!
        val width: Int = screenRes.getDouble(0).toInt()
        val height: Int = screenRes.getDouble(1).toInt()
        val screenR = Size(width, height)
        trackerController.subject.screenResolution = screenR
      }
      promise.resolve(true)
    } catch (t: Throwable) {
      promise.reject("ERROR", t.message)
    }
  }

  @ReactMethod
  fun setScreenViewport(
    details: ReadableMap,
    promise: Promise
  ) {
    try {
      val namespace = details.getString("tracker")
      val trackerController = getTracker(namespace)
      if (details.isNull("screenViewport")) {
        trackerController.subject.screenViewPort = null
      } else {
        val screenView = details.getArray("screenViewport")!!
        val width: Int = screenView.getDouble(0).toInt()
        val height: Int = screenView.getDouble(1).toInt()
        val screenVP = Size(width, height)
        trackerController.subject.screenViewPort = screenVP
      }
      promise.resolve(true)
    } catch (t: Throwable) {
      promise.reject("ERROR", t.message)
    }
  }

  @ReactMethod
  fun setColorDepth(
    details: ReadableMap,
    promise: Promise
  ) {
    try {
      val namespace = details.getString("tracker")
      val trackerController = getTracker(namespace)
      if (details.isNull("colorDepth")) {
        trackerController.subject.colorDepth = null
      } else {
        trackerController.subject.colorDepth = details.getDouble("colorDepth").toInt()
      }
      promise.resolve(true)
    } catch (t: Throwable) {
      promise.reject("ERROR", t.message)
    }
  }

  @ReactMethod
  fun getSessionUserId(
    details: ReadableMap,
    promise: Promise
  ) {
    try {
      val namespace = details.getString("tracker")
      val trackerController = getTracker(namespace)
      val suid = trackerController.session!!.userId
      promise.resolve(suid)
    } catch (t: Throwable) {
      promise.reject("ERROR", t.message)
    }
  }

  @ReactMethod
  fun getSessionId(
    details: ReadableMap,
    promise: Promise
  ) {
    try {
      val namespace = details.getString("tracker")
      val trackerController = getTracker(namespace)
      val sid = trackerController.session!!.sessionId
      promise.resolve(sid)
    } catch (t: Throwable) {
      promise.reject("ERROR", t.message)
    }
  }

  @ReactMethod
  fun getSessionIndex(
    details: ReadableMap,
    promise: Promise
  ) {
    try {
      val namespace = details.getString("tracker")
      val trackerController = getTracker(namespace)
      val sidx = trackerController.session!!.sessionIndex!!
      promise.resolve(sidx)
    } catch (t: Throwable) {
      promise.reject("ERROR", t.message)
    }
  }

  @ReactMethod
  fun getIsInBackground(
    details: ReadableMap,
    promise: Promise
  ) {
    try {
      val namespace = details.getString("tracker")
      val trackerController = getTracker(namespace)
      val isInBg = trackerController.session!!.isInBackground
      promise.resolve(isInBg)
    } catch (t: Throwable) {
      promise.reject("ERROR", t.message)
    }
  }

  @ReactMethod
  fun getBackgroundIndex(
    details: ReadableMap,
    promise: Promise
  ) {
    try {
      val namespace = details.getString("tracker")
      val trackerController = getTracker(namespace)
      val bgIdx = trackerController.session!!.backgroundIndex
      promise.resolve(bgIdx)
    } catch (t: Throwable) {
      promise.reject("ERROR", t.message)
    }
  }

  @ReactMethod
  fun getForegroundIndex(
    details: ReadableMap,
    promise: Promise
  ) {
    try {
      val namespace = details.getString("tracker")
      val trackerController = getTracker(namespace)
      val fgIdx = trackerController.session!!.foregroundIndex
      promise.resolve(fgIdx)
    } catch (t: Throwable) {
      promise.reject("ERROR", t.message)
    }
  }

  private fun getTracker(namespace: String?): TrackerController {
    return namespace?.let { Snowplow.getTracker(it) } ?: defaultTracker!!
  }

  companion object {
    const val NAME = "ReactNativeTracker"
  }
}
