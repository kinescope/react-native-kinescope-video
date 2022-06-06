import {useEffect, useState} from 'react';
import {MetricClass} from './metric-class';
import {MetricMediaTypes, MetricQueueFlush} from './metric-queue-flush';
import {MetricQueue} from './metric-queue';

type CreateMetricTypes = {
	paused: boolean;
	volume: number;
	muted: boolean;
	rate: number;

	media?: MetricMediaTypes;
	externalId?: string;
};

function createMetric({media, externalId, paused, volume, muted, rate}: CreateMetricTypes) {
	const queue = new MetricQueue();
	const queueFlush = new MetricQueueFlush({queue: queue, media, externalId});
	const metric = new MetricClass(queue, {paused, volume, muted, rate});

	return {
		metric: metric,
		queueFlush: queueFlush,
	};
}

export default function useMetric({
	media,
	externalId,
	paused,
	volume,
	muted,
	rate,
}: CreateMetricTypes) {
	const [{metric, queueFlush}] = useState<{metric: MetricClass; queueFlush: MetricQueueFlush}>(
		createMetric({media, externalId, paused, volume, muted, rate}),
	);

	useEffect(() => {
		if (media?.videoId) {
			queueFlush.start();
		}

		return () => {
			queueFlush.stop();
		};
	}, [media?.videoId]);

	useEffect(() => {
		queueFlush && queueFlush.setMedia(media);
	}, [media?.videoId]);

	useEffect(() => {
		queueFlush && queueFlush.setExternalId(externalId);
	}, [externalId]);

	useEffect(() => {
		metric && metric.setVolume(volume);
	}, [volume]);

	useEffect(() => {
		metric && metric.setPaused(paused);
	}, [paused]);

	useEffect(() => {
		metric && metric.setVolume(volume);
	}, [volume]);

	useEffect(() => {
		metric && metric.setRate(rate);
	}, [rate]);

	useEffect(() => {
		metric && metric.setMuted(muted);
	}, [muted]);

	return {
		onMetricLoadStart: metric.onLoadStart,
		onMetricLoad: metric.onLoad,
		onMetricSeek: metric.onSeek,
		onMetricProgress: metric.onProgress,
		onMetricEnd: metric.onEnd,
		onMetricEnterFullScreen: metric.onEnterFullScreen,
		onMetricExitFullScreen: metric.onExitFullScreen,
		onMetricError: metric.onError,
	};
}
