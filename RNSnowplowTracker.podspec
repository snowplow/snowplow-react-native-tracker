require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = "RNSnowplowTracker"
  s.version      = package['version']
  s.license      = package['license']

  s.summary      = "Snowplow React Native tracker"
  s.description  = package['description']
  s.homepage     = package['homepage']
  s.author       = { "Snowplow Analytics Ltd" => "info@snowplowanalytics.com" }

  s.platforms    = { :ios => "9.0" }

  s.source       = { :git => "https://github.com/snowplow-incubator/snowplow-react-native-tracker.git", :tag => "#{s.version}" }
  s.source_files = "ios/**/*.{h,m}"

  s.requires_arc = true

  s.dependency "React-Core"
  s.dependency "SnowplowTracker", "~> 3.0"
end
