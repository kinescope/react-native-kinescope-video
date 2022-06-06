import {Batch, Event, Error, TechSpecs} from './protobuf/metrics';
import techSpecs from './tech-specs';
import {videoVersion} from './contants';
import {fetch} from 'react-native-fetch-api';

export type EventLogPlaybackEvent = Event;
export type EventLogErrorEvent = Error;

export type EventLogEntry =
	| {readonly type: 'playback'; readonly data: EventLogPlaybackEvent}
	| {readonly type: 'error'; readonly data: EventLogErrorEvent};

export interface EventLogFlushOptions
	extends Pick<Batch, 'session' | 'media'>,
		Pick<TechSpecs, 'timestamp'> {
	readonly url: string;
}

export class MetricQueue {
	queue = new Set<EventLogEntry>();

	add = (event: EventLogEntry) => {
		this.queue.add(event);
	};

	flush = ({url, session, media, timestamp}: EventLogFlushOptions) => {
		if (this.queue.size === 0) return;

		const performance: Batch['performance'] = [];
		const events: Batch['events'] = [];
		const errors: Batch['errors'] = [];

		this.queue.forEach(entry => {
			if (entry.type === 'playback') {
				events.push(entry.data);
			} else if (entry.type === 'error') {
				errors.push(entry.data);
			}
		});

		const batchMessage = Batch.create({
			player: {version: videoVersion},
			session,
			media,
			techSpecs: {...techSpecs, timestamp},
			performance,
			events,
			errors,
		});
		const batchData = Batch.toBinary(batchMessage);

		fetch(url, {body: batchData, method: 'POST', keepalive: true}).then(() => {
			console.log('MetricQueue fetch');
		});

		this.queue.clear();
	};
}
