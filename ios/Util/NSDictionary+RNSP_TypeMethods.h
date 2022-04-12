//
//  NSDictionary+RNSP_TypeMethods.h
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

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface NSDictionary (RNSP_TypeMethods)

- (nullable NSString *)rnsp_stringForKey:(NSString *)key defaultValue:(nullable NSString *)defaultValue;
- (nullable NSNumber *)rnsp_numberForKey:(NSString *)key defaultValue:(nullable NSNumber *)defaultValue;
- (BOOL)rnsp_boolForKey:(NSString *)key defaultValue:(BOOL)defaultValue;

@end

NS_ASSUME_NONNULL_END