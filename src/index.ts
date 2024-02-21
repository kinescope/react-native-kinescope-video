import {polyfill as polyfillEncoding} from 'react-native-polyfill-globals/src/encoding';
import {polyfill as polyfillReadableStream} from 'react-native-polyfill-globals/src/readable-stream';

polyfillReadableStream();
polyfillEncoding();

import ReactNativeKinescopeVideo, {ReactNativeKinescopeVideoProps} from './components/video';
export default ReactNativeKinescopeVideo;

import {
	ManifestEventsTypes,
	ManifestEventLoadTypes,
	ChapterTypes,
	SubtitleTypes,
	QualityTypes,
	QualityNameTypes,
} from './types';
export type {
	ManifestEventsTypes,
	ManifestEventLoadTypes,
	ChapterTypes,
	SubtitleTypes,
	QualityTypes,
	QualityNameTypes,
	ReactNativeKinescopeVideoProps,
};

import {OnLoadData, SelectedTrackType} from 'react-native-video';
export {OnLoadData, SelectedTrackType};
