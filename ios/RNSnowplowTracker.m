#import "RNSnowplowTracker.h"
#import <SnowplowTracker/SPTracker.h>
#import <SnowplowTracker/SPEmitter.h>
#import <SnowplowTracker/SPEvent.h>
#import <SnowplowTracker/SPSelfDescribingJson.h>
#import <SnowplowTracker/SPSubject.h>

@implementation RNSnowplowTracker

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(initialize:
                  (NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {

    // throw if index.js has failed to pass a complete options object
    if (!(options[@"endpoint"] != nil &&
          options[@"namespace"] != nil &&
          options[@"appId"] != nil &&
          options[@"method"] != nil &&
          options[@"protocol"] != nil &&
          options[@"base64Encoded"] != nil &&
          options[@"platformContext"] != nil &&
          options[@"applicationContext"] != nil &&
          options[@"lifecycleEvents"] != nil &&
          options[@"screenContext"] != nil &&
          options[@"sessionContext"] != nil &&
          options[@"foregroundTimeout"] != nil &&
          options[@"backgroundTimeout"] != nil &&
          options[@"checkInterval"] != nil &&
          options[@"installTracking"] != nil)) {

        NSError * error = [NSError errorWithDomain:@"SnowplowTracker" code:100 userInfo:nil];
        return reject(@"ERROR", @"SnowplowTracker: initialize() method - missing parameter with no default found", error);
    }

    SPSubject *subject = [[SPSubject alloc] initWithPlatformContext:[options[@"platformContext"] boolValue] andGeoContext:NO];

    SPEmitter *emitter = [SPEmitter build:^(id<SPEmitterBuilder> builder) {
        [builder setUrlEndpoint:options[@"endpoint"]];
        [builder setHttpMethod:([@"post" caseInsensitiveCompare:options[@"method"]] == NSOrderedSame) ? SPRequestPost : SPRequestGet];
        [builder setProtocol:([@"https" caseInsensitiveCompare:options[@"protocol"]] == NSOrderedSame) ? SPHttps : SPHttp];
    }];

    self.tracker = [SPTracker build:^(id<SPTrackerBuilder> builder) {
        [builder setEmitter:emitter];
        [builder setAppId:options[@"appId"]];
        [builder setBase64Encoded:[options[@"base64Encoded"] boolValue]];
        [builder setTrackerNamespace:options[@"namespace"]];
        [builder setApplicationContext:[options[@"applicationContext"] boolValue]];
        [builder setLifecycleEvents:[options[@"lifecycleEvents"] boolValue]];
        [builder setScreenContext:[options[@"screenContext"] boolValue]];
        [builder setInstallEvent:[options[@"installTracking"] boolValue]];
        [builder setSubject:subject];
        [builder setSessionContext:[options[@"sessionContext"] boolValue]];
        [builder setCheckInterval:[options[@"checkInterval"] integerValue]];
        [builder setForegroundTimeout:[options[@"foregroundTimeout"] integerValue]];
        [builder setBackgroundTimeout:[options[@"backgroundTimeout"] integerValue]];
    }];

    if (self.tracker) {
        resolve(@YES);
    } else {
        NSError * error = [NSError errorWithDomain:@"SnowplowTracker" code:200 userInfo:nil];
        return reject(@"ERROR", @"SnowplowTracker: initialize() method - tracker initialisation failed", error);
    }
}

RCT_EXPORT_METHOD(setSubjectData :(NSDictionary *)options
                                :rejecter:(RCTPromiseRejectBlock)reject) {

    // the readability we achieved elsewere by using similar patterns to android is not possible here.
    NSString *userId = options[@"userId"];
    NSString *timezone = options[@"timezone"];
    NSString *language = options[@"language"];
    NSString *ipAddress = options[@"ipAddress"];
    NSString *useragent = options[@"useragent"];
    NSString *networkUserId = options[@"networkUserId"];
    NSString *domainUserId = options[@"domainUserId"];

    NSNumber *screenWidth = options[@"screenWidth"];
    NSNumber *screenHeight = options[@"screenHeight"];
    NSNumber *viewportWidth = options[@"viewportWidth"];
    NSNumber *viewportHeight = options[@"viewportHeight"];
    NSNumber *colorDepth = options[@"colorDepth"];

    if (userId) {
        NSString *newUserId = [[NSNull null] isEqual:userId] ? nil : userId;
        [self.tracker.subject setUserId:newUserId];
    }

    if (timezone) {
        NSString *newTimezone = [[NSNull null] isEqual:timezone] ? nil : timezone;
        [self.tracker.subject setTimezone:newTimezone];
    }

    if (ipAddress) {
        NSString *newIpAddress = [[NSNull null] isEqual:ipAddress] ? nil : ipAddress;
        [self.tracker.subject setIpAddress:newIpAddress];
    }

    if (language) {
        NSString *newLanguage = [[NSNull null] isEqual:language] ? nil : language;
        [self.tracker.subject setLanguage:newLanguage];
    }

    if (useragent) {
        NSString *newUseragent = [[NSNull null] isEqual:useragent] ? nil : useragent;
        [self.tracker.subject setUseragent:newUseragent];
    }

    if (networkUserId) {
        NSString *newNetworkUserId = [[NSNull null] isEqual:networkUserId] ? nil : networkUserId;
        [self.tracker.subject setNetworkUserId:newNetworkUserId];
    }

    if (domainUserId) {
        NSString *newDomainUserId = [[NSNull null] isEqual:domainUserId] ? nil : domainUserId;
        [self.tracker.subject setDomainUserId:newDomainUserId];
    }

    if (screenWidth && screenHeight) {
        if ([[NSNull null] isEqual:screenWidth] || [[NSNull null] isEqual:screenHeight]) {
            NSError * error = [NSError errorWithDomain:@"SnowplowTracker" code:100 userInfo:nil];
            return reject(@"ERROR", @"SnowplowTracker: setSubjectData() method -  screenWidth and screenHeight cannot be null", error);
        } else {
            [self.tracker.subject setResolutionWithWidth:[screenWidth integerValue] andHeight:[screenHeight integerValue]];
        }
    }

    if (viewportWidth && viewportHeight) {
        if ([[NSNull null] isEqual:viewportWidth] || [[NSNull null] isEqual:viewportHeight]) {
            NSError * error = [NSError errorWithDomain:@"SnowplowTracker" code:100 userInfo:nil];
            return reject(@"ERROR", @"SnowplowTracker: setSubjectData() method -  viewportWidth and viewportHeight cannot be null", error);
        } else {
            [self.tracker.subject setViewPortWithWidth:[viewportWidth integerValue] andHeight:[viewportHeight integerValue]];
        }
    }

    if (colorDepth != nil) {
        if ([[NSNull null] isEqual:colorDepth]) {
            NSError * error = [NSError errorWithDomain:@"SnowplowTracker" code:100 userInfo:nil];
            return reject(@"ERROR", @"SnowplowTracker: setSubjectData() method -  colorDepth cannot be null", error);
        } else {
            [self.tracker.subject setColorDepth:[colorDepth integerValue]];
        }
    }
}

RCT_EXPORT_METHOD(trackSelfDescribingEvent
                  :(nonnull SPSelfDescribingJson *)event
                  :(NSArray<SPSelfDescribingJson *> *)contexts) {

    SPUnstructured * unstructEvent = [SPUnstructured build:^(id<SPUnstructuredBuilder> builder) {
        [builder setEventData:event];
        if (contexts) {
            [builder setContexts:[[NSMutableArray alloc] initWithArray:contexts]];
        }
    }];

    [self.tracker trackUnstructuredEvent:unstructEvent];
}

RCT_EXPORT_METHOD(trackStructuredEvent
                  :(NSDictionary *)details
                  :(NSArray<SPSelfDescribingJson *> *)contexts) {

    SPStructured * structuredEvent = [SPStructured build:^(id<SPStructuredBuilder> builder) {
        [builder setCategory:details[@"category"]];
        [builder setAction:details[@"action"]];
        if (details[@"label"] != nil) {
            [builder setLabel:details[@"label"]];
        }
        if (details[@"property"] != nil) {
            [builder setProperty:details[@"property"]];
        }
        // doubleValue cannot be NSNull, and falsey value evaluates to 0 in objective-c. Only set 'value' parameter where neither are the case.
        if (details[@"value"] != (id)[NSNull null] && details[@"value"] != nil) {
            [builder setValue:[details[@"value"] doubleValue]];
        }
        if (contexts) {
            [builder setContexts:[[NSMutableArray alloc] initWithArray:contexts]];
        }
    }];

    [self.tracker trackStructuredEvent:structuredEvent];
}

RCT_EXPORT_METHOD(trackScreenViewEvent
                  :(NSDictionary *)details
                  :(NSArray<SPSelfDescribingJson *> *)contexts) {

    SPScreenView * screenViewEvent = [SPScreenView build:^(id<SPScreenViewBuilder> builder) {
        [builder setName:details[@"screenName"]];

        // screenType must not be NSNull.
        if (details[@"screenType"] != (id)[NSNull null] && details[@"screenType"] != nil) [builder setType:details[@"screenType"]];
        if (details[@"transitionType"] != (id)[NSNull null] && details[@"transitionType"] != nil) [builder setTransitionType:details[@"transitionType"]];
        if (contexts) {
            [builder setContexts:[[NSMutableArray alloc] initWithArray:contexts]];
        }
      }];

      [self.tracker trackScreenViewEvent:screenViewEvent];
}

RCT_EXPORT_METHOD(trackPageViewEvent
                  :(NSDictionary *)details
                  :(NSArray<SPSelfDescribingJson *> *)contexts) {

    SPPageView * pageViewEvent = [SPPageView build:^(id<SPPageViewBuilder> builder) {
        [builder setPageUrl:details[@"pageUrl"]];
        if (details[@"pageTitle"] != nil) [builder setPageTitle:details[@"pageTitle"]];
        if (details[@"pageReferrer"] != nil) [builder setReferrer:details[@"pageReferrer"]];
        if (contexts) {
            [builder setContexts:[[NSMutableArray alloc] initWithArray:contexts]];
        }
    }];
    [self.tracker trackPageViewEvent:pageViewEvent];
}

@end
