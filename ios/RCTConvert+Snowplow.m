#import "RCTConvert+Snowplow.h"
#import <SnowplowTracker/SPSelfDescribingJson.h>
#import <SnowplowTracker/SPEvent.h>

@implementation RCTConvert (Snowplow)

+ (SPSelfDescribingJson *)SPSelfDescribingJson:(id)json {
		if (!json) {
				return nil;
		}

		if ([json isKindOfClass:[NSDictionary class]]) {
        NSString * schema = [json objectForKey:@"schema"];
        NSDictionary * data = [json objectForKey:@"data"];
        if (schema == nil || data == nil) {
    				return nil;
	    	}
	    	SPSelfDescribingJson *sdj = [[SPSelfDescribingJson alloc] initWithSchema:schema andData:data];
	    	return sdj;
		}
		return nil;
}

RCT_ARRAY_CONVERTER(SPSelfDescribingJson)

+ (SPUnstructured *)SPUnstructured:(id)json {
	  if (!json) {
	    	return nil;
	  }

	  if ([json isKindOfClass:[NSDictionary class]]) {
		    SPSelfDescribingJson * data = [self SPSelfDescribingJson:json[@"event"]];
		    NSNumber * timestamp = [self NSNumber:json[@"timestamp"]];
		    NSArray * contexts = [self SPSelfDescribingJsonArray:json[@"contexts"]];
		    NSString * eventId = [self NSString:json[@"eventId"]];
		    SPUnstructured * unstructEvent = [SPUnstructured build:^(id<SPUnstructuredBuilder> builder) {
		        [builder setEventData:data];
		        if (timestamp != nil) {
		            [builder setTimestamp:timestamp];
		        }
		        if (eventId != nil) {
		            [builder setEventId:eventId];
		        }
		        if (contexts != nil) {
		            [builder setContexts:[[NSMutableArray alloc] initWithArray:contexts]];
		        }
		    }];
		    return unstructEvent;
	  } else {
		    RCTLogConvertError(json, @"needs to be an NSDictionary with at least schema and some data type");
		    return nil;
	  }
	  return nil;
}

RCT_ARRAY_CONVERTER(SPUnstructured)

@end
