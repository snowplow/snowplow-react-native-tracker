#import <Foundation/Foundation.h>
#import <React/RCTConvert.h>

@class SPSelfDescribingJson;
@class SPSelfDescribingJsonArray;
@class SPUnstructured;
@class SPUnstructuredArray;

@interface RCTConvert (Snowplow)

+ (SPSelfDescribingJson *)SPSelfDescribingJson:(id)json;
+ (NSArray<SPSelfDescribingJson *> *)SPSelfDescribingJsonArray:(id)json;

+ (SPUnstructured *)SPUnstructured:(id)json;
+ (NSArray<SPUnstructured *> *)SPUnstructuredArray:(id)json;

@end
