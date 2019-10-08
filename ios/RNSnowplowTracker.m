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
                  :(nonnull NSString *)appId) {
    SPSubject *subject = [[SPSubject alloc] initWithPlatformContext:YES andGeoContext:NO];

    SPEmitter *emitter = [SPEmitter build:^(id<SPEmitterBuilder> builder) {
        [builder setUrlEndpoint:endpoint];
        [builder setHttpMethod:([@"post" caseInsensitiveCompare:method] == NSOrderedSame) ? SPRequestPost : SPRequestGet];
        [builder setProtocol:([@"https" caseInsensitiveCompare:protocol] == NSOrderedSame) ? SPHttps : SPHttp];
    }];
    self.tracker = [SPTracker build:^(id<SPTrackerBuilder> builder) {
        [builder setEmitter:emitter];
        [builder setAppId:appId];
        [builder setTrackerNamespace:namespace];
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
                  :(nonnull NSString *)label
                  :(nonnull NSString *)property
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

@end
