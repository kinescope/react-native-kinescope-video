import React, {
	ForwardedRef,
	forwardRef,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {Image, ImageResizeMode, Platform, View} from 'react-native';
import ReactVideo, {
	OnLoadData,
	OnProgressData,
	OnSeekData,
	VideoProperties,
} from 'react-native-video';
import useManifest, {ManifestEventsTypes} from '../hooks/use-manifest';
import useMetric from '../hooks/metric/use-metric';
import {MetricMediaTypes} from '../hooks/metric/metric-queue-flush';
import {QualityTypes} from '../types';
import {METRIC_HOST} from '../hooks/metric/contants';

type ReactVideoProps = Omit<VideoProperties, 'source' | 'poster' | 'selectedVideoTrack'>;

type ReactNativeKinescopeVideoProps = ReactVideoProps &
	ManifestEventsTypes & {
		preload?: boolean;
		videoId: string;
		posterResizeMode?: ImageResizeMode;
		externalId?: string;
		quality?: QualityTypes;
		autoSeekChangeQuality?: boolean; // ios only
		referer?: string;
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
		quality = 'auto',
		autoSeekChangeQuality = true,
		referer = `https://${METRIC_HOST}`,

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
		onError,
		onManifestLoadStart,
		onManifestLoad,
		onManifestError,
		...rest
	} = props;

	const videoRef = useRef<ReactVideo>();
	const seekQuality = useRef<number>(0);

	const [loadingVideo, setLoadingVideo] = useState<boolean>(false);
	const [videoStartLoad, setVideoStartLoad] = useState(false);
	const {loading, manifest} = useManifest({
		videoId,
		referer,
		onManifestLoadStart,
		onManifestLoad,
		onManifestError,
	});

	const media: MetricMediaTypes = {
		type: manifest?.type,
		videoId: manifest?.id,
		workspaceId: manifest?.workspaceId,
		projectId: manifest?.projectId,
		folderId: manifest?.folderId,
	};

	const {
		onMetricLoadStart,
		onMetricLoad,
		onMetricSeek,
		onMetricProgress,
		onMetricEnd,
		onMetricEnterFullScreen,
		onMetricExitFullScreen,
		onMetricError,
	} = useMetric({media: media, externalId, paused, muted, volume, rate});

	const headers = useMemo(() => {
		return {
			Referer: referer,
		};
	}, [referer]);

	useEffect(() => {
		seekQuality.current = 0;
		setLoadingVideo(false);
		setVideoStartLoad(false);
	}, [videoId]);

	const handleRef = useCallback(
		current => {
			videoRef.current = current;
			if (ref) {
				if (typeof ref === 'function') {
					ref && ref(current);
				} else {
					ref.current = current;
				}
			}
		},
		[ref],
	);

	const applySeek = useCallback(() => {
		if (!autoSeekChangeQuality || Platform.OS !== 'ios') {
			return;
		}
		if (seekQuality.current > 0) {
			videoRef.current?.seek(seekQuality.current);
			seekQuality.current = 0;
		}
	}, [autoSeekChangeQuality]);

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
			applySeek();
		},
		[onLoad, applySeek],
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
			seekQuality.current = data.currentTime;
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

	const handleError = useCallback(
		error => {
			onError && onError(error);
			onMetricError(error);
		},
		[onError],
	);

	const getSelectedVideoTrack = useCallback((): VideoProperties['selectedVideoTrack'] => {
		const resolution = manifest?.qualityMap[quality]?.height;
		if (resolution) {
			return {
				type: 'resolution',
				value: resolution,
			};
		}
		return {
			type: 'auto',
		};
	}, [quality, manifest]);

	if (loading || !manifest) {
		return <View style={style} />;
	}

	if (!preload && !videoStartLoad && paused) {
		return (
			<View style={style}>
				<Image
					source={{
						uri: manifest.posterUrl,
						headers: headers,
					}}
					resizeMode={posterResizeMode}
					style={{flex: 1}}
				/>
			</View>
		);
	}

	const getTextTracks = () => {
		if (Platform.OS === 'android') {
			return textTracks ?? manifest.subtitles;
		}
		if (!loadingVideo) {
			return undefined;
		}
		return textTracks ?? manifest.subtitles;
	};

	const getHlsLink = () => {
		return manifest.qualityMap[quality]?.uri || manifest.hlsLink;
	};

	const getSource = () => {
		if (Platform.OS === 'android' && manifest.dashLink) {
			return {
				uri: manifest.dashLink,
				type: 'mpd',
				headers: headers,
			};
		}
		return {
			uri: getHlsLink(),
			type: 'm3u8',
			headers: headers,
		};
	};

	return (
		<ReactVideo
			ref={handleRef}
			{...rest}
			source={getSource()}
			poster={manifest.posterUrl}
			selectedTextTrack={selectedTextTrack}
			selectedVideoTrack={getSelectedVideoTrack()}
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
			onError={handleError}
		/>
	);
}

export default forwardRef(ReactNativeKinescopeVideo);
