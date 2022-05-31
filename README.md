[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://kinescope.io/)

<h1 align="center">React Native Kinescope Player</h1>

## Installation

Using npm:

```sh
npm --save install @kinescope/react-kinescope-player react-native-video @react-native-async-storage/async-storage
```

Using yarn:

```sh
yarn add install @kinescope/react-kinescope-player react-native-video @react-native-async-storage/async-storage
```

## Useful resources
- [react-native-video](https://github.com/react-native-video/react-native-video/blob/master/API.md)

## Install android (react-native >= 0.68.0)
```
// file: android/settings.gradle

apply from: file("../node_modules/@react-native-community/cli-platform-android/native_modules.gradle"); applyNativeModulesSettingsGradle(settings)

include ':react-native-video'
// project(':react-native-video').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-video/android')
project(':react-native-video').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-video/android-exoplayer')
```

```grable
// file: android/build.gradle

allprojects {
    repositories {
        jcenter()
    }
}
```

## Props including [react-native-video](https://github.com/react-native-video/react-native-video/blob/master/API.md#configurable-props)
```
// Props
videoId: string;
preload?: boolean;
externalId?: string;

// Events
onManifestLoadStart?: () => void;
onManifestLoad?: (manifest: ManifestEventLoadTypes) => void;
onManifestError?: (error: unknown) => void;
```

### Configurable props

#### videoId
Video ID from https://app.kinescope.io/

#### preload
The video is uploading right away.

#### externalId
For analytics

