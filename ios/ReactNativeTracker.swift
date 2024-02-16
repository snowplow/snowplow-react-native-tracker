import SnowplowTracker

@objc(ReactNativeTracker)
class ReactNativeTracker: NSObject {

    @objc(createTracker:resolver:rejecter:)
    func createTracker(argmap:NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        
        let trackerNs = argmap.object(forKey: "namespace") as! String
        let networkConfig = argmap.object(forKey: "networkConfig") as! NSDictionary
        
        // NetworkConfiguration
        let method = networkConfig.object(forKey: "method") as? String
        let httpMethod: HttpMethodOptions = method == "get" ? .get : .post
        let endpoint = networkConfig.object(forKey: "endpoint") as! String
        let networkConfiguration = NetworkConfiguration(endpoint: endpoint, method: httpMethod)
        if let customPostPath = networkConfig.object(forKey: "customPostPath") as? String {
            networkConfiguration.customPostPath = customPostPath
        }
        if let requestHeaders = networkConfig.object(forKey: "requestHeaders") as? Dictionary<String, String> {
            networkConfiguration.requestHeaders = requestHeaders
        }

        // Configurations
        var controllers: [ConfigurationProtocol] = []

        // TrackerConfiguration
        let trackerConfiguration = ConfigUtils.mkTrackerConfig(argmap.object(forKey: "trackerConfig") as? NSDictionary ?? NSDictionary())
        controllers.append(trackerConfiguration)

        // SessionConfiguration
        if let sessionArg = argmap.object(forKey: "sessionConfig") as? NSDictionary,
           let sessionConfiguration = ConfigUtils.mkSessionConfig(sessionArg) {
            controllers.append(sessionConfiguration)
        }

        // EmitterConfiguration
        if let emitterArg = argmap.object(forKey: "emitterConfig") as? NSDictionary,
           let emitterConfiguration = ConfigUtils.mkEmitterConfig(emitterArg) {
            controllers.append(emitterConfiguration)
        }

        // SubjectConfiguration
        if let subjectArg = argmap.object(forKey: "subjectConfig") as? NSDictionary,
           let subjectConfiguration = ConfigUtils.mkSubjectConfig(subjectArg) {
            controllers.append(subjectConfiguration)
        }

        // GdprConfiguration
        if let gdprArg = argmap.object(forKey: "gdprConfig") as? NSDictionary,
           let gdprConfiguration = ConfigUtils.mkGdprConfig(gdprArg) {
            controllers.append(gdprConfiguration)
        }

        // GConfiguration
        if let gcArg = argmap.object(forKey: "gcConfig") as? NSArray,
           let gcConfiguration = ConfigUtils.mkGCConfig(gcArg) {
            controllers.append(gcConfiguration)
        }

        _ = Snowplow.createTracker(namespace: trackerNs, network: networkConfiguration, configurations: controllers)
        resolve(true)
    }
    
    @objc(removeTracker:resolver:rejecter:)
    func removeTracker(details:NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        let namespace = details.object(forKey: "tracker") as? String
        let trackerController = trackerByNamespace(namespace)
        let removed = Snowplow.remove(tracker: trackerController)
        resolve(removed);
    }
    
    @objc(removeAllTrackers:rejecter:)
    func removeAllTrackers(resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        Snowplow.removeAllTrackers()
        resolve(true)
    }
    
    @objc(trackSelfDescribingEvent:resolver:rejecter:)
    func trackSelfDescribingEvent(details:NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        
        let namespace = details.object(forKey: "tracker") as? String
        if let trackerController = trackerByNamespace(namespace),
           let argmap = details.object(forKey: "eventData") as? NSDictionary,
           let schema = argmap.object(forKey: "schema") as? String,
           let data = argmap.object(forKey: "data") as? Dictionary<String, Any> {

            let eventData = SelfDescribingJson(
                schema: schema,
                andDictionary: data
            )

            let event = SelfDescribing(eventData: eventData)
            if let contexts = details.object(forKey: "contexts") as? NSArray {
                event.entities = Utilities.mkSDJArray(contexts)
            }
            
            _ = trackerController.track(event)
            resolve(true);
        } else {
            let error = NSError(domain: "SnowplowTracker", code: 200)
            reject("ERROR", "tracker with given namespace not found", error);
        }
    }
    
    @objc(trackStructuredEvent:resolver:rejecter:)
    func trackStructuredEvent(details:NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        
        let namespace = details.object(forKey: "tracker") as? String
        if let trackerController = trackerByNamespace(namespace),
           let argmap = details.object(forKey: "eventData") as? NSDictionary,
           let category = argmap.object(forKey: "category") as? String,
           let action = argmap.object(forKey: "action") as? String {
            let event = Structured(category: category, action: action)
            
            if let label = argmap.object(forKey: "label") as? String {
                event.label = label
            }
            if let property = argmap.object(forKey: "property") as? String {
                event.property = property
            }
            if let value = argmap.object(forKey: "value") as? NSNumber {
                event.value = value
            }

            if let contexts = details.object(forKey: "contexts") as? NSArray {
                event.entities = Utilities.mkSDJArray(contexts)
            }
            _ = trackerController.track(event)
            resolve(true)
        } else {
            let error = NSError(domain: "SnowplowTracker", code: 200)
            reject("ERROR", "tracker with given namespace not found", error)
        }
    }
    
    @objc(trackScreenViewEvent:resolver:rejecter:)
    func trackScreenViewEvent(details:NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        
        let namespace = details.object(forKey: "tracker") as? String
        if let trackerController = trackerByNamespace(namespace),
           let argmap = details.object(forKey: "eventData") as? NSDictionary,
           let screenName = argmap.object(forKey: "name") as? String {

            var screenUuid: UUID?
            if let screenId = argmap.object(forKey: "id") as? String {
                screenUuid = UUID(uuidString: screenId)
                if screenUuid == nil {
                    let error = NSError(domain: "SnowplowTracker", code: 200)
                    reject("ERROR", "screenId has to be a valid UUID string", error)
                    return
                }
            }
            
            let event = ScreenView(name: screenName, screenId: screenUuid)

            if let type = argmap.object(forKey: "type") as? String {
                event.type = type
            }
            if let previousName = argmap.object(forKey: "previousName") as? String {
                event.previousName = previousName;
            }
            if let previousId = argmap.object(forKey: "previousId") as? String {
                event.previousId = previousId
            }
            if let previousType = argmap.object(forKey: "previousType") as? String {
                event.previousType = previousType
            }
            if let transitionType = argmap.object(forKey: "transitionType") as? String {
                event.transitionType = transitionType
            }

            if let contexts = details.object(forKey: "contexts") as? NSArray {
                event.entities = Utilities.mkSDJArray(contexts)
            }
            _ = trackerController.track(event)
            resolve(true)
        } else {
            let error = NSError(domain: "SnowplowTracker", code: 200)
            reject("ERROR", "tracker with given namespace not found", error)
        }
    }
    
    @objc(trackScrollChangedEvent:resolver:rejecter:)
    func trackScrollChangedEvent(details:NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        
        let namespace = details.object(forKey: "tracker") as? String
        if let trackerController = trackerByNamespace(namespace),
           let argmap = details.object(forKey: "eventData") as? NSDictionary {
            
            let event = ScrollChanged()

            if let contentHeight = argmap.object(forKey: "contentHeight") as? NSNumber {
                event.contentHeight = contentHeight.intValue
            }
            if let contentWidth = argmap.object(forKey: "contentWidth") as? NSNumber {
                event.contentWidth = contentWidth.intValue
            }
            if let viewWidth = argmap.object(forKey: "viewWidth") as? NSNumber {
                event.viewWidth = viewWidth.intValue
            }
            if let viewHeight = argmap.object(forKey: "viewHeight") as? NSNumber {
                event.viewHeight = viewHeight.intValue
            }
            if let xOffset = argmap.object(forKey: "xOffset") as? NSNumber {
                event.xOffset = xOffset.intValue
            }
            if let yOffset = argmap.object(forKey: "yOffset") as? NSNumber {
                event.yOffset = yOffset.intValue
            }

            if let contexts = details.object(forKey: "contexts") as? NSArray {
                event.entities = Utilities.mkSDJArray(contexts)
            }
            _ = trackerController.track(event)
            resolve(true)
        } else {
            let error = NSError(domain: "SnowplowTracker", code: 200)
            reject("ERROR", "tracker with given namespace not found", error)
        }
    }
    
    @objc(trackListItemViewEvent:resolver:rejecter:)
    func trackListItemViewEvent(details:NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        
        let namespace = details.object(forKey: "tracker") as? String
        if let trackerController = trackerByNamespace(namespace),
           let argmap = details.object(forKey: "eventData") as? NSDictionary {
            
            if let index = argmap.object(forKey: "index") as? NSNumber {
                let event = ListItemView(index: index.intValue)
                
                if let itemsCount = argmap.object(forKey: "itemsCount") as? NSNumber {
                    event.itemsCount = itemsCount.intValue
                }
                
                if let contexts = details.object(forKey: "contexts") as? NSArray {
                    event.entities = Utilities.mkSDJArray(contexts)
                }
                _ = trackerController.track(event)
                resolve(true)
            } else {
                let error = NSError(domain: "SnowplowTracker", code: 200)
                reject("ERROR", "index has to be a valid integer", error)
                return
            }
        } else {
            let error = NSError(domain: "SnowplowTracker", code: 200)
            reject("ERROR", "tracker with given namespace not found", error)
        }
    }
    
    @objc(trackPageViewEvent:resolver:rejecter:)
    func trackPageViewEvent(details:NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        let namespace = details.object(forKey: "tracker") as? String
        if let trackerController = trackerByNamespace(namespace),
           let argmap = details.object(forKey: "eventData") as? NSDictionary,
           let pageUrl = argmap.object(forKey: "pageUrl") as? String {
            let event = PageView(pageUrl: pageUrl)

            if let pageTitle = argmap.object(forKey: "pageTitle") as? String {
                event.pageTitle = pageTitle
            }
            if let referrer = argmap.object(forKey: "referrer") as? String {
                event.referrer = referrer
            }

            if let contexts = details.object(forKey: "contexts") as? NSArray {
                event.entities = Utilities.mkSDJArray(contexts)
            }
            _ = trackerController.track(event)
            resolve(true)
        } else {
            let error = NSError(domain: "SnowplowTracker", code: 200)
            reject("ERROR", "tracker with given namespace not found", error)
        }
    }
    
    @objc(trackTimingEvent:resolver:rejecter:)
    func trackTimingEvent(details:NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        let namespace = details.object(forKey: "tracker") as? String
        if let trackerController = trackerByNamespace(namespace),
           let argmap = details.object(forKey: "eventData") as? NSDictionary,
           let category = argmap.object(forKey: "category") as? String,
           let variable = argmap.object(forKey: "variable") as? String,
           let timing = argmap.object(forKey: "timing") as? NSNumber {
            let event = Timing(category: category, variable: variable, timing: timing.intValue)
            
            if let label = argmap.object(forKey: "label") as? String {
                event.label = label
            }
        
            if let contexts = details.object(forKey: "contexts") as? NSArray {
                event.entities = Utilities.mkSDJArray(contexts)
            }
            _ = trackerController.track(event)
            resolve(true)
        } else {
            let error = NSError(domain: "SnowplowTracker", code: 200)
            reject("ERROR", "tracker with given namespace not found", error)
        }
    }
    
    @objc(trackConsentGrantedEvent:resolver:rejecter:)
    func trackConsentGrantedEvent(details:NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        
        let namespace = details.object(forKey: "tracker") as? String
        if let trackerController = trackerByNamespace(namespace),
           let argmap = details.object(forKey: "eventData") as? NSDictionary,
           let expiry = argmap.object(forKey: "expiry") as? String,
           let documentId = argmap.object(forKey: "documentId") as? String,
           let version = argmap.object(forKey: "version") as? String {
            
            let event = ConsentGranted(expiry: expiry, documentId: documentId, version: version)

            if let name = argmap.object(forKey: "name") as? String {
                event.name = name;
            }
            if let documentDescription = argmap.object(forKey: "documentDescription") as? String {
                event.documentDescription = documentDescription;
            }
            
            if let contexts = details.object(forKey: "contexts") as? NSArray {
                event.entities = Utilities.mkSDJArray(contexts)
            }
            _ = trackerController.track(event)
            resolve(true)
        } else {
            let error = NSError(domain: "SnowplowTracker", code: 200)
            reject("ERROR", "tracker with given namespace not found", error)
        }
    }

    @objc(trackConsentWithdrawnEvent:resolver:rejecter:)
    func trackConsentWithdrawnEvent(details:NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        
        let namespace = details.object(forKey: "tracker") as? String
        if let trackerController = trackerByNamespace(namespace),
           let argmap = details.object(forKey: "eventData") as? NSDictionary {
            
            let event = ConsentWithdrawn()

            if let all = argmap.object(forKey: "all") as? NSNumber {
                event.all = all.boolValue
            }
            if let documentId = argmap.object(forKey: "documentId") as? String {
                event.documentId = documentId
            }
            if let version = argmap.object(forKey: "version") as? String {
                event.version = version
            }
            if let name = argmap.object(forKey: "name") as? String {
                event.name = name
            }
            if let documentDescription = argmap.object(forKey: "documentDescription") as? String {
                event.documentDescription = documentDescription
            }
            
            if let contexts = details.object(forKey: "contexts") as? NSArray {
                event.entities = Utilities.mkSDJArray(contexts)
            }
            _ = trackerController.track(event)
            resolve(true)
        } else {
            let error = NSError(domain: "SnowplowTracker", code: 200)
            reject("ERROR", "tracker with given namespace not found", error)
        }
    }

    @objc(trackEcommerceTransactionEvent:resolver:rejecter:)
    func trackEcommerceTransactionEvent(details:NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        let namespace = details.object(forKey: "tracker") as? String
        if let trackerController = trackerByNamespace(namespace),
           let argmap = details.object(forKey: "eventData") as? NSDictionary,
           let orderId = argmap.object(forKey: "orderId") as? String,
           let totalValue = argmap.object(forKey: "totalValue") as? NSNumber {
            var transItems: [EcommerceItem] = []
            if let items = argmap.object(forKey: "items") as? NSArray {
                for item in items {
                    if let item = item as? NSDictionary,
                       let sku = item.object(forKey: "sku") as? String,
                       let price = item.object(forKey: "price") as? NSNumber,
                       let quantity = item.object(forKey: "quantity") as? NSNumber {
                        let ecomItem = EcommerceItem(sku: sku, price: price.doubleValue, quantity: quantity.intValue)
                        if let name = argmap.object(forKey: "name") as? String {
                            ecomItem.name = name
                        }
                        if let category = argmap.object(forKey: "category") as? String {
                            ecomItem.category = category
                        }
                        if let currency = argmap.object(forKey: "currency") as? String {
                            ecomItem.currency = currency;
                        }
                        
                        transItems.append(ecomItem)
                    }
                }
            }
            
            let event = Ecommerce(orderId: orderId, totalValue: totalValue.doubleValue, items: transItems)
            
            if let contexts = details.object(forKey: "contexts") as? NSArray {
                event.entities = Utilities.mkSDJArray(contexts)
            }
            _ = trackerController.track(event)
            resolve(true)
        } else {
            let error = NSError(domain: "SnowplowTracker", code: 200)
            reject("ERROR", "tracker with given namespace not found", error)
        }
    }

    @objc(trackDeepLinkReceivedEvent:resolver:rejecter:)
    func trackDeepLinkReceivedEvent(details:NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        
        let namespace = details.object(forKey: "tracker") as? String
        if let trackerController = trackerByNamespace(namespace),
           let argmap = details.object(forKey: "eventData") as? NSDictionary,
           let url = argmap.object(forKey: "url") as? String {
            let event = DeepLinkReceived(url: url)
            
            if let referrer = argmap.object(forKey: "referrer") as? String {
                event.referrer = referrer
            }
            
            if let contexts = details.object(forKey: "contexts") as? NSArray {
                event.entities = Utilities.mkSDJArray(contexts)
            }
            _ = trackerController.track(event)
            resolve(true)
        } else {
            let error = NSError(domain: "SnowplowTracker", code: 200)
            reject("ERROR", "tracker with given namespace not found", error)
        }
    }

    @objc(trackMessageNotificationEvent:resolver:rejecter:)
    func trackMessageNotificationEvent(details:NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        
        let namespace = details.object(forKey: "tracker") as? String
        if let trackerController = trackerByNamespace(namespace),
           let argmap = details.object(forKey: "eventData") as? NSDictionary,
           let title = argmap.object(forKey: "title") as? String,
           let body = argmap.object(forKey: "body") as? String {
            let triggerStr = argmap.object(forKey: "trigger") as? String
            var trigger: MessageNotificationTrigger = .other
            
            if triggerStr == "push" {
                trigger = .push
            } else if triggerStr == "location" {
                trigger = .location
            } else if triggerStr == "calendar" {
                trigger = .calendar
            } else if triggerStr == "timeInterval" {
                trigger = .timeInterval
            }
            let event = MessageNotification(title: title, body: body, trigger: trigger)

            if let action = argmap.object(forKey: "action") as? String {
                event.action = action
            }
            if let attachmentsMap = argmap.object(forKey: "attachments") as? NSArray {
                var attachments: [MessageNotificationAttachment] = []
                for attachmentMap in attachmentsMap {
                    if let attachmentMap = attachmentMap as? NSDictionary,
                       let identifier = attachmentMap.object(forKey: "identifier") as? String,
                       let type = attachmentMap.object(forKey: "type") as? String,
                       let url = attachmentMap.object(forKey: "url") as? String {
                        let attachment = MessageNotificationAttachment(identifier: identifier, type: type, url: url)
                        attachments.append(attachment)
                    }
                }
                
                event.attachments = attachments
            }
            if let bodyLocArgs = argmap.object(forKey: "bodyLocArgs") as? NSArray {
                event.bodyLocArgs = bodyLocArgs.map { $0 as? String}.compactMap { $0 }
            }
            if let bodyLocKey = argmap.object(forKey: "bodyLocKey") as? String {
                event.bodyLocKey = bodyLocKey
            }
            if let category = argmap.object(forKey: "category") as? String {
                event.category = category
            }
            if let contentAvailable = argmap.object(forKey: "contentAvailable") as? NSNumber {
                event.contentAvailable = contentAvailable.boolValue
            }
            if let group = argmap.object(forKey: "group") as? String {
                event.group = group
            }
            if let icon = argmap.object(forKey: "icon") as? String {
                event.icon = icon
            }
            if let notificationCount = argmap.object(forKey: "notificationCount") as? NSNumber {
                event.notificationCount = notificationCount.intValue
            }
            if let notificationTimestamp = argmap.object(forKey: "notificationTimestamp") as? String {
                event.notificationTimestamp = notificationTimestamp
            }
            if let sound = argmap.object(forKey: "sound") as? String {
                event.sound = sound
            }
            if let subtitle = argmap.object(forKey: "subtitle") as? String {
                event.subtitle = subtitle
            }
            if let tag = argmap.object(forKey: "tag") as? String {
                event.tag = tag
            }
            if let threadIdentifier = argmap.object(forKey: "threadIdentifier") as? String {
                event.threadIdentifier = threadIdentifier
            }
            if let titleLocArgs = argmap.object(forKey: "titleLocArgs") as? NSArray {
                event.titleLocArgs = titleLocArgs.map { $0 as? String}.compactMap { $0 }
            }
            if let titleLocKey = argmap.object(forKey: "titleLocKey") as? String {
                event.titleLocKey = titleLocKey
            }
            
            if let contexts = details.object(forKey: "contexts") as? NSArray {
                event.entities = Utilities.mkSDJArray(contexts)
            }
            _ = trackerController.track(event)
            resolve(true)
        } else {
            let error = NSError(domain: "SnowplowTracker", code: 200)
            reject("ERROR", "tracker with given namespace not found", error)
        }
    }

    @objc(removeGlobalContexts:resolver:rejecter:)
    func removeGlobalContexts(details:NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        let namespace = details.object(forKey: "tracker") as? String
        if let trackerController = trackerByNamespace(namespace),
           let tag = details.object(forKey: "removeTag") as? String {
            _ = trackerController.globalContexts?.remove(tag: tag)
            resolve(true)
        } else {
            let error = NSError(domain: "SnowplowTracker", code: 200)
            reject("ERROR", "tracker with given namespace not found", error)
        }
    }

    @objc(addGlobalContexts:resolver:rejecter:)
    func addGlobalContexts(details:NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        let namespace = details.object(forKey: "tracker") as? String
        if let trackerController = trackerByNamespace(namespace),
           let gcArg = details.object(forKey: "addGlobalContext") as? NSDictionary,
           let tag = gcArg.object(forKey: "tag") as? String,
           let globalContexts = gcArg.object(forKey: "globalContexts") as? NSArray {
            let staticContexts = Utilities.mkSDJArray(globalContexts)
            let gcStatic = GlobalContext(staticContexts: staticContexts)

            _ = trackerController.globalContexts?.add(tag: tag, contextGenerator: gcStatic)

            resolve(true)
        } else {
            let error = NSError(domain: "SnowplowTracker", code: 200)
            reject("ERROR", "tracker with given namespace not found", error)
        }
    }

    @objc(setUserId:resolver:rejecter:)
    func setUserId(details:NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        let namespace = details.object(forKey: "tracker") as? String
        if let trackerController = trackerByNamespace(namespace) {
            let newUid = details.object(forKey: "userId") as? String
            trackerController.subject?.userId = newUid
        
            resolve(true)
        } else {
            let error = NSError(domain: "SnowplowTracker", code: 200)
            reject("ERROR", "tracker with given namespace not found", error)
        }
    }

    @objc(setNetworkUserId:resolver:rejecter:)
    func setNetworkUserId(details:NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        let namespace = details.object(forKey: "tracker") as? String
        if let trackerController = trackerByNamespace(namespace) {
            
            let newNuid = details.object(forKey: "networkUserId") as? String
            trackerController.subject?.networkUserId = newNuid
            
            resolve(true)
        } else {
            let error = NSError(domain: "SnowplowTracker", code: 200)
            reject("ERROR", "tracker with given namespace not found", error)
        }
    }

    @objc(setDomainUserId:resolver:rejecter:)
    func setDomainUserId(details:NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        let namespace = details.object(forKey: "tracker") as? String
        if let trackerController = trackerByNamespace(namespace) {
            
            let newDuid = details.object(forKey: "domainUserId") as? String
            trackerController.subject?.domainUserId = newDuid
            
            resolve(true)
        } else {
            let error = NSError(domain: "SnowplowTracker", code: 200)
            reject("ERROR", "tracker with given namespace not found", error)
        }
    }

    @objc(setIpAddress:resolver:rejecter:)
    func setIpAddress(details:NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        let namespace = details.object(forKey: "tracker") as? String
        if let trackerController = trackerByNamespace(namespace) {
            
            let newIp = details.object(forKey: "ipAddress") as? String
            trackerController.subject?.ipAddress = newIp
            
            resolve(true)
        } else {
            let error = NSError(domain: "SnowplowTracker", code: 200)
            reject("ERROR", "tracker with given namespace not found", error)
        }
    }
    
    @objc(setUseragent:resolver:rejecter:)
    func setUseragent(details:NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        let namespace = details.object(forKey: "tracker") as? String
        if let trackerController = trackerByNamespace(namespace) {
            
            let newUagent = details.object(forKey: "useragent") as? String
            trackerController.subject?.useragent = newUagent
            
            resolve(true)
        } else {
            let error = NSError(domain: "SnowplowTracker", code: 200)
            reject("ERROR", "tracker with given namespace not found", error)
        }
    }

    @objc(setTimezone:resolver:rejecter:)
    func setTimezone(details:NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        let namespace = details.object(forKey: "tracker") as? String
        if let trackerController = trackerByNamespace(namespace) {
            
            let newTz = details.object(forKey: "timezone") as? String
            trackerController.subject?.timezone = newTz
            
            resolve(true)
        } else {
            let error = NSError(domain: "SnowplowTracker", code: 200)
            reject("ERROR", "tracker with given namespace not found", error)
        }
    }

    @objc(setLanguage:resolver:rejecter:)
    func setLanguage(details:NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        let namespace = details.object(forKey: "tracker") as? String
        if let trackerController = trackerByNamespace(namespace) {
            
            let newLang = details.object(forKey: "language") as? String
            trackerController.subject?.language = newLang
            
            resolve(true)
        } else {
            let error = NSError(domain: "SnowplowTracker", code: 200)
            reject("ERROR", "tracker with given namespace not found", error)
        }
    }

    @objc(setScreenResolution:resolver:rejecter:)
    func setScreenResolution(details:NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        let namespace = details.object(forKey: "tracker") as? String
        if let trackerController = trackerByNamespace(namespace) {
            
            if let newRes = details.object(forKey: "screenResolution") as? NSArray,
               let resWidth = newRes.object(at: 0) as? NSNumber,
               let resHeight = newRes.object(at: 1) as? NSNumber {
                let resSize = SPSize(width: resWidth.intValue, height: resHeight.intValue)
                trackerController.subject?.screenResolution = resSize
            }
            else {
                trackerController.subject?.screenResolution = nil
            }
            
            resolve(true)
        } else {
            let error = NSError(domain: "SnowplowTracker", code: 200)
            reject("ERROR", "tracker with given namespace not found", error)
        }
    }

    @objc(setScreenViewport:resolver:rejecter:)
    func setScreenViewport(details:NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        let namespace = details.object(forKey: "tracker") as? String
        if let trackerController = trackerByNamespace(namespace) {
            
            if let newView = details.object(forKey: "screenViewport") as? NSArray,
               let vpWidth = newView.object(at: 0) as? NSNumber,
               let vpHeight = newView.object(at: 1) as? NSNumber {
                let vpSize = SPSize(width: vpWidth.intValue, height: vpHeight.intValue)
                trackerController.subject?.screenViewPort = vpSize
            }
            else {
                trackerController.subject?.screenViewPort = nil
            }
            
            resolve(true)
        } else {
            let error = NSError(domain: "SnowplowTracker", code: 200)
            reject("ERROR", "tracker with given namespace not found", error)
        }
    }

    @objc(setColorDepth:resolver:rejecter:)
    func setColorDepth(details:NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        let namespace = details.object(forKey: "tracker") as? String
        if let trackerController = trackerByNamespace(namespace) {
            
            let newColorD = details.object(forKey: "colorDepth") as? NSNumber
            trackerController.subject?.colorDepth = newColorD
            
            resolve(true)
        } else {
            let error = NSError(domain: "SnowplowTracker", code: 200)
            reject("ERROR", "tracker with given namespace not found", error)
        }
    }
    
    @objc(getSessionUserId:resolver:rejecter:)
    func getSessionUserId(details:NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        let namespace = details.object(forKey: "tracker") as? String
        if let trackerController = trackerByNamespace(namespace) {
            
            resolve(trackerController.session?.userId)
            
        } else {
            let error = NSError(domain: "SnowplowTracker", code: 200)
            reject("ERROR", "tracker with given namespace not found", error)
        }
    }
    
    @objc(getSessionId:resolver:rejecter:)
    func getSessionId(details:NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        let namespace = details.object(forKey: "tracker") as? String
        if let trackerController = trackerByNamespace(namespace) {
            
            resolve(trackerController.session?.sessionId)
            
        } else {
            let error = NSError(domain: "SnowplowTracker", code: 200)
            reject("ERROR", "tracker with given namespace not found", error)
        }
    }
    
    @objc(getSessionIndex:resolver:rejecter:)
    func getSessionIndex(details:NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        let namespace = details.object(forKey: "tracker") as? String
        if let trackerController = trackerByNamespace(namespace) {
            
            if let sessionIndex = trackerController.session?.sessionIndex {
                resolve(NSNumber(integerLiteral: sessionIndex))
            } else {
                resolve(nil)
            }
        } else {
            let error = NSError(domain: "SnowplowTracker", code: 200)
            reject("ERROR", "tracker with given namespace not found", error)
        }
    }
    
    @objc(getIsInBackground:resolver:rejecter:)
    func getIsInBackground(details:NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        let namespace = details.object(forKey: "tracker") as? String
        if let trackerController = trackerByNamespace(namespace) {
            
            if let isInBg = trackerController.session?.isInBackground {
                resolve(NSNumber(booleanLiteral: isInBg))
            } else {
                resolve(nil)
            }
        } else {
            let error = NSError(domain: "SnowplowTracker", code: 200)
            reject("ERROR", "tracker with given namespace not found", error)
        }
    }
    
    @objc(getBackgroundIndex:resolver:rejecter:)
    func getBackgroundIndex(details:NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        let namespace = details.object(forKey: "tracker") as? String
        if let trackerController = trackerByNamespace(namespace) {
            
            if let bgIdx = trackerController.session?.backgroundIndex {
                resolve(NSNumber(integerLiteral: bgIdx))
            } else {
                resolve(nil)
            }
        } else {
            let error = NSError(domain: "SnowplowTracker", code: 200)
            reject("ERROR", "tracker with given namespace not found", error)
        }
    }
    
    @objc(getForegroundIndex:resolver:rejecter:)
    func getForegroundIndex(details:NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        let namespace = details.object(forKey: "tracker") as? String
        if let trackerController = trackerByNamespace(namespace) {
            
            if let fgIdx = trackerController.session?.foregroundIndex {
                resolve(NSNumber(integerLiteral: fgIdx))
            } else {
                resolve(nil)
            }
        } else {
            let error = NSError(domain: "SnowplowTracker", code: 200)
            reject("ERROR", "tracker with given namespace not found", error)
        }
    }
    
    func trackerByNamespace(_ namespace: String?) -> TrackerController? {
        if let namespace = namespace {
            return Snowplow.tracker(namespace: namespace)
        } else {
            return Snowplow.defaultTracker()
        }
    }
}
