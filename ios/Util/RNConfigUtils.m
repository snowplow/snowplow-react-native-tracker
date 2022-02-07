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

#import <Foundation/Foundation.h>

#import <SnowplowTracker/SPSnowplow.h>
#import <SnowplowTracker/NSDictionary+SP_TypeMethods.h>
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

    NSString *appId = [trackerConfig sp_stringForKey:@"appId" defaultValue:nil];
    if (appId) {
        trackerConfiguration.appId = appId;
    }

    NSString *devicePlatform = [trackerConfig sp_stringForKey:@"devicePlatform" defaultValue:nil];
    if (devicePlatform) {
        trackerConfiguration.devicePlatform = SPStringToDevicePlatform(devicePlatform);
    }

    trackerConfiguration.base64Encoding = [trackerConfig sp_boolForKey:@"base64Encoding" defaultValue:YES];

    NSString *logLevel = [trackerConfig sp_stringForKey:@"logLevel" defaultValue:nil];
    if (logLevel) {
        NSUInteger index = [@[@"off", @"error", @"debug", @"verbose"] indexOfObject:logLevel];
        trackerConfiguration.logLevel = index != NSNotFound ? index : SPLogLevelOff;
    }

    trackerConfiguration.sessionContext = [trackerConfig sp_boolForKey:@"sessionContext" defaultValue:YES];
    trackerConfiguration.applicationContext = [trackerConfig sp_boolForKey:@"applicationContext" defaultValue:YES];
    trackerConfiguration.platformContext = [trackerConfig sp_boolForKey:@"platformContext" defaultValue:YES];
    trackerConfiguration.geoLocationContext = [trackerConfig sp_boolForKey:@"geoLocationContext" defaultValue:NO];
    trackerConfiguration.screenContext = [trackerConfig sp_boolForKey:@"screenContext" defaultValue:YES];
    trackerConfiguration.deepLinkContext = [trackerConfig sp_boolForKey:@"deepLinkContext" defaultValue:YES];
    trackerConfiguration.screenViewAutotracking = [trackerConfig sp_boolForKey:@"screenViewAutotracking" defaultValue:YES];
    trackerConfiguration.lifecycleAutotracking = [trackerConfig sp_boolForKey:@"lifecycleAutotracking" defaultValue:NO];
    trackerConfiguration.installAutotracking = [trackerConfig sp_boolForKey:@"installAutotracking" defaultValue:YES];
    trackerConfiguration.exceptionAutotracking = [trackerConfig sp_boolForKey:@"exceptionAutotracking" defaultValue:YES];
    trackerConfiguration.diagnosticAutotracking = [trackerConfig sp_boolForKey:@"diagnosticAutotracking" defaultValue:NO];

    return trackerConfiguration;
}

+ (SPSessionConfiguration *) mkSessionConfig:(NSDictionary *) sessionConfig {

    NSInteger foreground = [[sessionConfig sp_numberForKey:@"foregroundTimeout" defaultValue:@1800] integerValue];
    NSInteger background = [[sessionConfig sp_numberForKey:@"backgroundTimeout" defaultValue:@1800] integerValue];
    SPSessionConfiguration *sessionConfiguration = [[SPSessionConfiguration alloc] initWithForegroundTimeoutInSeconds:foreground backgroundTimeoutInSeconds:background];

    return sessionConfiguration;
}

+ (SPEmitterConfiguration *) mkEmitterConfig:(NSDictionary *) emitterConfig {
    SPEmitterConfiguration *emitterConfiguration = [[SPEmitterConfiguration alloc] init];
    NSString *bufferOption = [emitterConfig sp_stringForKey:@"bufferOption" defaultValue:@"single"];
    if ([bufferOption isEqualToString:@"default"]) {
        emitterConfiguration.bufferOption = SPBufferOptionDefaultGroup;
    } else if ([bufferOption isEqualToString:@"large"]) {
        emitterConfiguration.bufferOption = SPBufferOptionLargeGroup;
    } else {
        emitterConfiguration.bufferOption = SPBufferOptionSingle;
    }

    emitterConfiguration.emitRange = [[emitterConfig sp_numberForKey:@"emitRange" defaultValue:@150] integerValue];
    emitterConfiguration.threadPoolSize = [[emitterConfig sp_numberForKey:@"threadPoolSize" defaultValue:@15] integerValue];
    emitterConfiguration.byteLimitGet = [[emitterConfig sp_numberForKey:@"byteLimitGet" defaultValue:@40000] integerValue];
    emitterConfiguration.byteLimitPost = [[emitterConfig sp_numberForKey:@"byteLimitPost" defaultValue:@40000] integerValue];

    return emitterConfiguration;
}

+ (SPSubjectConfiguration *) mkSubjectConfig:(NSDictionary *) subjectConfig {

    SPSubjectConfiguration *subjectConfiguration = [SPSubjectConfiguration new];

    NSString *userId = [subjectConfig sp_stringForKey:@"userId" defaultValue:nil];
    if (userId) {
        subjectConfiguration.userId = userId;
    }

    NSString *networkUserId = [subjectConfig sp_stringForKey:@"networkUserId" defaultValue:nil];
    if (networkUserId) {
        subjectConfiguration.networkUserId = networkUserId;
    }

    NSString *domainUserId = [subjectConfig sp_stringForKey:@"domainUserId" defaultValue:nil];
    if (domainUserId) {
        subjectConfiguration.domainUserId = domainUserId;
    }

    NSString *useragent = [subjectConfig sp_stringForKey:@"useragent" defaultValue:nil];
    if (useragent) {
        subjectConfiguration.useragent = useragent;
    }

    NSString *ipAddress = [subjectConfig sp_stringForKey:@"ipAddress" defaultValue:nil];
    if (ipAddress) {
        subjectConfiguration.ipAddress = ipAddress;
    }

    NSString *timezone = [subjectConfig sp_stringForKey:@"timezone" defaultValue:nil];
    if (timezone) {
        subjectConfiguration.timezone = timezone;
    }

    NSString *language = [subjectConfig sp_stringForKey:@"language" defaultValue:nil];
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
    NSNumber *colorDepth = [subjectConfig sp_numberForKey:@"colorDepth" defaultValue: nil];
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
