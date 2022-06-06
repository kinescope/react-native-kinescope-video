export type SubtitleTypes = {
	title: string;
	language: string;
	type: 'text/vtt';
	uri: string;
};

export type ChapterTypes = {
	time: number;
	title: string;
};

export type ManifestTypes = {
	id: string;
	workspaceId: string;
	projectId: string;
	folderId: string;
	title: string;
	posterUrl: string;
	chapters: ChapterTypes[];
	subtitles: SubtitleTypes[];
	hlsLink: string;
	dashLink: string;
};

export type ManifestEventLoadTypes = {
	title: string;
	chapters: ChapterTypes[];
	subtitles: {
		title: string;
		language: string;
	}[];
};

export type ManifestEventsTypes = {
	onManifestLoadStart?: () => void;
	onManifestLoad?: (manifest: ManifestEventLoadTypes) => void;
	onManifestError?: (error: unknown) => void;
};
