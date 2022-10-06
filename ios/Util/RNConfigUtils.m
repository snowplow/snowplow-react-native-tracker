//
//  RNConfigUtils.m
//
//  Copyright (c) 2021-2022 Snowplow Analytics Ltd. All rights reserved.
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

#import "RNConfigUtils.h"
#import "RNTrackerVersion.h"
#import "RNUtilities.h"
#import "NSDictionary+RNSP_TypeMethods.h"

#import <Foundation/Foundation.h>

#import <SnowplowTracker/SPSnowplow.h>
#import <SnowplowTracker/SPTrackerConfiguration.h>
#import <SnowplowTracker/SPDevicePlatform.h>
#import <SnowplowTracker/SPLoggerDelegate.h>
#import <SnowplowTracker/SPSessionConfiguration.h>
#import <SnowplowTracker/SPEmitterConfiguration.h>
#import <SnowplowTracker/SPSubjectConfiguration.h>
#import <SnowplowTracker/SPGDPRConfiguration.h>
#import <SnowplowTracker/SPGlobalContextsConfiguration.h>

@implementation RNConfigUtils

+ (SPTrackerConfiguration *) mkTrackerConfig:(NSDictionary *) trackerConfig {
    SPTrackerConfiguration *trackerConfiguration = [SPTrackerConfiguration new];
    trackerConfiguration.trackerVersionSuffix = kRNTrackerVersion;

    NSString *appId = [trackerConfig rnsp_stringForKey:@"appId" defaultValue:nil];
    if (appId) {
        trackerConfiguration.appId = appId;
    }

    NSString *devicePlatform = [trackerConfig rnsp_stringForKey:@"devicePlatform" defaultValue:nil];
    if (devicePlatform) {
        trackerConfiguration.devicePlatform = SPStringToDevicePlatform(devicePlatform);
    }

    trackerConfiguration.base64Encoding = [trackerConfig rnsp_boolForKey:@"base64Encoding" defaultValue:YES];

    NSString *logLevel = [trackerConfig rnsp_stringForKey:@"logLevel" defaultValue:nil];
    if (logLevel) {
        NSUInteger index = [@[@"off", @"error", @"debug", @"verbose"] indexOfObject:logLevel];
        trackerConfiguration.logLevel = index != NSNotFound ? index : SPLogLevelOff;
    }

    trackerConfiguration.sessionContext = [trackerConfig rnsp_boolForKey:@"sessionContext" defaultValue:YES];
    trackerConfiguration.applicationContext = [trackerConfig rnsp_boolForKey:@"applicationContext" defaultValue:YES];
    trackerConfiguration.platformContext = [trackerConfig rnsp_boolForKey:@"platformContext" defaultValue:YES];
    trackerConfiguration.geoLocationContext = [trackerConfig rnsp_boolForKey:@"geoLocationContext" defaultValue:NO];
    trackerConfiguration.screenContext = [trackerConfig rnsp_boolForKey:@"screenContext" defaultValue:YES];
    trackerConfiguration.deepLinkContext = [trackerConfig rnsp_boolForKey:@"deepLinkContext" defaultValue:YES];
    trackerConfiguration.screenViewAutotracking = [trackerConfig rnsp_boolForKey:@"screenViewAutotracking" defaultValue:YES];
    trackerConfiguration.lifecycleAutotracking = [trackerConfig rnsp_boolForKey:@"lifecycleAutotracking" defaultValue:NO];
    trackerConfiguration.installAutotracking = [trackerConfig rnsp_boolForKey:@"installAutotracking" defaultValue:YES];
    trackerConfiguration.exceptionAutotracking = [trackerConfig rnsp_boolForKey:@"exceptionAutotracking" defaultValue:YES];
    trackerConfiguration.diagnosticAutotracking = [trackerConfig rnsp_boolForKey:@"diagnosticAutotracking" defaultValue:NO];
    trackerConfiguration.userAnonymisation = [trackerConfig rnsp_boolForKey:@"userAnonymisation" defaultValue:NO];

    return trackerConfiguration;
}

+ (SPSessionConfiguration *) mkSessionConfig:(NSDictionary *) sessionConfig {

    NSInteger foreground = [[sessionConfig rnsp_numberForKey:@"foregroundTimeout" defaultValue:@1800] integerValue];
    NSInteger background = [[sessionConfig rnsp_numberForKey:@"backgroundTimeout" defaultValue:@1800] integerValue];
    SPSessionConfiguration *sessionConfiguration = [[SPSessionConfiguration alloc] initWithForegroundTimeoutInSeconds:foreground backgroundTimeoutInSeconds:background];

    return sessionConfiguration;
}

+ (SPEmitterConfiguration *) mkEmitterConfig:(NSDictionary *) emitterConfig {
    SPEmitterConfiguration *emitterConfiguration = [[SPEmitterConfiguration alloc] init];
    NSString *bufferOption = [emitterConfig rnsp_stringForKey:@"bufferOption" defaultValue:@"single"];
    if ([bufferOption isEqualToString:@"default"]) {
        emitterConfiguration.bufferOption = SPBufferOptionDefaultGroup;
    } else if ([bufferOption isEqualToString:@"large"]) {
        emitterConfiguration.bufferOption = SPBufferOptionLargeGroup;
    } else {
        emitterConfiguration.bufferOption = SPBufferOptionSingle;
    }

    emitterConfiguration.emitRange = [[emitterConfig rnsp_numberForKey:@"emitRange" defaultValue:@150] integerValue];
    emitterConfiguration.threadPoolSize = [[emitterConfig rnsp_numberForKey:@"threadPoolSize" defaultValue:@15] integerValue];
    emitterConfiguration.byteLimitGet = [[emitterConfig rnsp_numberForKey:@"byteLimitGet" defaultValue:@40000] integerValue];
    emitterConfiguration.byteLimitPost = [[emitterConfig rnsp_numberForKey:@"byteLimitPost" defaultValue:@40000] integerValue];
    emitterConfiguration.serverAnonymisation = [emitterConfig rnsp_boolForKey:@"serverAnonymisation" defaultValue:NO];

    return emitterConfiguration;
}

+ (SPSubjectConfiguration *) mkSubjectConfig:(NSDictionary *) subjectConfig {

    SPSubjectConfiguration *subjectConfiguration = [SPSubjectConfiguration new];

    NSString *userId = [subjectConfig rnsp_stringForKey:@"userId" defaultValue:nil];
    if (userId) {
        subjectConfiguration.userId = userId;
    }

    NSString *networkUserId = [subjectConfig rnsp_stringForKey:@"networkUserId" defaultValue:nil];
    if (networkUserId) {
        subjectConfiguration.networkUserId = networkUserId;
    }

    NSString *domainUserId = [subjectConfig rnsp_stringForKey:@"domainUserId" defaultValue:nil];
    if (domainUserId) {
        subjectConfiguration.domainUserId = domainUserId;
    }

    NSString *useragent = [subjectConfig rnsp_stringForKey:@"useragent" defaultValue:nil];
    if (useragent) {
        subjectConfiguration.useragent = useragent;
    }

    NSString *ipAddress = [subjectConfig rnsp_stringForKey:@"ipAddress" defaultValue:nil];
    if (ipAddress) {
        subjectConfiguration.ipAddress = ipAddress;
    }

    NSString *timezone = [subjectConfig rnsp_stringForKey:@"timezone" defaultValue:nil];
    if (timezone) {
        subjectConfiguration.timezone = timezone;
    }

    NSString *language = [subjectConfig rnsp_stringForKey:@"language" defaultValue:nil];
    if (language) {
        subjectConfiguration.language = language;
    }

    // screenResolution - type checked RN side
    NSArray *screenRSize = [subjectConfig objectForKey:@"screenResolution"];
    if (screenRSize != nil) {
        NSNumber *resWidth = [screenRSize objectAtIndex:0];
        NSNumber *resHeight = [screenRSize objectAtIndex:1];
        SPSize *resSize = [[SPSize alloc] initWithWidth:[resWidth integerValue] height:[resHeight integerValue]];
        subjectConfiguration.screenResolution = resSize;
    }

    // screenViewport - type checked RN side
    NSArray *screenVPSize = [subjectConfig objectForKey:@"screenViewport"];
    if (screenVPSize != nil) {
        NSNumber *vpWidth = [screenVPSize objectAtIndex:0];
        NSNumber *vpHeight = [screenVPSize objectAtIndex:1];
        SPSize *vpSize = [[SPSize alloc] initWithWidth:[vpWidth integerValue] height:[vpHeight integerValue]];
        subjectConfiguration.screenViewPort = vpSize;
    }

    // colorDepth
    NSNumber *colorDepth = [subjectConfig rnsp_numberForKey:@"colorDepth" defaultValue: nil];
    if (colorDepth != nil) {
        subjectConfiguration.colorDepth = colorDepth;
    }

    return subjectConfiguration;
}

+ (SPGDPRConfiguration *) mkGdprConfig:(NSDictionary *) gdprConfig {
    NSString *basis = [gdprConfig objectForKey:@"basisForProcessing"];
    NSString *docId = [gdprConfig objectForKey:@"documentId"];
    NSString *docVer = [gdprConfig objectForKey:@"documentVersion"];
    NSString *docDesc = [gdprConfig objectForKey:@"documentDescription"];

    SPGDPRConfiguration *gdprConfiguration = [[SPGDPRConfiguration alloc] initWithBasis:[RNUtilities getBasis:basis] documentId:docId documentVersion:docVer documentDescription:docDesc];

    return gdprConfiguration;
}

+ (SPGlobalContextsConfiguration *) mkGCConfig:(NSArray *) gcConfig {

    SPGlobalContextsConfiguration *gcConfiguration = [[SPGlobalContextsConfiguration alloc] init];
    //NSMutableDictionary *contextGens = [NSMutableDictionary dictionary];

    for (NSDictionary *gcMap in gcConfig) {
        NSString *itag = [gcMap objectForKey:@"tag"];
        NSArray *globalContexts = [gcMap objectForKey:@"globalContexts"];

        NSMutableArray *staticContexts = [NSMutableArray array];
        for (NSDictionary *sdj in globalContexts) {
            SPSelfDescribingJson *gContext = [[SPSelfDescribingJson alloc] initWithSchema:(NSString *)[sdj objectForKey:@"schema"]
                                                                      andDictionary:(NSDictionary *)[sdj objectForKey:@"data"]];

            [staticContexts addObject:gContext];
        }

        SPGlobalContext *gcStatic = [[SPGlobalContext alloc] initWithStaticContexts:(NSArray *)[staticContexts copy]];

        [gcConfiguration addWithTag:itag contextGenerator:gcStatic];
    }

    return gcConfiguration;
}

@end
