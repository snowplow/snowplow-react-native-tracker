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
                  //:(STRING *)userId
                ) {
    SPSubject *subject = [[SPSubject alloc] initWithPlatformContext:YES andGeoContext:NO];
    if (options[@"userId"] != nil) {
        [subject setUserId:options[@"userId"]];
    }
    if (options[@"screenWidth"] != nil && options[@"screenHeigh"] != nil) {
        [subject setResolutionWithWidth:[options[@"screenWidth"] integerValue] andHeight:[options[@"screenHeigh"] integerValue]];
    }
    if (options[@"colorDepth"] != nil) {
        [subject setColorDepth:[options[@"colorDepth"] integerValue]];
    }
    if (options[@"timezone"] != nil) {
        [subject setTimezone:options[@"timezone"]];
    }
    if (options[@"language"] != nil) {
        [subject setLanguage:options[@"language"]];
    }
    if (options[@"ipAddress"] != nil) {
        [subject setIpAddress:options[@"ipAddress"]];
    }
    if (options[@"useragent"] != nil) {
        [subject setUseragent:options[@"useragent"]];
    }
    if (options[@"networkUserId"] != nil) {
        [subject setNetworkUserId:options[@"networkUserId"]];
    }
    if (options[@"domainUserId"] != nil) {
        [subject setDomainUserId:options[@"domainUserId"]];
    }
    SPEmitter *emitter = [SPEmitter build:^(id<SPEmitterBuilder> builder) {
        [builder setUrlEndpoint:endpoint];
        [builder setHttpMethod:([@"post" caseInsensitiveCompare:method] == NSOrderedSame) ? SPRequestPost : SPRequestGet];
        [builder setProtocol:([@"https" caseInsensitiveCompare:protocol] == NSOrderedSame) ? SPHttps : SPHttp];
    }];
    self.tracker = [SPTracker build:^(id<SPTrackerBuilder> builder) {
        [builder setEmitter:emitter];
        [builder setAppId:appId];
        [builder setTrackerNamespace:namespace];
        [builder setAutotrackScreenViews:options[@"autoScreenView"]];
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
                  :(nonnull NSString *)userId // required (non-empty string)
                ) {
    SPSubject * s = self.tracker.subject;
    if (userId != nil) {
        [s setUserId:userId];
        [self.tracker setSubject:s];
    }
}


@end
