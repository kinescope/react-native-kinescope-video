import uuid from 'react-native-uuid';
import {getTimestamp} from './functions/getTimestamp';
import {EventLogFlushOptions, MetricQueue} from './metric-queue';
import {metricOptions} from './contants';
import {getClientId} from './functions/getClientId';

type MetricQueueFlushTypes = {
	videoId?: string;
	queue: MetricQueue;
	externalId?: string;
};

export class MetricQueueFlush {
	timerInterval: ReturnType<typeof setInterval> = 0;

	clientId: string | undefined;
	watchingId = uuid.v4().toString();
	queue: MetricQueue;

	videoId: string | undefined;
	externalId?: string;

	constructor({queue, videoId, externalId}: MetricQueueFlushTypes) {
		this.videoId = videoId;
		this.externalId = externalId;
		this.queue = queue;
	}

	destroy = async () => {
		this.stop();
		await this.flash();
	};

	setVideoId = async (videoId?: string) => {
		if (this.videoId !== videoId) {
			await this.flash();
			this.watchingId = uuid.v4().toString();
		}
		this.videoId = videoId;
	};

	setExternalId = (externalId?: string) => {
		this.externalId = externalId;
	};

	getClientId = async () => {
		if (this.clientId) {
			return this.clientId;
		}
		this.clientId = await getClientId();
		return this.clientId;
	};

	getTimestamp = (): EventLogFlushOptions['timestamp'] => {
		return {
			client: getTimestamp(),
			server: 0,
		};
	};

	getSession = async (): Promise<EventLogFlushOptions['session']> => {
		return {
			iD: await this.getClientId(),
			viewID: this.watchingId,
			externalID: this.externalId ?? '',
		};
	};

	getMedia = (): EventLogFlushOptions['media'] => {
		return {
			type: '',
			videoID: this.videoId || '',
			folderID: '',
			projectID: '',
			workspaceID: '',
		};
	};

	start = () => {
		this.timerInterval = setInterval(() => {
			this.flash();
		}, metricOptions.interval);
	};

	stop = () => {
		clearInterval(this.timerInterval);
	};

	flash = async () => {
		const session = await this.getSession();

		this.queue.flush({
			url: metricOptions.url,
			timestamp: this.getTimestamp(),
			session: session,
			media: this.getMedia(),
		});
	};
}
