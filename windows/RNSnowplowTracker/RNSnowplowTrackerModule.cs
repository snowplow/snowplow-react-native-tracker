using ReactNative.Bridge;
using System;
using System.Collections.Generic;
using Windows.ApplicationModel.Core;
using Windows.UI.Core;

namespace Snowplow.Tracker.RNSnowplowTracker
{
    /// <summary>
    /// A module that allows JS to share data.
    /// </summary>
    class RNSnowplowTrackerModule : NativeModuleBase
    {
        /// <summary>
        /// Instantiates the <see cref="RNSnowplowTrackerModule"/>.
        /// </summary>
        internal RNSnowplowTrackerModule()
        {

        }

        /// <summary>
        /// The name of the native module.
        /// </summary>
        public override string Name
        {
            get
            {
                return "RNSnowplowTracker";
            }
        }
    }
}
