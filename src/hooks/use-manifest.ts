import {useEffect, useState} from 'react';
import {TextTrackType} from 'react-native-video';
import {
	ManifestEventsTypes,
	ManifestEventLoadTypes,
	ManifestTypes,
	ChapterTypes,
	SubtitleTypes,
} from '../types';
export type {ManifestEventsTypes};

type UseManifestTypes = ManifestEventsTypes & {
	videoId: string;
};

function transformSubtitles(subtitles: any[]): SubtitleTypes[] {
	if (!subtitles) {
		return [];
	}
	return subtitles.map(subtitle => ({
		title: subtitle.description,
		language: subtitle.language,
		type: TextTrackType.VTT,
		uri: subtitle.url,
	}));
}

function transformChapters(chapters: any[]): ChapterTypes[] {
	if (!chapters) {
		return [];
	}
	return chapters.map(chapter => ({
		time: chapter.time,
		title: chapter.title,
	}));
}

function transformManifest(json: any): ManifestTypes {
	const subtitles: SubtitleTypes[] = transformSubtitles(json?.subtitles);
	const chapters: ChapterTypes[] = transformChapters(json?.chapters?.items);
	return {
		id: json.id,
		title: json.title,
		posterUrl: json.poster?.url,
		subtitles: subtitles,
		chapters: chapters,
		hlsLink: json?.hls_link,
		dashLink: json?.dash_link,
	};
}

function publicManifest(manifest: ManifestTypes): ManifestEventLoadTypes {
	return {
		title: manifest.title,
		subtitles: manifest.subtitles.map(subtitle => ({
			title: subtitle.title,
			language: subtitle.language,
		})),
		chapters: manifest.chapters,
	};
}

export default function useManifest({
	videoId,
	onManifestLoadStart,
	onManifestLoad,
	onManifestError,
}: UseManifestTypes) {
	const [loading, setLoading] = useState(true);
	const [manifest, setManifest] = useState<ManifestTypes | null>(null);

	const getManifest = async () => {
		try {
			setLoading(true);
			setManifest(null);

			const response = await fetch(`https://kinescope.io/${videoId}.json`);
			const json = await response.json();
			const manifest: ManifestTypes = transformManifest(json);

			setManifest(manifest);
			onManifestLoad && onManifestLoad(publicManifest(manifest));
		} catch (error) {
			onManifestError && onManifestError(error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		setManifest(null);
		onManifestLoadStart && onManifestLoadStart();
		getManifest();
	}, [videoId]);

	return {
		loading: loading,
		manifest: manifest,
	};
}
