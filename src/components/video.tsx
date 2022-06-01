import React, {ForwardedRef, forwardRef, useCallback, useEffect, useState} from 'react';
import {Image, ImageResizeMode, Platform, View} from 'react-native';
import ReactVideo, {
	OnLoadData,
	OnProgressData,
	OnSeekData,
	VideoProperties,
} from 'react-native-video';
import useManifest, {ManifestEventsTypes} from '../hooks/use-manifest';
import useMetric from '../hooks/metric/use-metric';

type ReactVideoProps = Omit<VideoProperties, 'source' | 'poster'>;

type ReactNativeKinescopeVideoProps = ReactVideoProps &
	ManifestEventsTypes & {
		preload?: boolean;
		videoId: string;
		posterResizeMode?: ImageResizeMode;
		externalId?: string;
	};

function ReactNativeKinescopeVideo(
	props: ReactNativeKinescopeVideoProps,
	ref: ForwardedRef<ReactVideo>,
) {
	const {
		preload,
		videoId,
		posterResizeMode = 'contain',
		externalId,

		selectedTextTrack,
		textTracks,
		style,

		paused = false,
		volume = 1,
		muted = false,
		rate = 1,

		onLoadStart,
		onLoad,
		onSeek,
		onProgress,
		onEnd,
		onFullscreenPlayerDidPresent,
		onFullscreenPlayerWillPresent,
		onManifestLoadStart,
		onManifestLoad,
		onManifestError,
		...rest
	} = props;

	const [loadingVideo, setLoadingVideo] = useState<boolean>(false);
	const [videoStartLoad, setVideoStartLoad] = useState(false);
	const {loading, manifest} = useManifest({
		videoId,
		onManifestLoadStart,
		onManifestLoad,
		onManifestError,
	});

	const {
		onMetricLoadStart,
		onMetricLoad,
		onMetricSeek,
		onMetricProgress,
		onMetricEnd,
		onMetricEnterFullScreen,
		onMetricExitFullScreen,
	} = useMetric({videoId: manifest?.id, externalId, paused, muted, volume, rate});

	useEffect(() => {
		setLoadingVideo(false);
		setVideoStartLoad(false);
	}, [videoId]);

	const handleLoadStart = useCallback(() => {
		onLoadStart && onLoadStart();
		onMetricLoadStart();
		setLoadingVideo(false);
		setVideoStartLoad(true);
	}, [onLoadStart]);

	const handleLoad = useCallback(
		(data: OnLoadData) => {
			onLoad && onLoad(data);
			onMetricLoad(data);
			setLoadingVideo(true);
		},
		[onLoad],
	);

	const handleSeek = useCallback(
		(data: OnSeekData) => {
			onSeek && onSeek(data);
			onMetricSeek(data);
		},
		[onSeek],
	);

	const handleProgress = useCallback(
		(data: OnProgressData) => {
			onProgress && onProgress(data);
			onMetricProgress(data);
		},
		[onProgress],
	);

	const handleEnd = useCallback(() => {
		onEnd && onEnd();
		onMetricEnd();
	}, [onEnd]);

	const handleFullscreenPlayerDidPresent = useCallback(() => {
		onFullscreenPlayerDidPresent && onFullscreenPlayerDidPresent();
		onMetricEnterFullScreen();
	}, [onFullscreenPlayerDidPresent]);

	const handleFullscreenPlayerWillPresent = useCallback(() => {
		onFullscreenPlayerWillPresent && onFullscreenPlayerWillPresent();
		onMetricExitFullScreen();
	}, [onFullscreenPlayerWillPresent]);

	if (loading || !manifest) {
		return <View style={style} />;
	}

	if (!preload && !videoStartLoad && paused) {
		return (
			<View style={style}>
				<Image
					source={{
						uri: manifest.posterUrl,
					}}
					resizeMode={posterResizeMode}
					style={{flex: 1}}
				/>
			</View>
		);
	}

	const getTextTracks = () => {
		if (!loadingVideo) {
			return undefined;
		}
		return textTracks ?? manifest.subtitles;
	};

	const getSelectedTextTrack = () => {
		if (!loadingVideo) {
			return undefined;
		}
		return selectedTextTrack;
	};

	const getSource = () => {
		if (Platform.OS === 'ios') {
			return {uri: manifest.hlsLink, type: 'm3u8'};
		}
		return {uri: manifest.dashLink, type: 'mpd'};
	};

	return (
		<ReactVideo
			ref={ref}
			{...rest}
			source={getSource()}
			poster={manifest.posterUrl}
			selectedTextTrack={getSelectedTextTrack()}
			textTracks={getTextTracks()}
			posterResizeMode={posterResizeMode}
			style={style}
			paused={paused}
			volume={volume}
			muted={muted}
			rate={rate}
			onLoadStart={handleLoadStart}
			onLoad={handleLoad}
			onSeek={handleSeek}
			onProgress={handleProgress}
			onEnd={handleEnd}
			onFullscreenPlayerDidPresent={handleFullscreenPlayerDidPresent}
			onFullscreenPlayerWillPresent={handleFullscreenPlayerWillPresent}
		/>
	);
}

export default forwardRef(ReactNativeKinescopeVideo);
