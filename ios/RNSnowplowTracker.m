//
//  RNSnowplowTracker.m
//
//  Copyright (c) 2020-2022 Snowplow Analytics Ltd. All rights reserved.
//
//  This program is licensed to you under the Apache License Version 2.0,
//  and you may not use this file except in compliance with the Apache License
//  Version 2.0. You may obtain a copy of the Apache License Version 2.0 at
//  http://www.apache.org/licenses/LICENSE-2.0.
//
//  Unless required by applicable law or agreed to in writing,
//  software distributed under the Apache License Version 2.0 is distributed on
//  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
//  express or implied. See the Apache License Version 2.0 for the specific
//  language governing permissions and limitations there under.
//
//  Copyright: Copyright (c) 2022 Snowplow Analytics Ltd
//  License: Apache License Version 2.0
//

#import "RNSnowplowTracker.h"
#import "RNConfigUtils.h"
#import "RNUtilities.h"

#import <SnowplowTracker/SPSnowplow.h>
#import <SnowplowTracker/NSDictionary+SP_TypeMethods.h>
#import <SnowplowTracker/SPUtilities.h>
#import <SnowplowTracker/SPNetworkConfiguration.h>
#import <SnowplowTracker/SPNetworkConnection.h>
#import <SnowplowTracker/SPTrackerConfiguration.h>
#import <SnowplowTracker/SPSessionConfiguration.h>
#import <SnowplowTracker/SPEmitterConfiguration.h>
#import <SnowplowTracker/SPSubjectConfiguration.h>
#import <SnowplowTracker/SPGDPRConfiguration.h>
#import <SnowplowTracker/SPGlobalContextsConfiguration.h>
#import <SnowplowTracker/SPGlobalContext.h>
#import <SnowplowTracker/SPSelfDescribingJson.h>
#import <SnowplowTracker/SPSelfDescribing.h>
#import <SnowplowTracker/SPScreenView.h>
#import <SnowplowTracker/SPPageView.h>
#import <SnowplowTracker/SPTiming.h>
#import <SnowplowTracker/SPConsentGranted.h>
#import <SnowplowTracker/SPConsentWithdrawn.h>
#import <SnowplowTracker/SPStructured.h>
#import <SnowplowTracker/SPEcommerceItem.h>
#import <SnowplowTracker/SPEcommerce.h>
#import <SnowplowTracker/SPDeepLinkReceived.h>
#import <SnowplowTracker/SPMessageNotification.h>


@implementation RNSnowplowTracker

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(createTracker:
                  (NSDictionary *)argmap
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {

    NSString *trackerNs = [argmap objectForKey:@"namespace"];
    NSDictionary *networkConfig =[argmap objectForKey:@"networkConfig"];

    // NetworkConfiguration
    NSString *method = [networkConfig sp_stringForKey:@"method" defaultValue:nil];
    SPHttpMethod httpMethod = [@"get" isEqualToString:method] ? SPHttpMethodGet : SPHttpMethodPost;
    SPNetworkConfiguration *networkConfiguration = [[SPNetworkConfiguration alloc] initWithEndpoint:networkConfig[@"endpoint"] method:httpMethod];

    // Configurations
    NSMutableArray *controllers = [NSMutableArray array];

    // TrackerConfiguration
    NSObject *trackerArg = [argmap objectForKey:@"trackerConfig"];
    if (trackerArg !=nil && [trackerArg isKindOfClass:NSDictionary.class]) {
        SPTrackerConfiguration *trackerConfiguration = [RNConfigUtils mkTrackerConfig:(NSDictionary *)trackerArg];
        [controllers addObject:trackerConfiguration];
    }

    // SessionConfiguration
    NSObject *sessionArg = [argmap objectForKey:@"sessionConfig"];
    if (sessionArg !=nil && [sessionArg isKindOfClass:NSDictionary.class]) {
        SPSessionConfiguration *sessionConfiguration = [RNConfigUtils mkSessionConfig:(NSDictionary *)sessionArg];
        [controllers addObject:sessionConfiguration];
    }

    // EmitterConfiguration
    NSObject *emitterArg = [argmap objectForKey:@"emitterConfig"];
    if (emitterArg !=nil && [emitterArg isKindOfClass:NSDictionary.class]) {
        SPEmitterConfiguration *emitterConfiguration = [RNConfigUtils mkEmitterConfig:(NSDictionary *)emitterArg];
        [controllers addObject:emitterConfiguration];
    }

    // SubjectConfiguration
    NSObject *subjectArg = [argmap objectForKey:@"subjectConfig"];
    if (subjectArg != nil && [subjectArg isKindOfClass:NSDictionary.class]) {
        SPSubjectConfiguration *subjectConfiguration = [RNConfigUtils mkSubjectConfig:(NSDictionary *)subjectArg];
        [controllers addObject:subjectConfiguration];
    }

    // GdprConfiguration
    NSObject *gdprArg = [argmap objectForKey:@"gdprConfig"];
    if (gdprArg != nil && [gdprArg isKindOfClass:NSDictionary.class]) {
        SPGDPRConfiguration *gdprConfiguration = [RNConfigUtils mkGdprConfig:(NSDictionary *)gdprArg];
        [controllers addObject:gdprConfiguration];
    }

    // GConfiguration
    NSObject *gcArg = [argmap objectForKey:@"gcConfig"];
    if (gcArg != nil && [gcArg isKindOfClass:NSArray.class]) {
        SPGlobalContextsConfiguration *gcConfiguration = [RNConfigUtils mkGCConfig:(NSArray *)gcArg];
        [controllers addObject:gcConfiguration];
    }

    id<SPTrackerController> tracker = [SPSnowplow createTrackerWithNamespace:trackerNs network:networkConfiguration configurations:controllers];

    if (tracker) {
        resolve(@YES);
    } else {
        NSError* error = [NSError errorWithDomain:@"SnowplowTracker" code:200 userInfo:nil];
        reject(@"ERROR", @"tracker initialization failed", error);
    }
}

RCT_EXPORT_METHOD(removeTracker: (NSDictionary *)details
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *namespace = [details objectForKey:@"tracker"];
    id<SPTrackerController> trackerController = [SPSnowplow trackerByNamespace:namespace];
    BOOL removed = [SPSnowplow removeTracker:trackerController];
    resolve(@(removed));
}

RCT_EXPORT_METHOD(removeAllTrackers: (RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    [SPSnowplow removeAllTrackers];
    resolve(@YES);
}

RCT_EXPORT_METHOD(trackSelfDescribingEvent:
                  (NSDictionary *)details
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *namespace = [details objectForKey:@"tracker"];
    id<SPTrackerController> trackerController = [SPSnowplow trackerByNamespace:namespace];

    if (trackerController != nil) {
        NSDictionary *argmap = [details objectForKey:@"eventData"];
        NSArray<NSDictionary *> *contexts = [details objectForKey:@"contexts"];

        SPSelfDescribingJson *eventData = [[SPSelfDescribingJson alloc] initWithSchema:(NSString *)[argmap objectForKey:@"schema"]
                                                                         andDictionary:(NSDictionary *)[argmap objectForKey:@"data"]];

        SPSelfDescribing *event = [[SPSelfDescribing alloc] initWithEventData:eventData];
        [event contexts:[RNUtilities mkSDJArray:contexts]];
        [trackerController track:event];
        resolve(@YES);
    } else {
        NSError* error = [NSError errorWithDomain:@"SnowplowTracker" code:200 userInfo:nil];
        reject(@"ERROR", @"tracker with given namespace not found", error);
    }
}

RCT_EXPORT_METHOD(trackStructuredEvent:
                  (NSDictionary *)details
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *namespace = [details objectForKey:@"tracker"];
    id<SPTrackerController> trackerController = [SPSnowplow trackerByNamespace:namespace];

    if (trackerController != nil) {
        NSDictionary *argmap = [details objectForKey:@"eventData"];
        NSArray<NSDictionary *> *contexts = [details objectForKey:@"contexts"];

        NSString *category = [argmap sp_stringForKey:@"category" defaultValue:nil];
        NSString *action = [argmap sp_stringForKey:@"action" defaultValue:nil];
        SPStructured *event = [[SPStructured alloc] initWithCategory:category
                                                              action:action];
        NSString *label = [argmap sp_stringForKey:@"label" defaultValue:nil];
        if (label) {
            event.label = label;
        }
        NSString *property = [argmap sp_stringForKey:@"property" defaultValue:nil];
        if (property) {
            event.property = property;
        }
        NSNumber *value = [argmap sp_numberForKey:@"value" defaultValue:nil];
        if (label) {
            event.value = value;
        }

        [event contexts:[RNUtilities mkSDJArray:contexts]];
        [trackerController track:event];
        resolve(@YES);
    } else {
        NSError* error = [NSError errorWithDomain:@"SnowplowTracker" code:200 userInfo:nil];
        reject(@"ERROR", @"tracker with given namespace not found", error);
    }
}

RCT_EXPORT_METHOD(trackScreenViewEvent:
                  (NSDictionary *)details
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *namespace = [details objectForKey:@"tracker"];
    id<SPTrackerController> trackerController = [SPSnowplow trackerByNamespace:namespace];

    if (trackerController != nil) {
        NSDictionary *argmap = [details objectForKey:@"eventData"];
        NSArray<NSDictionary *> *contexts = [details objectForKey:@"contexts"];

        NSString *screenName = [argmap sp_stringForKey:@"name" defaultValue:nil];
        NSString *screenId = [argmap sp_stringForKey:@"id" defaultValue:nil];
        NSUUID *screenUuid = [[NSUUID alloc] initWithUUIDString:screenId];
        if (screenId != nil && screenUuid == nil) {
            NSError* error = [NSError errorWithDomain:@"SnowplowTracker" code:200 userInfo:nil];
            reject(@"ERROR", @"screenId has to be a valid UUID string", error);
        }
        SPScreenView *event = [[SPScreenView alloc] initWithName:screenName
                                                        screenId:screenUuid];

        NSString *type = [argmap sp_stringForKey:@"type" defaultValue:nil];
        if (type) {
            event.type = type;
        }
        NSString *previousName = [argmap sp_stringForKey:@"previousName" defaultValue:nil];
        if (previousName) {
            event.previousName = previousName;
        }
        NSString *previousId = [argmap sp_stringForKey:@"previousId" defaultValue:nil];
        if (previousId) {
            event.previousId = previousId;
        }
        NSString *previousType = [argmap sp_stringForKey:@"previousType" defaultValue:nil];
        if (previousType) {
            event.previousType = previousType;
        }
        NSString *transitionType = [argmap sp_stringForKey:@"transitionType" defaultValue:nil];
        if (transitionType) {
            event.transitionType = transitionType;
        }

        [event contexts:[RNUtilities mkSDJArray:contexts]];
        [trackerController track:event];
        resolve(@YES);
    } else {
        NSError* error = [NSError errorWithDomain:@"SnowplowTracker" code:200 userInfo:nil];
        reject(@"ERROR", @"tracker with given namespace not found", error);
    }
}

RCT_EXPORT_METHOD(trackPageViewEvent:
                  (NSDictionary *)details
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *namespace = [details objectForKey:@"tracker"];
    id<SPTrackerController> trackerController = [SPSnowplow trackerByNamespace:namespace];

    if (trackerController != nil) {
        NSDictionary *argmap = [details objectForKey:@"eventData"];
        NSArray<NSDictionary *> *contexts = [details objectForKey:@"contexts"];

        NSString *pageUrl = [argmap sp_stringForKey:@"pageUrl" defaultValue:nil];
        SPPageView *event = [[SPPageView alloc] initWithPageUrl:pageUrl];

        NSString *pageTitle = [argmap sp_stringForKey:@"pageTitle" defaultValue:nil];
        if (pageTitle) {
            event.pageTitle = pageTitle;
        }
        NSString *referrer = [argmap sp_stringForKey:@"referrer" defaultValue:nil];
        if (referrer) {
            event.referrer = referrer;
        }

        [event contexts:[RNUtilities mkSDJArray:contexts]];
        [trackerController track:event];
        resolve(@YES);
    } else {
        NSError* error = [NSError errorWithDomain:@"SnowplowTracker" code:200 userInfo:nil];
        reject(@"ERROR", @"tracker with given namespace not found", error);
    }
}

RCT_EXPORT_METHOD(trackTimingEvent:
                  (NSDictionary *)details
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *namespace = [details objectForKey:@"tracker"];
    id<SPTrackerController> trackerController = [SPSnowplow trackerByNamespace:namespace];

    if (trackerController != nil) {
        NSDictionary *argmap = [details objectForKey:@"eventData"];
        NSArray<NSDictionary *> *contexts = [details objectForKey:@"contexts"];

        NSString *category = [argmap sp_stringForKey:@"category" defaultValue:nil];
        NSString *variable = [argmap sp_stringForKey:@"variable" defaultValue:nil];
        NSNumber *timing = [argmap sp_numberForKey:@"timing" defaultValue:nil];
        SPTiming *event = [[SPTiming alloc] initWithCategory:category
                                                    variable:variable
                                                      timing:timing];
        NSString *label = [argmap sp_stringForKey:@"label" defaultValue:nil];
        if (label) {
            event.label = label;
        }

        [event contexts:[RNUtilities mkSDJArray:contexts]];
        [trackerController track:event];
        resolve(@YES);
    } else {
        NSError* error = [NSError errorWithDomain:@"SnowplowTracker" code:200 userInfo:nil];
        reject(@"ERROR", @"tracker with given namespace not found", error);
    }
}

RCT_EXPORT_METHOD(trackConsentGrantedEvent:
                  (NSDictionary *)details
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *namespace = [details objectForKey:@"tracker"];
    id<SPTrackerController> trackerController = [SPSnowplow trackerByNamespace:namespace];

    if (trackerController != nil) {
        NSDictionary *argmap = [details objectForKey:@"eventData"];
        NSArray<NSDictionary *> *contexts = [details objectForKey:@"contexts"];

        NSString *expiry = [argmap sp_stringForKey:@"expiry" defaultValue:nil];
        NSString *documentId = [argmap sp_stringForKey:@"documentId" defaultValue:nil];
        NSString *version = [argmap sp_stringForKey:@"version" defaultValue:nil];
        SPConsentGranted *event = [[SPConsentGranted alloc] initWithExpiry:expiry
                                                                documentId:documentId
                                                                   version:version];

        NSString *name = [argmap sp_stringForKey:@"name" defaultValue:nil];
        if (name) {
            event.name = name;
        }
        NSString *documentDescription = [argmap sp_stringForKey:@"documentDescription" defaultValue:nil];
        if (documentDescription) {
            event.documentDescription = documentDescription;
        }

        [event contexts:[RNUtilities mkSDJArray:contexts]];
        [trackerController track:event];
        resolve(@YES);
    } else {
        NSError* error = [NSError errorWithDomain:@"SnowplowTracker" code:200 userInfo:nil];
        reject(@"ERROR", @"tracker with given namespace not found", error);
    }
}

RCT_EXPORT_METHOD(trackConsentWithdrawnEvent:
                  (NSDictionary *)details
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *namespace = [details objectForKey:@"tracker"];
    id<SPTrackerController> trackerController = [SPSnowplow trackerByNamespace:namespace];

    if (trackerController != nil) {
        NSDictionary *argmap = [details objectForKey:@"eventData"];
        NSArray<NSDictionary *> *contexts = [details objectForKey:@"contexts"];

        SPConsentWithdrawn *event = [SPConsentWithdrawn new];

        BOOL all = [argmap sp_boolForKey:@"all" defaultValue:nil];
        event.all = all;
        NSString *documentId = [argmap sp_stringForKey:@"documentId" defaultValue:nil];
        event.documentId = documentId;
        NSString *version = [argmap sp_stringForKey:@"version" defaultValue:nil];
        event.version = version;
        NSString *name = [argmap sp_stringForKey:@"name" defaultValue:nil];
        if (name) {
            event.name = name;
        }
        NSString *documentDescription = [argmap sp_stringForKey:@"documentDescription" defaultValue:nil];
        if (documentDescription) {
            event.documentDescription = documentDescription;
        }

        [event contexts:[RNUtilities mkSDJArray:contexts]];
        [trackerController track:event];
        resolve(@YES);
    } else {
        NSError* error = [NSError errorWithDomain:@"SnowplowTracker" code:200 userInfo:nil];
        reject(@"ERROR", @"tracker with given namespace not found", error);
    }
}

RCT_EXPORT_METHOD(trackEcommerceTransactionEvent:
                  (NSDictionary *)details
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *namespace = [details objectForKey:@"tracker"];
    id<SPTrackerController> trackerController = [SPSnowplow trackerByNamespace:namespace];

    if (trackerController != nil) {
        NSDictionary *argmap = [details objectForKey:@"eventData"];
        NSArray<NSDictionary *> *contexts = [details objectForKey:@"contexts"];

        NSString *orderId = [argmap sp_stringForKey:@"orderId" defaultValue:nil];
        NSNumber *totalValue = [argmap sp_numberForKey:@"totalValue" defaultValue:nil];
        NSArray *items = [argmap objectForKey:@"items"];

        NSMutableArray *transItems = [NSMutableArray new];
        for (NSDictionary* item in items) {
            NSString *sku = [item sp_stringForKey:@"sku" defaultValue:nil];
            NSNumber *price = [item sp_numberForKey:@"price" defaultValue:nil];
            NSNumber *quantity = [item sp_numberForKey:@"quantity" defaultValue:nil];
            SPEcommerceItem *ecomItem = [[SPEcommerceItem alloc] initWithSku:sku
                                                                       price:price
                                                                    quantity:quantity];

            NSString *name = [argmap sp_stringForKey:@"name" defaultValue:nil];
            if (name) {
                ecomItem.name = name;
            }
            NSString *category = [argmap sp_stringForKey:@"category" defaultValue:nil];
            if (category) {
                ecomItem.category = category;
            }
            NSString *currency = [argmap sp_stringForKey:@"currency" defaultValue:nil];
            if (currency) {
                ecomItem.currency = currency;
            }

            [transItems addObject:ecomItem];
        }

        SPEcommerce *event = [[SPEcommerce alloc] initWithOrderId:orderId
                                                       totalValue:totalValue
                                                            items:(NSArray<SPEcommerceItem *> *)transItems];
        [event contexts:[RNUtilities mkSDJArray:contexts]];
        [trackerController track:event];
        resolve(@YES);

    } else {
        NSError* error = [NSError errorWithDomain:@"SnowplowTracker" code:200 userInfo:nil];
        reject(@"ERROR", @"tracker with given namespace not found", error);
    }
}

RCT_EXPORT_METHOD(trackDeepLinkReceivedEvent:
    (NSDictionary *)details
            resolver:(RCTPromiseResolveBlock)resolve
            rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *namespace = [details objectForKey:@"tracker"];
    id<SPTrackerController> trackerController = [SPSnowplow trackerByNamespace:namespace];

    if (trackerController != nil) {
        NSDictionary *argmap = [details objectForKey:@"eventData"];
        NSArray<NSDictionary *> *contexts = [details objectForKey:@"contexts"];

        NSString *url = [argmap sp_stringForKey:@"url" defaultValue:nil];
        SPDeepLinkReceived *event = [[SPDeepLinkReceived alloc] initWithUrl:url];

        NSString *referrer = [argmap sp_stringForKey:@"referrer" defaultValue:nil];
        if (referrer) {
            event.referrer = referrer;
        }

        [event contexts:[RNUtilities mkSDJArray:contexts]];
        [trackerController track:event];
        resolve(@YES);
    } else {
        NSError* error = [NSError errorWithDomain:@"SnowplowTracker" code:200 userInfo:nil];
        reject(@"ERROR", @"tracker with given namespace not found", error);
    }
}

RCT_EXPORT_METHOD(trackMessageNotificationEvent:
    (NSDictionary *)details
            resolver:(RCTPromiseResolveBlock)resolve
            rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *namespace = [details objectForKey:@"tracker"];
    id<SPTrackerController> trackerController = [SPSnowplow trackerByNamespace:namespace];

    if (trackerController != nil) {
        NSDictionary *argmap = [details objectForKey:@"eventData"];
        NSArray<NSDictionary *> *contexts = [details objectForKey:@"contexts"];

        NSString *title = [argmap sp_stringForKey:@"title" defaultValue:nil];
        NSString *body = [argmap sp_stringForKey:@"body" defaultValue:nil];
        NSString *triggerStr = [argmap sp_stringForKey:@"trigger" defaultValue:nil];
        SPMessageNotificationTrigger trigger;
        if ([triggerStr isEqualToString:@"push"]) {
            trigger = SPMessageNotificationTriggerPush;
        } else if ([triggerStr isEqualToString:@"location"]) {
            trigger = SPMessageNotificationTriggerLocation;
        } else if ([triggerStr isEqualToString:@"calendar"]) {
            trigger = SPMessageNotificationTriggerCalendar;
        } else if ([triggerStr isEqualToString:@"timeInterval"]) {
            trigger = SPMessageNotificationTriggerTimeInterval;
        } else {
            trigger = SPMessageNotificationTriggerOther;
        }
        SPMessageNotification *event = [[SPMessageNotification alloc] initWithTitle: title
                                                                               body: body
                                                                            trigger: trigger];

        NSString *action = [argmap sp_stringForKey:@"action" defaultValue:nil];
        if (action) {
            event.action = action;
        }
        NSArray *attachmentsMap = [argmap objectForKey:@"attachments"];
        if (attachmentsMap) {
            NSMutableArray *attachments = [NSMutableArray new];
            for (NSDictionary* attachmentMap in attachmentsMap) {
                NSString *identifier = [attachmentMap sp_stringForKey:@"identifier" defaultValue:nil];
                NSString *type = [attachmentMap sp_stringForKey:@"type" defaultValue:nil];
                NSString *url = [attachmentMap sp_stringForKey:@"url" defaultValue:nil];
                SPMessageNotificationAttachment *attachment = [[SPMessageNotificationAttachment alloc] initWithIdentifier:identifier
                                                                                                                     type:type
                                                                                                                      url:url];
                [attachments addObject:attachment];
            }
            event.attachments = attachments;
        }
        NSArray<NSString *> *bodyLocArgs = [argmap objectForKey:@"bodyLocArgs"];
        if (bodyLocArgs) {
            event.bodyLocArgs = bodyLocArgs;
        }
        NSString *bodyLocKey = [argmap sp_stringForKey:@"bodyLocKey" defaultValue:nil];
        if (bodyLocKey) {
            event.bodyLocKey = bodyLocKey;
        }
        NSString *category = [argmap sp_stringForKey:@"category" defaultValue:nil];
        if (category) {
            event.category = category;
        }
        NSNumber *contentAvailable = [argmap sp_numberForKey:@"contentAvailable" defaultValue:nil];
        if (contentAvailable != nil) {
            event.contentAvailable = contentAvailable;
        }
        NSString *group = [argmap sp_stringForKey:@"group" defaultValue:nil];
        if (group) {
            event.group = group;
        }
        NSString *icon = [argmap sp_stringForKey:@"icon" defaultValue:nil];
        if (icon) {
            event.icon = icon;
        }
        NSNumber *notificationCount = [argmap sp_numberForKey:@"notificationCount" defaultValue:nil];
        if (notificationCount) {
            event.notificationCount = notificationCount;
        }
        NSString *notificationTimestamp = [argmap sp_stringForKey:@"notificationTimestamp" defaultValue:nil];
        if (notificationTimestamp) {
            event.notificationTimestamp = notificationTimestamp;
        }
        NSString *sound = [argmap sp_stringForKey:@"sound" defaultValue:nil];
        if (sound) {
            event.sound = sound;
        }
        NSString *subtitle = [argmap sp_stringForKey:@"subtitle" defaultValue:nil];
        if (subtitle) {
            event.subtitle = subtitle;
        }
        NSString *tag = [argmap sp_stringForKey:@"tag" defaultValue:nil];
        if (tag) {
            event.tag = tag;
        }
        NSString *threadIdentifier = [argmap sp_stringForKey:@"threadIdentifier" defaultValue:nil];
        if (threadIdentifier) {
            event.threadIdentifier = threadIdentifier;
        }
        NSArray<NSString *> *titleLocArgs = [argmap objectForKey:@"titleLocArgs"];
        if (titleLocArgs) {
            event.titleLocArgs = titleLocArgs;
        }
        NSString *titleLocKey = [argmap sp_stringForKey:@"titleLocKey" defaultValue:nil];
        if (titleLocKey) {
            event.titleLocKey = titleLocKey;
        }

        [event contexts:[RNUtilities mkSDJArray:contexts]];
        [trackerController track:event];
        resolve(@YES);
    } else {
        NSError* error = [NSError errorWithDomain:@"SnowplowTracker" code:200 userInfo:nil];
        reject(@"ERROR", @"tracker with given namespace not found", error);
    }
}

RCT_EXPORT_METHOD(removeGlobalContexts:
                  (NSDictionary *)details
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *namespace = [details objectForKey:@"tracker"];
    id<SPTrackerController> trackerController = [SPSnowplow trackerByNamespace:namespace];

    if (trackerController != nil) {
        NSString *tag = [details objectForKey:@"removeTag"];
        [[trackerController globalContexts] removeWithTag:tag];
        resolve(@YES);
    } else {
        NSError* error = [NSError errorWithDomain:@"SnowplowTracker" code:200 userInfo:nil];
        reject(@"ERROR", @"tracker with given namespace not found", error);
    }
}

RCT_EXPORT_METHOD(addGlobalContexts:
                  (NSDictionary *)details
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *namespace = [details objectForKey:@"tracker"];
    id<SPTrackerController> trackerController = [SPSnowplow trackerByNamespace:namespace];

    if (trackerController != nil) {
        NSDictionary *gcArg = [details objectForKey:@"addGlobalContext"];
        NSString *tag = [gcArg objectForKey:@"tag"];
        NSArray *globalContexts = [gcArg objectForKey:@"globalContexts"];

        NSArray *staticContexts = [[RNUtilities mkSDJArray:globalContexts] mutableCopy];
        SPGlobalContext *gcStatic = [[SPGlobalContext alloc] initWithStaticContexts:staticContexts];

        [[trackerController globalContexts] addWithTag:tag contextGenerator:gcStatic];
        resolve(@YES);
    } else {
        NSError* error = [NSError errorWithDomain:@"SnowplowTracker" code:200 userInfo:nil];
        reject(@"ERROR", @"tracker with given namespace not found", error);
    }
}

RCT_EXPORT_METHOD(setUserId:
                  (NSDictionary *)details
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *namespace = [details objectForKey:@"tracker"];
    id<SPTrackerController> trackerController = [SPSnowplow trackerByNamespace:namespace];

    if (trackerController != nil) {
        NSString *newUid = [details sp_stringForKey:@"userId" defaultValue:nil];
        [trackerController.subject setUserId:newUid];
        resolve(@YES);
    } else {
        NSError* error = [NSError errorWithDomain:@"SnowplowTracker" code:200 userInfo:nil];
        reject(@"ERROR", @"tracker with given namespace not found", error);
    }
}

RCT_EXPORT_METHOD(setNetworkUserId:
                  (NSDictionary *)details
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *namespace = [details objectForKey:@"tracker"];
    id<SPTrackerController> trackerController = [SPSnowplow trackerByNamespace:namespace];

    if (trackerController != nil) {
        NSString *newNuid = [details sp_stringForKey:@"networkUserId" defaultValue:nil];
        [trackerController.subject setNetworkUserId:newNuid];
        resolve(@YES);
    } else {
        NSError* error = [NSError errorWithDomain:@"SnowplowTracker" code:200 userInfo:nil];
        reject(@"ERROR", @"tracker with given namespace not found", error);
    }
}

RCT_EXPORT_METHOD(setDomainUserId:
                  (NSDictionary *)details
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *namespace = [details objectForKey:@"tracker"];
    id<SPTrackerController> trackerController = [SPSnowplow trackerByNamespace:namespace];

    if (trackerController != nil) {
        NSString *newDuid = [details sp_stringForKey:@"domainUserId" defaultValue:nil];
        [trackerController.subject setDomainUserId:newDuid];
        resolve(@YES);
    } else {
        NSError* error = [NSError errorWithDomain:@"SnowplowTracker" code:200 userInfo:nil];
        reject(@"ERROR", @"tracker with given namespace not found", error);
    }
}

RCT_EXPORT_METHOD(setIpAddress:
                  (NSDictionary *)details
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *namespace = [details objectForKey:@"tracker"];
    id<SPTrackerController> trackerController = [SPSnowplow trackerByNamespace:namespace];

    if (trackerController != nil) {
        NSString *newIp = [details sp_stringForKey:@"ipAddress" defaultValue:nil];
        [trackerController.subject setIpAddress:newIp];
        resolve(@YES);
    } else {
        NSError* error = [NSError errorWithDomain:@"SnowplowTracker" code:200 userInfo:nil];
        reject(@"ERROR", @"tracker with given namespace not found", error);
    }
}

RCT_EXPORT_METHOD(setUseragent:
                  (NSDictionary *)details
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *namespace = [details objectForKey:@"tracker"];
    id<SPTrackerController> trackerController = [SPSnowplow trackerByNamespace:namespace];

    if (trackerController != nil) {
        NSString *newUagent = [details sp_stringForKey:@"useragent" defaultValue:nil];
        [trackerController.subject setUseragent:newUagent];
        resolve(@YES);
    } else {
        NSError* error = [NSError errorWithDomain:@"SnowplowTracker" code:200 userInfo:nil];
        reject(@"ERROR", @"tracker with given namespace not found", error);
    }
}

RCT_EXPORT_METHOD(setTimezone:
                  (NSDictionary *)details
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *namespace = [details objectForKey:@"tracker"];
    id<SPTrackerController> trackerController = [SPSnowplow trackerByNamespace:namespace];

    if (trackerController != nil) {
        NSString *newTz = [details sp_stringForKey:@"timezone" defaultValue:nil];
        [trackerController.subject setTimezone:newTz];
        resolve(@YES);
    } else {
        NSError* error = [NSError errorWithDomain:@"SnowplowTracker" code:200 userInfo:nil];
        reject(@"ERROR", @"tracker with given namespace not found", error);
    }
}

RCT_EXPORT_METHOD(setLanguage:
                  (NSDictionary *)details
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *namespace = [details objectForKey:@"tracker"];
    id<SPTrackerController> trackerController = [SPSnowplow trackerByNamespace:namespace];

    if (trackerController != nil) {
        NSString *newLang = [details sp_stringForKey:@"language" defaultValue:nil];
        [trackerController.subject setLanguage:newLang];
        resolve(@YES);
    } else {
        NSError* error = [NSError errorWithDomain:@"SnowplowTracker" code:200 userInfo:nil];
        reject(@"ERROR", @"tracker with given namespace not found", error);
    }
}

RCT_EXPORT_METHOD(setScreenResolution:
                  (NSDictionary *)details
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *namespace = [details objectForKey:@"tracker"];
    id<SPTrackerController> trackerController = [SPSnowplow trackerByNamespace:namespace];

    if (trackerController != nil) {
        NSObject *newRes = [details objectForKey:@"screenResolution"];
        if (newRes == [NSNull null]) {
            [trackerController.subject setScreenResolution:nil];
        } else {
            NSNumber *resWidth = [(NSArray *)newRes objectAtIndex:0];
            NSNumber *resHeight = [(NSArray *)newRes objectAtIndex:1];
            SPSize *resSize = [[SPSize alloc] initWithWidth:[resWidth integerValue] height:[resHeight integerValue]];
            [trackerController.subject setScreenResolution:resSize];
        }
        resolve(@YES);
    } else {
        NSError* error = [NSError errorWithDomain:@"SnowplowTracker" code:200 userInfo:nil];
        reject(@"ERROR", @"tracker with given namespace not found", error);
    }
}

RCT_EXPORT_METHOD(setScreenViewport:
                  (NSDictionary *)details
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *namespace = [details objectForKey:@"tracker"];
    id<SPTrackerController> trackerController = [SPSnowplow trackerByNamespace:namespace];

    if (trackerController != nil) {
        NSObject *newView = [details objectForKey:@"screenViewport"];
        if (newView == [NSNull null]) {
            [trackerController.subject setScreenViewPort:nil];
        } else {
            NSNumber *vpWidth = [(NSArray *)newView objectAtIndex:0];
            NSNumber *vpHeight = [(NSArray *)newView objectAtIndex:1];
            SPSize *vpSize = [[SPSize alloc] initWithWidth:[vpWidth integerValue] height:[vpHeight integerValue]];
            [trackerController.subject setScreenViewPort:vpSize];
        }
        resolve(@YES);
    } else {
        NSError* error = [NSError errorWithDomain:@"SnowplowTracker" code:200 userInfo:nil];
        reject(@"ERROR", @"tracker with given namespace not found", error);
    }
}

RCT_EXPORT_METHOD(setColorDepth:
                  (NSDictionary *)details
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *namespace = [details objectForKey:@"tracker"];
    id<SPTrackerController> trackerController = [SPSnowplow trackerByNamespace:namespace];

    if (trackerController != nil) {
        NSNumber *newColorD = [details sp_numberForKey:@"colorDepth" defaultValue:nil];
        [trackerController.subject setColorDepth:newColorD];
        resolve(@YES);
    } else {
        NSError* error = [NSError errorWithDomain:@"SnowplowTracker" code:200 userInfo:nil];
        reject(@"ERROR", @"tracker with given namespace not found", error);
    }
}

RCT_EXPORT_METHOD(getSessionUserId:
                  (NSDictionary *)details
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *namespace = [details objectForKey:@"tracker"];
    id<SPTrackerController> trackerController = [SPSnowplow trackerByNamespace:namespace];

    if (trackerController != nil) {
        NSString *suid = [trackerController.session userId];
        resolve(suid);
    } else {
        NSError* error = [NSError errorWithDomain:@"SnowplowTracker" code:200 userInfo:nil];
        reject(@"ERROR", @"tracker with given namespace not found", error);
    }
}

RCT_EXPORT_METHOD(getSessionId:
                  (NSDictionary *)details
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *namespace = [details objectForKey:@"tracker"];
    id<SPTrackerController> trackerController = [SPSnowplow trackerByNamespace:namespace];

    if (trackerController != nil) {
        NSString *sid = [trackerController.session sessionId];
        resolve(sid);
    } else {
        NSError* error = [NSError errorWithDomain:@"SnowplowTracker" code:200 userInfo:nil];
        reject(@"ERROR", @"tracker with given namespace not found", error);
    }
}

RCT_EXPORT_METHOD(getSessionIndex:
                  (NSDictionary *)details
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *namespace = [details objectForKey:@"tracker"];
    id<SPTrackerController> trackerController = [SPSnowplow trackerByNamespace:namespace];

    if (trackerController != nil) {
        NSInteger sidx = [trackerController.session sessionIndex];
        resolve(@(sidx));
    } else {
        NSError* error = [NSError errorWithDomain:@"SnowplowTracker" code:200 userInfo:nil];
        reject(@"ERROR", @"tracker with given namespace not found", error);
    }
}

RCT_EXPORT_METHOD(getIsInBackground:
                  (NSDictionary *)details
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *namespace = [details objectForKey:@"tracker"];
    id<SPTrackerController> trackerController = [SPSnowplow trackerByNamespace:namespace];

    if (trackerController != nil) {
        BOOL isInBg = [trackerController.session isInBackground];
        resolve(@(isInBg));
    } else {
        NSError* error = [NSError errorWithDomain:@"SnowplowTracker" code:200 userInfo:nil];
        reject(@"ERROR", @"tracker with given namespace not found", error);
    }
}

RCT_EXPORT_METHOD(getBackgroundIndex:
                  (NSDictionary *)details
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *namespace = [details objectForKey:@"tracker"];
    id<SPTrackerController> trackerController = [SPSnowplow trackerByNamespace:namespace];

    if (trackerController != nil) {
        NSInteger bgIdx = [trackerController.session backgroundIndex];
        resolve(@(bgIdx));
    } else {
        NSError* error = [NSError errorWithDomain:@"SnowplowTracker" code:200 userInfo:nil];
        reject(@"ERROR", @"tracker with given namespace not found", error);
    }
}

RCT_EXPORT_METHOD(getForegroundIndex:
                  (NSDictionary *)details
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *namespace = [details objectForKey:@"tracker"];
    id<SPTrackerController> trackerController = [SPSnowplow trackerByNamespace:namespace];

    if (trackerController != nil) {
        NSInteger fgIdx = [trackerController.session foregroundIndex];
        resolve(@(fgIdx));
    } else {
        NSError* error = [NSError errorWithDomain:@"SnowplowTracker" code:200 userInfo:nil];
        reject(@"ERROR", @"tracker with given namespace not found", error);
    }
}

@end
