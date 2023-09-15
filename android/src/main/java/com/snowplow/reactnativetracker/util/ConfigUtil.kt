package com.snowplow.reactnativetracker.util

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.snowplowanalytics.snowplow.configuration.*
import com.snowplowanalytics.snowplow.emitter.BufferOption
import com.snowplowanalytics.snowplow.globalcontexts.GlobalContext
import com.snowplowanalytics.snowplow.payload.SelfDescribingJson
import com.snowplowanalytics.snowplow.tracker.DevicePlatform
import com.snowplowanalytics.snowplow.tracker.LogLevel
import com.snowplowanalytics.snowplow.util.Basis
import com.snowplowanalytics.snowplow.util.Size
import com.snowplowanalytics.snowplow.util.TimeMeasure
import java.util.concurrent.TimeUnit

object ConfigUtil {
  fun mkDevicePlatform(devPlatform: String): DevicePlatform {
    var devicePlatform = DevicePlatform.Mobile
    if (devPlatform == "web") {
      devicePlatform = DevicePlatform.Web
    } else if (devPlatform == "srv") {
      devicePlatform = DevicePlatform.ServerSideApp
    } else if (devPlatform == "pc") {
      devicePlatform = DevicePlatform.Desktop
    } else if (devPlatform == "app") {
      devicePlatform = DevicePlatform.General
    } else if (devPlatform == "tv") {
      devicePlatform = DevicePlatform.ConnectedTV
    } else if (devPlatform == "cnsl") {
      devicePlatform = DevicePlatform.GameConsole
    } else if (devPlatform == "iot") {
      devicePlatform = DevicePlatform.InternetOfThings
    }
    return devicePlatform
  }

  fun mkLogLevel(logLvl: String): LogLevel {
    var logLevel = LogLevel.OFF
    if (logLvl == "error") {
      logLevel = LogLevel.ERROR
    } else if (logLvl == "debug") {
      logLevel = LogLevel.DEBUG
    } else if (logLvl == "verbose") {
      logLevel = LogLevel.VERBOSE
    }
    return logLevel
  }

  fun mkBufferOption(bufferOpt: String): BufferOption {
    var bufferOption = BufferOption.Single
    if (bufferOpt == "default") {
      bufferOption = BufferOption.DefaultGroup
    } else if (bufferOpt == "heavy") {
      bufferOption = BufferOption.HeavyGroup
    }
    return bufferOption
  }

  fun mkBasis(basis: String): Basis {
    var basisForProcessing = Basis.CONSENT
    if (basis == "contract") {
      basisForProcessing = Basis.CONTRACT
    }
    if (basis == "legal_obligation") {
      basisForProcessing = Basis.LEGAL_OBLIGATION
    }
    if (basis == "legitimate_interests") {
      basisForProcessing = Basis.LEGITIMATE_INTERESTS
    }
    if (basis == "public_task") {
      basisForProcessing = Basis.PUBLIC_TASK
    }
    if (basis == "vital_interests") {
      basisForProcessing = Basis.VITAL_INTERESTS
    }
    return basisForProcessing
  }

  fun mkTrackerConfiguration(
    trackerConfig: ReadableMap,
    context: ReactApplicationContext
  ): TrackerConfiguration {
    val appId: String =
      if (trackerConfig.hasKey("appId")) trackerConfig.getString("appId")!! else context.getPackageName()
    val trackerConfiguration = TrackerConfiguration(appId)
      .trackerVersionSuffix(TrackerVersion.RN_TRACKER_VERSION)
    if (trackerConfig.hasKey("devicePlatform")) {
      val devicePlatform = mkDevicePlatform(trackerConfig.getString("devicePlatform")!!)
      trackerConfiguration.devicePlatform(devicePlatform)
    }
    if (trackerConfig.hasKey("logLevel")) {
      val logLevel = mkLogLevel(trackerConfig.getString("logLevel")!!)
      trackerConfiguration.logLevel(logLevel)
    }
    if (trackerConfig.hasKey("base64Encoding")) {
      trackerConfiguration.base64encoding(trackerConfig.getBoolean("base64Encoding"))
    }
    if (trackerConfig.hasKey("applicationContext")) {
      trackerConfiguration.applicationContext(trackerConfig.getBoolean("applicationContext"))
    }
    if (trackerConfig.hasKey("platformContext")) {
      trackerConfiguration.platformContext(trackerConfig.getBoolean("platformContext"))
    }
    if (trackerConfig.hasKey("geoLocationContext")) {
      trackerConfiguration.geoLocationContext(trackerConfig.getBoolean("geoLocationContext"))
    }
    if (trackerConfig.hasKey("sessionContext")) {
      trackerConfiguration.sessionContext(trackerConfig.getBoolean("sessionContext"))
    }
    if (trackerConfig.hasKey("screenContext")) {
      trackerConfiguration.screenContext(trackerConfig.getBoolean("screenContext"))
    }
    if (trackerConfig.hasKey("screenViewAutotracking")) {
      trackerConfiguration.screenViewAutotracking(trackerConfig.getBoolean("screenViewAutotracking"))
    }
    if (trackerConfig.hasKey("lifecycleAutotracking")) {
      trackerConfiguration.lifecycleAutotracking(trackerConfig.getBoolean("lifecycleAutotracking"))
    }
    if (trackerConfig.hasKey("installAutotracking")) {
      trackerConfiguration.installAutotracking(trackerConfig.getBoolean("installAutotracking"))
    }
    if (trackerConfig.hasKey("exceptionAutotracking")) {
      trackerConfiguration.exceptionAutotracking(trackerConfig.getBoolean("exceptionAutotracking"))
    }
    if (trackerConfig.hasKey("diagnosticAutotracking")) {
      trackerConfiguration.diagnosticAutotracking(trackerConfig.getBoolean("diagnosticAutotracking"))
    }
    if (trackerConfig.hasKey("deepLinkContext")) {
      trackerConfiguration.deepLinkContext(trackerConfig.getBoolean("deepLinkContext"))
    }
    if (trackerConfig.hasKey("userAnonymisation")) {
      trackerConfiguration.userAnonymisation(trackerConfig.getBoolean("userAnonymisation"))
    }
    return trackerConfiguration
  }

  fun mkSessionConfiguration(sessionConfig: ReadableMap): SessionConfiguration {
    val foregroundTimeout = sessionConfig.getDouble("foregroundTimeout").toLong()
    val backgroundTimeout = sessionConfig.getDouble("backgroundTimeout").toLong()
    return SessionConfiguration(
      TimeMeasure(foregroundTimeout, TimeUnit.SECONDS),
      TimeMeasure(backgroundTimeout, TimeUnit.SECONDS)
    )
  }

  fun mkEmitterConfiguration(emitterConfig: ReadableMap): EmitterConfiguration {
    val emitterConfiguration = EmitterConfiguration()
    if (emitterConfig.hasKey("bufferOption")) {
      val bufferOption = mkBufferOption(emitterConfig.getString("bufferOption")!!)
      emitterConfiguration.bufferOption(bufferOption)
    }
    if (emitterConfig.hasKey("emitRange")) {
      val emitRange = emitterConfig.getDouble("emitRange").toInt()
      emitterConfiguration.emitRange(emitRange)
    }
    if (emitterConfig.hasKey("threadPoolSize")) {
      val threadPoolSize = emitterConfig.getDouble("threadPoolSize").toInt()
      emitterConfiguration.threadPoolSize(threadPoolSize)
    }
    if (emitterConfig.hasKey("byteLimitPost")) {
      val byteLimitPost = emitterConfig.getDouble("byteLimitPost").toInt()
      emitterConfiguration.byteLimitPost(byteLimitPost)
    }
    if (emitterConfig.hasKey("byteLimitGet")) {
      val byteLimitGet = emitterConfig.getDouble("byteLimitGet").toInt()
      emitterConfiguration.byteLimitGet(byteLimitGet)
    }
    if (emitterConfig.hasKey("serverAnonymisation")) {
      emitterConfiguration.serverAnonymisation(emitterConfig.getBoolean("serverAnonymisation"))
    }
    return emitterConfiguration
  }

  fun mkSubjectConfiguration(subjectConfig: ReadableMap): SubjectConfiguration {
    val subjectConfiguration = SubjectConfiguration()
    if (subjectConfig.hasKey("userId")) {
      if (subjectConfig.isNull("userId")) {
        subjectConfiguration.userId(null)
      } else {
        subjectConfiguration.userId(subjectConfig.getString("userId"))
      }
    }
    if (subjectConfig.hasKey("networkUserId")) {
      if (subjectConfig.isNull("networkUserId")) {
        subjectConfiguration.networkUserId(null)
      } else {
        subjectConfiguration.networkUserId(subjectConfig.getString("networkUserId"))
      }
    }
    if (subjectConfig.hasKey("domainUserId")) {
      if (subjectConfig.isNull("domainUserId")) {
        subjectConfiguration.domainUserId(null)
      } else {
        subjectConfiguration.domainUserId(subjectConfig.getString("domainUserId"))
      }
    }
    if (subjectConfig.hasKey("useragent")) {
      if (subjectConfig.isNull("useragent")) {
        subjectConfiguration.useragent(null)
      } else {
        subjectConfiguration.useragent(subjectConfig.getString("useragent"))
      }
    }
    if (subjectConfig.hasKey("ipAddress")) {
      if (subjectConfig.isNull("ipAddress")) {
        subjectConfiguration.ipAddress(null)
      } else {
        subjectConfiguration.ipAddress(subjectConfig.getString("ipAddress"))
      }
    }
    if (subjectConfig.hasKey("timezone")) {
      if (subjectConfig.isNull("timezone")) {
        subjectConfiguration.timezone(null)
      } else {
        subjectConfiguration.timezone(subjectConfig.getString("timezone"))
      }
    }
    if (subjectConfig.hasKey("language")) {
      if (subjectConfig.isNull("language")) {
        subjectConfiguration.language(null)
      } else {
        subjectConfiguration.language(subjectConfig.getString("language"))
      }
    }
    if (subjectConfig.hasKey("screenResolution")) {
      if (subjectConfig.isNull("screenResolution")) {
        subjectConfiguration.screenResolution(null)
      } else {
        val screenRes: ReadableArray = subjectConfig.getArray("screenResolution")!!
        val screenWidth = screenRes.getDouble(0).toInt()
        val screenHeight = screenRes.getDouble(1).toInt()
        val screenResolution = Size(screenWidth, screenHeight)
        subjectConfiguration.screenResolution(screenResolution)
      }
    }
    if (subjectConfig.hasKey("screenViewport")) {
      if (subjectConfig.isNull("screenViewport")) {
        subjectConfiguration.screenViewPort(null)
      } else {
        val screenVP: ReadableArray = subjectConfig.getArray("screenViewport")!!
        val screenVPWidth = screenVP.getDouble(0).toInt()
        val screenVPHeight = screenVP.getDouble(1).toInt()
        val screenViewport = Size(screenVPWidth, screenVPHeight)
        subjectConfiguration.screenViewPort(screenViewport)
      }
    }
    if (subjectConfig.hasKey("colorDepth")) {
      if (subjectConfig.isNull("colorDepth")) {
        subjectConfiguration.colorDepth(null)
      } else {
        val colorDepth = subjectConfig.getDouble("colorDepth").toInt()
        subjectConfiguration.colorDepth(colorDepth)
      }
    }
    return subjectConfiguration
  }

  fun mkGdprConfiguration(gdprConfig: ReadableMap): GdprConfiguration {
    val basis = mkBasis(gdprConfig.getString("basisForProcessing")!!)
    val docId: String = gdprConfig.getString("documentId")!!
    val docVer: String = gdprConfig.getString("documentVersion")!!
    val docDesc: String = gdprConfig.getString("documentDescription")!!
    return GdprConfiguration(
      basis,
      docId,
      docVer,
      docDesc
    )
  }

  fun mkGCConfiguration(gcConfig: ReadableArray): GlobalContextsConfiguration {
    val contextGens: MutableMap<String, GlobalContext> = HashMap()
    for (i in 0 until gcConfig.size()) {
      val gcMap: ReadableMap = gcConfig.getMap(i)
      val itag: String = gcMap.getString("tag")!!
      val globalContexts: ReadableArray = gcMap.getArray("globalContexts")!!
      val staticContexts: MutableList<SelfDescribingJson> =
        ArrayList()
      for (x in 0 until globalContexts.size()) {
        val gContext: SelfDescribingJson =
          EventUtil.createSelfDescribingJson(globalContexts.getMap(x))
        staticContexts.add(gContext)
      }
      val gcStatic = GlobalContext(staticContexts)
      if (!contextGens.containsKey(itag)) {
        contextGens[itag] = gcStatic
      }
    }
    return GlobalContextsConfiguration(contextGens)
  }
}
