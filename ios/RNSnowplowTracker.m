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
                  :(nonnull NSString *)endpoint
                  :(nonnull NSString *)method
                  :(nonnull NSString *)protocol
                  :(nonnull NSString *)namespace
                  :(nonnull NSString *)appId
                  :(NSDictionary *)options
                  //:(BOOL *)autoScreenView
                  //:(BOOL *)setPlatformContext
                  //:(BOOL *)setBase64Encoded
                  //:(BOOL *)setApplicationContext
                  //:(BOOL *)setLifecycleEvents
                  //:(BOOL *)setScreenContext
                  //:(BOOL *)setInstallEvent
                  //:(BOOL *)setSessionContext
                  //:(INT *)foregroundTimeout
                  //:(INT *)backgroundTimeout
                  //:(STRING *)userId
                ) {
    BOOL setPlatformContext = NO;
    BOOL setGeoLocationContext = NO;
    if (options[@"setPlatformContext"] == @YES ) setPlatformContext = YES;
    SPSubject *subject = [[SPSubject alloc] initWithPlatformContext:setPlatformContext andGeoContext:setGeoLocationContext];

    SPEmitter *emitter = [SPEmitter build:^(id<SPEmitterBuilder> builder) {
        [builder setUrlEndpoint:endpoint];
        [builder setHttpMethod:([@"post" caseInsensitiveCompare:method] == NSOrderedSame) ? SPRequestPost : SPRequestGet];
        [builder setProtocol:([@"https" caseInsensitiveCompare:protocol] == NSOrderedSame) ? SPHttps : SPHttp];
    }];
    self.tracker = [SPTracker build:^(id<SPTrackerBuilder> builder) {
        [builder setEmitter:emitter];
        [builder setAppId:appId];
        // setBase64Encoded
        if (options[@"setBase64Encoded"] == @YES ) {
            [builder setBase64Encoded:YES];
        }else [builder setBase64Encoded:NO];
        [builder setTrackerNamespace:namespace];
        [builder setAutotrackScreenViews:options[@"autoScreenView"]];
        // setApplicationContext
        if (options[@"setApplicationContext"] == @YES ) {
            [builder setApplicationContext:YES];
        }else [builder setApplicationContext:NO];
        // setSessionContextui
        if (options[@"setSessionContext"] == @YES ) {
            [builder setSessionContext:YES];
            if (options[@"checkInterval"] != nil) {
                [builder setCheckInterval:[options[@"checkInterval"] integerValue]];
            }else [builder setCheckInterval:15];
            if (options[@"foregroundTimeout"] != nil) {
                 [builder setForegroundTimeout:[options[@"foregroundTimeout"] integerValue]];
            }else [builder setForegroundTimeout:600];
            if (options[@"backgroundTimeout"] != nil) {
                 [builder setBackgroundTimeout:[options[@"backgroundTimeout"] integerValue]];
            }else [builder setBackgroundTimeout:300];
        }else [builder setSessionContext:NO];
        // setLifecycleEvents
        if (options[@"setLifecycleEvents"] == @YES ) {
            [builder setLifecycleEvents:YES];
        }else [builder setLifecycleEvents:NO];
        // setScreenContext
        if (options[@"setScreenContext"] == @YES ) {
            [builder setScreenContext:YES];
        }else [builder setScreenContext:NO];
        //setInstallEvent
        if (options[@"setInstallEvent"] == @YES ) {
            [builder setInstallEvent:YES];
        }else [builder setInstallEvent:NO];
        [builder setSubject:subject];
    }];
}

RCT_EXPORT_METHOD(setSubjectData :(NSDictionary *)options) {
      if (options[@"userId"] != nil) {
              [self.self.tracker.subject setUserId:options[@"userId"]];
      }
      if (options[@"screenWidth"] != nil && options[@"screenHeight"] != nil) {
          [self.self.tracker.subject setResolutionWithWidth:[options[@"screenWidth"] integerValue] andHeight:[options[@"screenHeight"] integerValue]];
      }
      if (options[@"viewportWidth"] != nil && options[@"viewportHeight"] != nil) {
          [self.self.tracker.subject setViewPortWithWidth:[options[@"viewportWidth"] integerValue] andHeight:[options[@"viewportHeight"] integerValue]];
      }
      if (options[@"colorDepth"] != nil) {
          [self.self.tracker.subject setColorDepth:[options[@"colorDepth"] integerValue]];
      }
      if (options[@"timezone"] != nil) {
          [self.self.tracker.subject setTimezone:options[@"timezone"]];
      }
      if (options[@"language"] != nil) {
          [self.self.tracker.subject setLanguage:options[@"language"]];
      }
      if (options[@"ipAddress"] != nil) {
          [self.self.tracker.subject setIpAddress:options[@"ipAddress"]];
      }
      if (options[@"useragent"] != nil) {
          [self.self.tracker.subject setUseragent:options[@"useragent"]];
      }
      if (options[@"networkUserId"] != nil) {
          [self.self.tracker.subject setNetworkUserId:options[@"networkUserId"]];
      }
      if (options[@"domainUserId"] != nil) {
          [self.self.tracker.subject setDomainUserId:options[@"domainUserId"]];
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
                  :(nonnull NSString *)category // required (non-empty string)
                  :(nonnull NSString *)action // required
                  :(NSString *)label
                  :(NSString *)property
                  :(double)value
                  :(NSArray<SPSelfDescribingJson *> *)contexts) {
    SPStructured * trackerEvent = [SPStructured build:^(id<SPStructuredBuilder> builder) {
        [builder setCategory:category];
        [builder setAction:action];
        [builder setValue:value];
        if (label != nil) [builder setLabel:label];
        if (property != nil) [builder setProperty:property];
        if (contexts) {
            [builder setContexts:[[NSMutableArray alloc] initWithArray:contexts]];
        }
    }];
    [self.tracker trackStructuredEvent:trackerEvent];
}

RCT_EXPORT_METHOD(trackScreenViewEvent
                  :(nonnull NSString *)screenName
                  :(NSString *)screenId
                  :(NSString *)screenType
                  :(NSString *)previousScreenName
                  :(NSString *)previousScreenType
                  :(NSString *)previousScreenId
                  :(NSString *)transitionType
                  :(NSArray<SPSelfDescribingJson *> *)contexts) {
    SPScreenView * SVevent = [SPScreenView build:^(id<SPScreenViewBuilder> builder) {
        [builder setName:screenName];
        if (screenId != nil) [builder setScreenId:screenId];
        if (screenType != nil) [builder setType:screenType];
        if (previousScreenName != nil) [builder setPreviousScreenName:previousScreenName];
        if (previousScreenType != nil) [builder setPreviousScreenType:previousScreenType];
        if (previousScreenId != nil) [builder setPreviousScreenId:previousScreenId];
        if (transitionType != nil) [builder setTransitionType:transitionType];
        if (contexts) {
            [builder setContexts:[[NSMutableArray alloc] initWithArray:contexts]];
        }
      }];
      [self.tracker trackScreenViewEvent:SVevent];
}

RCT_EXPORT_METHOD(trackPageViewEvent
                  :(nonnull NSString *)pageUrl // required (non-empty string)
                  :(NSString *)pageTitle
                  :(NSString *)pageReferrer
                  :(NSArray<SPSelfDescribingJson *> *)contexts) {
    SPPageView * trackerEvent = [SPPageView build:^(id<SPPageViewBuilder> builder) {
        [builder setPageUrl:pageUrl];
        if (pageTitle != nil) [builder setPageTitle:pageTitle];
        if (pageReferrer != nil) [builder setReferrer:pageReferrer];
        if (contexts) {
            [builder setContexts:[[NSMutableArray alloc] initWithArray:contexts]];
        }
    }];
    [self.tracker trackPageViewEvent:trackerEvent];
}

@end
