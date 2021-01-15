
Pod::Spec.new do |s|
  s.name         = "RNSnowplowTracker"
  s.version      = "1.0.0"
  s.summary      = "RNSnowplowTracker"
  s.description  = <<-DESC
                  RNSnowplowTracker
                   DESC
  s.homepage     = "github.com/snowplow/snowplow-react-native-tracker"
  s.license      = "Apache-2.0"
  s.author             = { "author" => "author@domain.cn" }
  s.platform     = :ios, "7.0"
  s.source       = { :git => "https://github.com/author/RNSnowplowTracker.git", :tag => "master" }
  s.source_files  = "*.{h,m}"
  s.requires_arc = true


  s.dependency "React"
  s.dependency "SnowplowTracker", "~> 1.6.2"
  #s.dependency "others"

end
