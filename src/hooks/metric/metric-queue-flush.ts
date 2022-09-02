import uuid from 'react-native-uuid';
import {MediaTypeTypes} from '../../types';
import {getTimestamp} from './functions/getTimestamp';
import {EventLogFlushOptions, MetricQueue} from './metric-queue';
import {METRIC_OPTIONS} from './contants';
import {getClientId} from './functions/getClientId';

export type MetricMediaTypes = {
	type?: MediaTypeTypes;
	videoId?: string;
	workspaceId?: string;
	projectId?: string;
	folderId?: string;
};

type MetricQueueFlushTypes = {
	media?: MetricMediaTypes;
	queue: MetricQueue;
	externalId?: string;
};

export class MetricQueueFlush {
	timerInterval: ReturnType<typeof setInterval> = 0;

	clientId: string | undefined;
	watchingId = uuid.v4().toString();
	queue: MetricQueue;

	media: MetricMediaTypes | undefined;
	externalId?: string;

	constructor({queue, media, externalId}: MetricQueueFlushTypes) {
		this.media = media;
		this.externalId = externalId;
		this.queue = queue;
	}

	destroy = async () => {
		this.stop();
		await this.flash();
	};

	setMedia = async (media?: MetricMediaTypes) => {
		if (this.media?.videoId !== media?.videoId) {
			await this.flash();
			this.watchingId = uuid.v4().toString();
		}
		this.media = media;
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
			type: this.media?.type || '',
			videoID: this.media?.videoId || '',
			folderID: this.media?.folderId || '',
			projectID: this.media?.projectId || '',
			workspaceID: this.media?.workspaceId || '',
		};
	};

	start = () => {
		this.timerInterval = setInterval(() => {
			this.flash();
		}, METRIC_OPTIONS.interval);
	};

	stop = () => {
		this.flash();
		clearInterval(this.timerInterval);
	};

	flash = async () => {
		const session = await this.getSession();

		this.queue.flush({
			url: METRIC_OPTIONS.url,
			timestamp: this.getTimestamp(),
			session: session,
			media: this.getMedia(),
		});
	};
}
