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

RCT_EXPORT_METHOD(initialize
                  :(NSDictionary *)options
                  :rejecter:(RCTPromiseRejectBlock)reject
                ) {

    // throw if index.js has failed to pass a complete options object
    if (!(options[@"endpoint"] != nil &&
          options[@"namespace"] != nil &&
          options[@"appId"] != nil &&
          options[@"method"] != nil &&
          options[@"protocol"] != nil &&
          options[@"setBase64Encoded"] != nil &&
          options[@"setPlatformContext"] != nil &&
          // options[@"autoScreenView"] != nil && -- to be removed
          options[@"setApplicationContext"] != nil &&
          options[@"setLifecycleEvents"] != nil &&
          options[@"setScreenContext"] != nil &&
          options[@"setSessionContext"] != nil &&
          options[@"foregroundTimeout"] != nil &&
          options[@"backgroundTimeout"] != nil &&
          options[@"checkInterval"] != nil &&
          options[@"setInstallEvent"] != nil
        )) {
      NSError * error = [NSError errorWithDomain:@"SnowplowTracker" code:100 userInfo:nil];
      reject(@"ERROR", @"SnowplowTracker: initialize() method - missing parameter with no default found", error);
    }

    SPSubject *subject = [[SPSubject alloc] initWithPlatformContext:[options[@"setPlatformContext"] boolValue] andGeoContext:NO];

    SPEmitter *emitter = [SPEmitter build:^(id<SPEmitterBuilder> builder) {
        [builder setUrlEndpoint:options[@"endpoint"]];
        [builder setHttpMethod:([@"post" caseInsensitiveCompare:options[@"method"]] == NSOrderedSame) ? SPRequestPost : SPRequestGet];
        [builder setProtocol:([@"https" caseInsensitiveCompare:options[@"protocol"]] == NSOrderedSame) ? SPHttps : SPHttp];
    }];
    self.tracker = [SPTracker build:^(id<SPTrackerBuilder> builder) {
        [builder setEmitter:emitter];
        [builder setAppId:options[@"appId"]];
        [builder setBase64Encoded:[options[@"setBase64Encoded"] boolValue]];
        [builder setTrackerNamespace:options[@"namespace"]];
        // [builder setAutotrackScreenViews:options[@"autoScreenView"]]; -- to be removed
        [builder setApplicationContext:[options[@"setApplicationContext"] boolValue]];
        [builder setLifecycleEvents:[options[@"setLifecycleEvents"] boolValue]];
        [builder setScreenContext:[options[@"setScreenContext"] boolValue]];
        [builder setInstallEvent:[options[@"setInstallEvent"] boolValue]];
        [builder setSubject:subject];
        [builder setSessionContext:[options[@"setSessionContext"] boolValue]];
        [builder setCheckInterval:[options[@"checkInterval"] integerValue]];
        [builder setForegroundTimeout:[options[@"foregroundTimeout"] integerValue]];
        [builder setBackgroundTimeout:[options[@"backgroundTimeout"] integerValue]];
    }];
}

RCT_EXPORT_METHOD(setSubjectData :(NSDictionary *)options) {
      if (options[@"userId"] != nil) {
              [self.tracker.subject setUserId:options[@"userId"]];
      }
      if (options[@"screenWidth"] != nil && options[@"screenHeight"] != nil) {
          [self.tracker.subject setResolutionWithWidth:[options[@"screenWidth"] integerValue] andHeight:[options[@"screenHeight"] integerValue]];
      }
      if (options[@"viewportWidth"] != nil && options[@"viewportHeight"] != nil) {
          [self.tracker.subject setViewPortWithWidth:[options[@"viewportWidth"] integerValue] andHeight:[options[@"viewportHeight"] integerValue]];
      }
      if (options[@"colorDepth"] != nil) {
          [self.tracker.subject setColorDepth:[options[@"colorDepth"] integerValue]];
      }
      if (options[@"timezone"] != nil) {
          [self.tracker.subject setTimezone:options[@"timezone"]];
      }
      if (options[@"language"] != nil) {
          [self.tracker.subject setLanguage:options[@"language"]];
      }
      if (options[@"ipAddress"] != nil) {
          [self.tracker.subject setIpAddress:options[@"ipAddress"]];
      }
      if (options[@"useragent"] != nil) {
          [self.tracker.subject setUseragent:options[@"useragent"]];
      }
      if (options[@"networkUserId"] != nil) {
          [self.tracker.subject setNetworkUserId:options[@"networkUserId"]];
      }
      if (options[@"domainUserId"] != nil) {
          [self.tracker.subject setDomainUserId:options[@"domainUserId"]];
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

    SPStructured * trackerEvent = [SPStructured build:^(id<SPStructuredBuilder> builder) {
        [builder setCategory:details[@"category"]];
        [builder setAction:details[@"action"]];
        if (details[@"label"] != nil) [builder setLabel:details[@"label"]];
        if (details[@"property"] != nil) [builder setProperty:details[@"property"]];

        // doubleValue cannot be NSNull, and falsey value evaluates to 0 in objective-c. Only set 'value' parameter where neither are the case.
        if (details[@"value"] != (id)[NSNull null] && details[@"value"] != nil)  [builder setValue:[details[@"value"] doubleValue]];
        if (contexts) {
            [builder setContexts:[[NSMutableArray alloc] initWithArray:contexts]];
        }
    }];
    [self.tracker trackStructuredEvent:trackerEvent];
}

RCT_EXPORT_METHOD(trackScreenViewEvent

                  :(NSDictionary *)details
                  :(NSArray<SPSelfDescribingJson *> *)contexts) {

    SPScreenView * SVevent = [SPScreenView build:^(id<SPScreenViewBuilder> builder) {
        [builder setName:details[@"screenName"]];

        // screenId and screenType must not be NSNull.
        if (details[@"screenId"] != (id)[NSNull null] && details[@"screenId"] != nil) [builder setScreenId:details[@"screenId"]];
        if (details[@"screenType"] != (id)[NSNull null] && details[@"screenType"] != nil) [builder setType:details[@"screenType"]];
        if (details[@"previousScreenName"] != nil) [builder setPreviousScreenName:details[@"previousScreenName"]];
        if (details[@"previousScreenType"] != nil) [builder setPreviousScreenType:details[@"previousScreenType"]];
        if (details[@"previousScreenId"] != nil) [builder setPreviousScreenId:details[@"previousScreenId"]];
        if (details[@"transitionType"] != nil) [builder setTransitionType:details[@"transitionType"]];
        if (contexts) {
            [builder setContexts:[[NSMutableArray alloc] initWithArray:contexts]];
        }
      }];
      [self.tracker trackScreenViewEvent:SVevent];
}

RCT_EXPORT_METHOD(trackPageViewEvent
                  :(NSDictionary *)details
                  :(NSArray<SPSelfDescribingJson *> *)contexts) {

    SPPageView * trackerEvent = [SPPageView build:^(id<SPPageViewBuilder> builder) {
        [builder setPageUrl:details[@"pageUrl"]];
        if (details[@"pageTitle"] != nil) [builder setPageTitle:details[@"pageTitle"]];
        if (details[@"pageReferrer"] != nil) [builder setReferrer:details[@"pageReferrer"]];
        if (contexts) {
            [builder setContexts:[[NSMutableArray alloc] initWithArray:contexts]];
        }
    }];
    [self.tracker trackPageViewEvent:trackerEvent];
}

@end
