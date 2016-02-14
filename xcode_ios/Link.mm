// Link.mm -- Obj-C++
#include "Link.h"
#import "Url.h"
#import <UIKit/UIKit.h>

#import <AudioToolbox/AudioToolbox.h>


@implementation Url

+ ( void )open:( NSString * )url {
    [ [ UIApplication sharedApplication ] openURL:[ NSURL URLWithString:url ] ];
}

@end

void Link::openUrl( const std::string &url ) {
    [ Url open:[ NSString stringWithCString:url.c_str()
                                   encoding:[NSString defaultCStringEncoding ] ] ];
}