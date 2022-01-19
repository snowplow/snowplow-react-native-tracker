package com.demoapp;

import android.view.KeyEvent;

import com.facebook.react.ReactActivity;
import com.snowplowanalytics.snowplow.Snowplow;
import com.snowplowanalytics.snowplow.event.Structured;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "DemoApp";
  }

  /**
   * Demonstrates the use of a tracker initialized in React native.
   */
  @Override
  public boolean onKeyDown(int keyCode, KeyEvent event) {
    Snowplow.getDefaultTracker().track(new Structured("key", "press"));
    return super.onKeyDown(keyCode, event);
  }
}
