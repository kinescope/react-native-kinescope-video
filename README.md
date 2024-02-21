[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://kinescope.io/)

<h1 align="center">React Native Kinescope Player</h1>

## Installation

Using npm:

```sh
npm --save install @kinescope/react-native-kinescope-video react-native-video@^6.0.0-beta.5 @react-native-async-storage/async-storage
```

Using yarn:

```sh
yarn add @kinescope/react-native-kinescope-video react-native-video@^6.0.0-beta.5 @react-native-async-storage/async-storage
```

## Useful resources
- [react-native-video](https://react-native-video.github.io/react-native-video)

### Packages storage
```
// file: android/build.gradle

allprojects {
    repositories {
        jcenter()
    }
}
```

## Install iOS

```
npx pod-install
```

## Props including [react-native-video](https://react-native-video.github.io/react-native-video/component/props)
```
preload?: boolean;
videoId: string;
posterResizeMode?: ImageResizeMode;
externalId?: string;
quality?: QualityTypes;
autoSeekChangeQuality?: boolean; // default: true; iOS only
referer?: string;
drmAuthToken?: string;
```

## Events including [react-native-video](https://react-native-video.github.io/react-native-video/component/events)
```
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

