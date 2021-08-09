#!/usr/bin/env bash

# Due to https://github.com/facebook/react-native/issues/28807,
#   quickTest.sh is meant to be used only by MacOS users.

set -e

root_path=$( cd "$(dirname "$(dirname "${BASH_SOURCE[0]}")")" && pwd -P )
demo_path=$( echo "${root_path}/DemoApp" )

# argument parsing and validation
[ "$#" -eq 1 ] || (echo "quickTest: Single argument required, $# provided" 1>&2 ; exit 1)

platform=${1}

case "$platform" in
    android|ios|both)
        ;;
    *)
        echo "quickTest: Platform argument can only be one of: android, ios, both" 1>&2 ; exit 1
        ;;
esac

# bootstrap
npm run bootstrap

# run
if [ "$platform" = "android" ] || [ "$platform" = "both" ]; then
    cd "${demo_path}"
    yarn android
else
    echo 'skipping android'
fi

if [ "$1" == "ios" ] || [ "$1" == "both" ]; then
    cd "${demo_path}"
    yarn pods
    yarn ios
else
    echo 'skipping ios'
fi
