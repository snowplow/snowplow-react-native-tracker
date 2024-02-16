import Foundation
import SnowplowTracker

class ConfigUtils {
    
    static func mkTrackerConfig(_ trackerConfig: NSDictionary) -> TrackerConfiguration {
        let trackerConfiguration = TrackerConfiguration()
        trackerConfiguration.trackerVersionSuffix = kRNTrackerVersion

        if let appId = trackerConfig.object(forKey: "appId") as? String {
            trackerConfiguration.appId = appId;
        }

        if let devicePlatform = trackerConfig.object(forKey: "devicePlatform") as? String,
           let index = ["web", "mob", "pc", "srv", "app", "tv", "cnsl", "iot"].firstIndex(of: devicePlatform),
           let platform = DevicePlatform(rawValue: index) {
            trackerConfiguration.devicePlatform = platform
        }

        if let base64 = trackerConfig.object(forKey: "base64Encoding") as? NSNumber {
            trackerConfiguration.base64Encoding = base64.boolValue
        }

        if let logLevel = trackerConfig.object(forKey: "logLevel") as? String,
           let index = ["off", "error", "debug", "verbose"].firstIndex(of: logLevel),
           let level = LogLevel(rawValue: index) {
            trackerConfiguration.logLevel = level
        }

        if let sessionContext = trackerConfig.object(forKey: "sessionContext") as? NSNumber {
            trackerConfiguration.sessionContext = sessionContext.boolValue
        }
        if let applicationContext = trackerConfig.object(forKey: "applicationContext") as? NSNumber {
            trackerConfiguration.applicationContext = applicationContext.boolValue
        }
        if let platformContext = trackerConfig.object(forKey: "platformContext") as? NSNumber {
            trackerConfiguration.platformContext = platformContext.boolValue
        }
        if let geoLocationContext = trackerConfig.object(forKey: "geoLocationContext") as? NSNumber {
            trackerConfiguration.geoLocationContext = geoLocationContext.boolValue
        }
        if let screenContext = trackerConfig.object(forKey: "screenContext") as? NSNumber {
            trackerConfiguration.screenContext = screenContext.boolValue
        }
        if let deepLinkContext = trackerConfig.object(forKey: "deepLinkContext") as? NSNumber {
            trackerConfiguration.deepLinkContext = deepLinkContext.boolValue
        }
        if let screenViewAutotracking = trackerConfig.object(forKey: "screenViewAutotracking") as? NSNumber {
            trackerConfiguration.screenViewAutotracking = screenViewAutotracking.boolValue
        } else {
            trackerConfiguration.screenViewAutotracking = false
        }
        if let screenEngagementAutotracking = trackerConfig.object(forKey: "screenEngagementAutotracking") as? NSNumber {
            trackerConfiguration.screenEngagementAutotracking = screenEngagementAutotracking.boolValue
        }
        if let lifecycleAutotracking = trackerConfig.object(forKey: "lifecycleAutotracking") as? NSNumber {
            trackerConfiguration.lifecycleAutotracking = lifecycleAutotracking.boolValue
        }
        if let installAutotracking = trackerConfig.object(forKey: "installAutotracking") as? NSNumber {
            trackerConfiguration.installAutotracking = installAutotracking.boolValue
        }
        if let exceptionAutotracking = trackerConfig.object(forKey: "exceptionAutotracking") as? NSNumber {
            trackerConfiguration.exceptionAutotracking = exceptionAutotracking.boolValue
        }
        if let diagnosticAutotracking = trackerConfig.object(forKey: "diagnosticAutotracking") as? NSNumber {
            trackerConfiguration.diagnosticAutotracking = diagnosticAutotracking.boolValue
        }
        if let userAnonymisation = trackerConfig.object(forKey: "userAnonymisation") as? NSNumber {
            trackerConfiguration.userAnonymisation = userAnonymisation.boolValue
        }

        return trackerConfiguration
    }
    
    static func mkSessionConfig(_ sessionConfig: NSDictionary) -> SessionConfiguration? {
        if let foreground = sessionConfig.object(forKey: "foregroundTimeout") as? NSNumber,
           let background = sessionConfig.object(forKey: "backgroundTimeout") as? NSNumber {
            return SessionConfiguration(foregroundTimeoutInSeconds: foreground.intValue, backgroundTimeoutInSeconds: background.intValue)
        }
        return nil
    }
    
    static func mkEmitterConfig(_ emitterConfig: NSDictionary) -> EmitterConfiguration? {
        let emitterConfiguration = EmitterConfiguration()
        if let bufferOption = emitterConfig.object(forKey: "bufferOption") as? String {
            if bufferOption == "small" {
                emitterConfiguration.bufferOption = .smallGroup;
            } else if bufferOption == "large" {
                emitterConfiguration.bufferOption = .largeGroup;
            } else {
                emitterConfiguration.bufferOption = .single;
            }
        }

        if let emitRange = emitterConfig.object(forKey: "emitRange") as? NSNumber {
            emitterConfiguration.emitRange = emitRange.intValue
        }
        if let threadPoolSize = emitterConfig.object(forKey: "threadPoolSize") as? NSNumber {
            emitterConfiguration.threadPoolSize = threadPoolSize.intValue
        }
        if let byteLimitGet = emitterConfig.object(forKey: "byteLimitGet") as? NSNumber {
            emitterConfiguration.byteLimitGet = byteLimitGet.intValue
        }
        if let byteLimitPost = emitterConfig.object(forKey: "byteLimitPost") as? NSNumber {
            emitterConfiguration.byteLimitPost = byteLimitPost.intValue
        }
        if let serverAnonymisation = emitterConfig.object(forKey: "serverAnonymisation") as? NSNumber {
            emitterConfiguration.serverAnonymisation = serverAnonymisation.boolValue
        }

        return emitterConfiguration
    }
    
    static func mkSubjectConfig(_ subjectConfig: NSDictionary) -> SubjectConfiguration? {
       
        let subjectConfiguration = SubjectConfiguration()

        if let userId = subjectConfig.object(forKey: "userId") as? String {
            subjectConfiguration.userId = userId
        }

        if let networkUserId = subjectConfig.object(forKey: "networkUserId") as? String {
            subjectConfiguration.networkUserId = networkUserId
        }

        if let domainUserId = subjectConfig.object(forKey: "domainUserId") as? String {
            subjectConfiguration.domainUserId = domainUserId
        }

        if let useragent = subjectConfig.object(forKey: "useragent") as? String {
            subjectConfiguration.useragent = useragent
        }

        if let ipAddress = subjectConfig.object(forKey: "ipAddress") as? String {
            subjectConfiguration.ipAddress = ipAddress
        }

        if let timezone = subjectConfig.object(forKey: "timezone") as? String {
            subjectConfiguration.timezone = timezone
        }

        if let language = subjectConfig.object(forKey: "language") as? String {
            subjectConfiguration.language = language
        }

        // screenResolution - type checked RN side
        if let screenRSize = subjectConfig.object(forKey: "screenResolution") as? NSArray,
           let resWidth = screenRSize.object(at: 0) as? NSNumber,
           let resHeight = screenRSize.object(at: 1) as? NSNumber {
            let resSize = SPSize(width: resWidth.intValue, height: resHeight.intValue)
            subjectConfiguration.screenResolution = resSize
        }

        // screenViewport - type checked RN side
        if let screenVPSize = subjectConfig.object(forKey: "screenViewport") as? NSArray,
           let vpWidth = screenVPSize.object(at: 0) as? NSNumber,
           let vpHeight = screenVPSize.object(at: 1) as? NSNumber {
            let vpSize = SPSize(width: vpWidth.intValue, height: vpHeight.intValue)
            subjectConfiguration.screenViewPort = vpSize
        }

        // colorDepth
        if let colorDepth = subjectConfig.object(forKey: "colorDepth") as? NSNumber {
            subjectConfiguration.colorDepth = colorDepth
        }

        return subjectConfiguration;
    }
   
    static func mkGdprConfig(_ gdprConfig: NSDictionary) -> GDPRConfiguration? {
        if let basis = gdprConfig.object(forKey: "basisForProcessing") as? String,
           let docId = gdprConfig.object(forKey: "documentId") as? String,
           let docVer = gdprConfig.object(forKey: "documentVersion") as? String,
           let docDesc = gdprConfig.object(forKey: "documentDescription") as? String {
            
            return GDPRConfiguration(basis: Utilities.getBasis(basis), documentId: docId, documentVersion: docVer, documentDescription: docDesc)
        }
        return nil
    }
    
    static func mkGCConfig(_ gcConfig: NSArray) -> GlobalContextsConfiguration? {
        
        let gcConfiguration = GlobalContextsConfiguration()

        for gcMap in gcConfig {
            if let gcMap = gcMap as? NSDictionary,
               let itag = gcMap.object(forKey: "tag") as? String,
               let globalContexts = gcMap.object(forKey: "globalContexts") as? NSArray {
                let staticContexts: [SelfDescribingJson] = globalContexts.map { sdj in
                    if let sdj = sdj as? NSDictionary,
                       let schema = sdj.object(forKey: "schema") as? String,
                       let data = sdj.object(forKey: "data") as? Dictionary<String, Any> {
                        return SelfDescribingJson(schema: schema, andDictionary: data)
                    } else {
                        return nil
                    }
                }.compactMap { $0 }
                
                if !staticContexts.isEmpty {
                    let gcStatic = GlobalContext(staticContexts: staticContexts)
                    _ = gcConfiguration.add(tag: itag, contextGenerator: gcStatic)
                }
            }
        }

        return gcConfiguration;
    }
    
}
