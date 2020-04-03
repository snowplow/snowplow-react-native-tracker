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
                  //:(BOOL *)setGeoLocationContext
                  //:(BOOL *)setBase64Encoded
                  //:(BOOL *)setApplicationContext
                  //:(BOOL *)setLifecycleEvents
                  //:(BOOL *)setScreenContext
                  //:(BOOL *)setInstallEvent
                  //:(BOOL *)setExceptionEvents
                  //:(BOOL *)setSessionContext
                  //:(INT *)setForegroundTimeout
                  //:(INT *)setBackgroundTimeout
                  //:(STRING *)userId
                ) {
    BOOL setPlatformContext = NO;
    BOOL setGeoLocationContext = NO;
    if (options[@"setPlatformContext"] == @YES ) setPlatformContext = YES;
    if (options[@"setGeoLocationContext"] == @YES ) setGeoLocationContext = YES;
    SPSubject *subject = [[SPSubject alloc] initWithPlatformContext:setPlatformContext andGeoContext:setGeoLocationContext];
    if (options[@"userId"] != nil) {
            [subject setUserId:options[@"userId"]];
    }
    
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
                [builder setCheckInterval:options[@"checkInterval"]];
            }else [builder setCheckInterval:15];
            if (options[@"foregroundTimeout"] != nil) {
                 [builder setSessionContext:options[@"foregroundTimeout"]];
            }else [builder setForegroundTimeout:600];
            if (options[@"backgroundTimeout"] != nil) {
                 [builder setSessionContext:options[@"backgroundTimeout"]];
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
        //setExceptionEvents
        if (options[@"setExceptionEvents"] == @YES ) {
            [builder setExceptionEvents:YES];
        }else [builder setExceptionEvents:NO];
        [builder setSubject:subject];
    }];
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
        if (screenId != nil) [builder setScreenId:screenId]; else [builder setScreenId:[[NSUUID UUID] UUIDString]];
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

RCT_EXPORT_METHOD(setUserId
                  :(nonnull NSString *)userId // required (non-empty string),
                  :(NSDictionary *)options
                ) {
    BOOL setPlatformContext = NO;
    BOOL setGeoLocationContext = NO;
    if (options[@"setPlatformContext"] == @YES ) setPlatformContext = YES;
    if (options[@"setGeoLocationContext"] == @YES ) setGeoLocationContext = YES;
    SPSubject * subject = [[SPSubject alloc] initWithPlatformContext:setPlatformContext andGeoContext:setGeoLocationContext];
    if (userId != nil) {
        [subject setUserId:userId];
        [self.tracker setSubject:subject];
    }
}

@end
