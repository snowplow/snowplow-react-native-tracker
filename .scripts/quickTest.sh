#!/bin/bash

root_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )/..

# cp -a $root_path $root_path/DemoApp/node_modules/@snowplow/react-native-tracker

cp -a $root_path/ios DemoApp/node_modules/@snowplow/react-native-tracker/

cp -a $root_path/android DemoApp/node_modules/@snowplow/react-native-tracker/

cp -a $root_path/index.js DemoApp/node_modules/@snowplow/react-native-tracker/

cd $root_path/DemoApp

if [ "$1" == "android" ] || [ "$1" == "both" ]; then
  react-native run-android
else
  echo 'skipping android'
fi

if [ "$1" == "ios" ] || [ "$1" == "both" ]; then
  react-native run-ios
else
  echo 'skipping ios'
fi
