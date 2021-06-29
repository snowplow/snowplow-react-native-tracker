#!/usr/bin/env bash

# Due to https://github.com/facebook/react-native/issues/28807,
#   cleanBuildAndRun.sh is meant to be used only by MacOS users.

set -e

root_path=$( cd "$(dirname "$(dirname "${BASH_SOURCE[0]}")")" && pwd -P )
demo_path=$( echo "${root_path}/DemoApp" )

# clean build tracker
function clean_build_tracker() {
    cd "${root_path}"
    rm -rf node_modules
    rm -rf package-lock.json
    rm -rf yarn.lock
    npm install
    npm run build
}

# DemoApp node_modules
function clean_demo_modules() {
    cd "${demo_path}"
    rm -rf node_modules
    yarn cache clean
    rm -rf yarn.lock
    rm -rf package-lock.json
    yarn
}

# DemoApp android
function clean_android() {
    cd "${demo_path}"
    rm -rf android/app/build
    cd android
    rm -rf .gradle
    ./gradlew clean
    cd "${demo_path}"
}

# DemoApp ios
function clean_ios() {
    cd "${demo_path}"

    # optionally, uncomment next 2 lines
    # rm -rf ~/Library/Caches/CocoaPods
    # rm -rf ~/Library/Developer/Xcode/DerivedData/*

    rm -rf ios/build
    cd ios
    rm -rf Pods
    rm -rf Podfile.lock
    pod install --repo-update
    cd "${demo_path}"
}

# argument parsing and validation
[ "$#" -eq 1 ] || (echo "cleanBuildAndRun: Single argument required, $# provided" 1>&2 ; exit 1)

platform=${1}

case "$platform" in
    android|ios|both)
        ;;
    *)
        echo "cleanBuildAndRun: Platform argument can only be one of: android, ios, both" 1>&2 ; exit 1
        ;;
esac

# commands
clean_build_tracker
clean_demo_modules

if [ "$platform" = "android" ] || [ "$platform" = "both" ]; then
    cd "${demo_path}"
    clean_android
    yarn android
else
    echo 'skipping android'
fi

if [ "$1" == "ios" ] || [ "$1" == "both" ]; then
    cd "${demo_path}"
    clean_ios
    yarn ios
else
    echo 'skipping ios'
fi
