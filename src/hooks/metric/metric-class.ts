import {OnLoadData, OnProgressData, OnSeekData} from 'react-native-video';
import {getTimestamp} from './functions/getTimestamp';
import {MetricQueue} from './metric-queue';
import {SecondsCounter} from './seconds-counter';

type MetricClassVariable = {
	paused: boolean;
	volume: number;
	muted: boolean;
	rate: number;
};

const MIN_PLAYBACK_INTERVAL = 5 * 1000;
const MAX_PLAYBACK_INTERVAL = 60 * 1000;

type EventName =
	| 'player_load'
	/** Воспроизведение. Отправляется каждые два процента от длительности ролика, но не чаще чем каждые 5 сек. и не реже чем каждые 60 сек. */
	| 'playback'
	| 'play'
	| 'pause'
	| 'end'
	/** Начато повторное воспроизведение. */
	| 'replay'
	| 'seek'
	| 'rate'
	| 'view'
	| 'enterfullscreen'
	| 'exitfullscreen';

export class MetricClass {
	queue: MetricQueue;
	secondsPlayed: SecondsCounter = new SecondsCounter();

	loadStartTime: number = Date.now();
	prevTime: number = 0;
	playbackInterval: number = 0;
	playbackTimerId: number = 0;

	paused: boolean;
	volume: number;
	muted: boolean;
	rate: number;

	currentTime: number = 0;
	duration: number = 0;
	isFullscreen: boolean = false;
	isEnd: boolean = false;

	constructor(queue: MetricQueue, {paused = false, volume, muted, rate}: MetricClassVariable) {
		this.queue = queue;

		this.paused = paused;
		this.volume = volume;
		this.muted = muted;
		this.rate = rate;

		this.secondsPlayedReset();
	}

	secondsPlayedReset = () => {
		this.secondsPlayed.reset();
		this.secondsPlayed.setChange(({total}) => {
			if (total > 5) {
				void this.addToQueue('view');
				this.secondsPlayed.setChange(undefined);
			}
		});
	};

	calcPlaybackInterval = (duration: number): void => {
		const twoPercentOfDurationInMs = (duration / 100) * 2 * 1000;
		this.playbackInterval = Math.max(
			Math.min(MAX_PLAYBACK_INTERVAL, twoPercentOfDurationInMs),
			MIN_PLAYBACK_INTERVAL,
		);
	};

	setPaused = (paused: boolean) => {
		if (this.paused === paused) {
			return;
		}
		this.paused = paused;
		this.onPlayOrPaused();
	};

	setVolume = (volume: number) => {
		this.volume = volume;
	};

	setMuted = (muted: boolean) => {
		this.muted = muted;
	};

	setDuration = (duration: number) => {
		this.duration = duration;
		this.calcPlaybackInterval(duration);
	};

	setRate = (rate: number) => {
		if (this.rate === rate) {
			return;
		}
		void this.addToQueue('rate', rate);
		this.rate = rate;
	};

	addToQueue = async (eventName: EventName, value = 0): Promise<void> => {
		const timestamp = getTimestamp();

		console.log('addToQueue', eventName, value);

		this.queue.add({
			type: 'playback',
			data: {
				timestamp: timestamp,
				type: eventName,
				value: value,
				watchedSec: this.secondsPlayed.getTotal(),
				previewPos: Math.floor(this.prevTime),
				currentPos: Math.floor(this.currentTime),
				duration: Math.floor(this.duration),
				properties: {
					volume: Math.floor(this.volume * 100),
					speed: this.rate,
					isMuted: this.muted,
					isFullscreen: this.isFullscreen,
					quality: 'auto',
				},
			},
		});

		if (eventName === 'playback') {
			this.prevTime = this.currentTime;
		}
	};

	startPlaybackTimer = (): void => {
		if (this.playbackInterval <= 0) return;
		this.stopPlaybackTimer();

		let prevTotal = 0;
		this.playbackTimerId = setInterval(() => {
			// Send event only if watched duration is updated
			const total = this.secondsPlayed.getTotal();
			if (prevTotal !== total) {
				prevTotal = total;
				void this.addToQueue('playback');
			}
		}, this.playbackInterval);
	};

	stopPlaybackTimer = (): void => {
		clearInterval(this.playbackTimerId);
	};

	onLoadStart = () => {
		this.loadStartTime = Date.now();
		this.prevTime = 0;
		this.isEnd = false;
		this.secondsPlayedReset();
	};

	onLoad = (data: OnLoadData) => {
		this.currentTime = data.currentTime;
		this.setDuration(data.duration);
		void this.addToQueue('player_load', (Date.now() - this.loadStartTime) / 1000);
	};

	onPlayOrPaused = () => {
		if (this.paused) {
			this.onPaused();
		} else {
			this.onPlay();
		}
	};

	onPlay = () => {
		if (this.isEnd) {
			void this.addToQueue('replay');
		} else {
			void this.addToQueue('play');
		}
		this.startPlaybackTimer();
	};

	onPaused = () => {
		this.stopPlaybackTimer();
		void this.addToQueue('pause');
	};

	onSeek = (data: OnSeekData) => {
		this.prevTime = data.currentTime;
		void this.addToQueue('seek');
	};

	onProgress = (data: OnProgressData) => {
		this.secondsPlayed.push(data.currentTime);
	};

	onEnd = () => {
		this.isEnd = true;
		void this.addToQueue('end');
	};

	onEnterFullScreen = () => {
		this.isFullscreen = true;
		void this.addToQueue('enterfullscreen');
	};

	onExitFullScreen = () => {
		this.isFullscreen = false;
		void this.addToQueue('exitfullscreen');
	};
}
