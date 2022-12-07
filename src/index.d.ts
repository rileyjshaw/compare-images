interface Image {
	img: HTMLImageElement;
	dataUrl: string | ArrayBuffer | null;
	height: number;
	width: number;
	url: string;
}

type ComparisonModes = 'SLIDE' | 'DIFF' | 'FADE' | 'FLASH';
