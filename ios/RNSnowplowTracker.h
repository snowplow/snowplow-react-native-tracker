
#if __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#else
#import <React/RCTBridgeModule.h>
#endif

#import <Foundation/Foundation.h>
@class SPTracker;

@interface RNSnowplowTracker : NSObject <RCTBridgeModule>

@property (nonatomic, strong) SPTracker *tracker;

@end
  
