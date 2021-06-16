/*
 * Copyright (c) 2020-2021 Snowplow Analytics Ltd. All rights reserved.
 *
 * This program is licensed to you under the Apache License Version 2.0,
 * and you may not use this file except in compliance with the Apache License Version 2.0.
 * You may obtain a copy of the Apache License Version 2.0 at http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the Apache License Version 2.0 is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Apache License Version 2.0 for the specific language governing permissions and limitations there under.
 */

/**
 * HttpMethod type
 */
export type HttpMethod = 'post' | 'get';

/**
 * HttpProtocol type
 */
export type HttpProtocol = 'https' | 'http';

/**
 * The Subject Data
 */
export type SubjectData = {
  /**
   * user id
   */
  userId?: string;
  /**
   * screen width (integer)
   */
  screenWidth?: number;
  /**
   * screen height (integer)
   */
  screenHeight?: number;
  /**
   * color depth (integer)
   */
  colorDepth?: number;
  /**
   * timezone
   */
  timezone?: string;
  /**
   * language
   */
  language?: string;
  /**
   * IP address
   */
  ipAddress?: string;
  /**
   * user agent
   */
  useragent?: string;
  /**
   * network user id (UUIDv4)
   */
  networkUserId?: string;
  /**
   * domain user id
   */
  domainUserId?: string;
  /**
   * viewport width (integer)
   */
  viewportWidth?: number;
  /**
   * viewport height (integer)
   */
  viewportHeight?: number;
};

/**
 * ScreenView event properties
 * schema: iglu:com.snowplowanalytics.mobile/screen_view/jsonschema/1-0-0
 */
export type ScreenViewProps = {
  /**
   * The name of the screen viewed
   */
  screenName: string;
  /**
   * The type of screen that was viewed
   */
  screenType?: string;
  /**
   * The type of transition that led to the screen being viewed
   */
  transitionType?: string;
};

/**
 * SelfDescribing event properties
 */
export type SelfDescribingProps = {
  /**
   * The schema of the event
   */
  schema: string;
  /**
   * The event data
   */
  data: Record<string, unknown>;
};

/**
 * Structured event properties
 */
export type StructuredProps = {
  /**
   * The category of the event
   */
  category: string;
  /**
   * The action the event represents
   */
  action: string;
  /**
   * The label the action refers to
   */
  label?: string;
  /**
   * The property associated with the user action
   */
  property?: string;
  /**
   * The value associated with the user action
   */
  value?: number;
};

/**
 * PageView event properties
 */
export type PageViewProps = {
  /**
   * The page URL
   */
  pageUrl: string;
  /**
   * The page title
   */
  pageTitle?: string;
  /**
   * The referrer URL
   */
  pageReferrer?: string;
};

/**
 * Context type
 */
export type EventContext = {
  /**
   * The context schema
   */
  schema: string;
  /**
   * The context data
   */
  data: Record<string, unknown>;
};

/**
 * The ReactNativeTracker type
 */
export type ReactNativeTracker = {
  /**
   * Sets or updates subject data
   *
   * @param argmap - The subject data to be set or updated
   */
  readonly setSubjectData: (argmap: SubjectData) => Promise<void>;

  /**
   * Tracks a screen-view event
   *
   * @param argmap - The screen-view event's properties
   * @param ctxt - The array of event contexts
   */
  readonly trackScreenViewEvent: (
    argmap: ScreenViewProps,
    ctxt?: EventContext[]
  ) => Promise<void>;

  /**
   * Tracks a self-descibing event
   *
   * @param argmap - The self-describing event properties
   * @param ctxt - The array of event contexts
   */
  readonly trackSelfDescribingEvent: (
    argmap: SelfDescribingProps,
    ctxt: EventContext[]
  ) => Promise<void>;

  /**
   * Tracks a structured event
   *
   * @param argmap - The structured event properties
   * @param ctxt - The array of event contexts
   */
  readonly trackStructuredEvent: (
    argmap: StructuredProps,
    ctxt: EventContext[]
  ) => Promise<void>;

  /**
   * Tracks a page-view event
   *
   * @param argmap - The page-view event properties
   * @param ctxt - The array of event contexts
   */
  readonly trackPageViewEvent: (
    argmap: PageViewProps,
    ctxt: EventContext[]
  ) => Promise<void>;
};

/**
 * The optional configuration parameters of the tracker
 */
export interface OptTrackerConfig {
  /**
   * The HTTP method used
   * @defaultValue 'post'
   */
  method?: HttpMethod;

  /**
   * The HTTP protocol used
   * @defaultValue 'https'
   */
  protocol?: HttpProtocol;

  /**
   * Should event properties be base64 encoded where supported
   * @defaultValue true
   */
  base64Encoded?: boolean;

  /**
   * Whether platform context are sent with all events
   * @defaultValue true
   */
  platformContext?: boolean;

  /**
   * Whether application context are sent with all events
   * @defaultValue false
   */
  applicationContext?: boolean;

  /**
   * Whether to automatically track transition from foreground to background
   * @defaultValue false
   */
  lifecycleEvents?: boolean;

  /**
   * Whether to send a screen context (info for current screen) to events
   * @defaultValue true
   */
  screenContext?: boolean;

  /**
   * whether to add a session context to events
   * @defaultValue true
   */
  sessionContext?: boolean;

  /**
   * The session foreground timeout
   * @defaultValue 600
   */
  foregroundTimeout?: number;

  /**
   * The session background timeout
   * @defaultValue 300
   */
  backgroundTimeout?: number;

  /**
   * The session check interval
   * @defaultValue 15
   */
  checkInterval?: number;

  /**
   * Whether install events will be tracked
   * @defaultValue false
   */
  installTracking?: boolean;
}

/**
 * The configuration used for creating the tracker
 */
export interface TrackerConfig extends OptTrackerConfig {
  /**
   * The collector endpoint
   */
  endpoint: string;

  /**
   * The app ID
   */
  appId: string;
}

/**
 * The tracker configuration
 */
export interface InitTrackerConfig extends TrackerConfig {
  /**
   * The tracker namespace
   */
  namespace: string;
}
