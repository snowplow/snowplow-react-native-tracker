//
//  ViewController.m
//  DemoApp
//
//  Created by Matus Tomlein on 19/01/2022.
//

#import "ViewController.h"
#import "SPSnowplow.h"
#import "SPStructured.h"

@interface ViewController ()

@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
}

/**
 Demonstrates the use of a tracker initialized in React native.
 */
- (void)pressesBegan:(NSSet<UIPress *> *)presses withEvent:(UIPressesEvent *)event
{
    id<SPTrackerController> tracker = [SPSnowplow defaultTracker];
    SPStructured *structured = [[SPStructured alloc] initWithCategory:@"key" action:@"press"];
    [tracker track:structured];
    [super pressesBegan:presses withEvent:event];
}

@end
