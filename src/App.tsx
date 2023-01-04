import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import cnz from 'cnz';
import { StepType, useTour } from '@reactour/tour';

import { ArrowLeftRight, Info /* , Sliders */ } from 'lucide-react';

import { useIsDragActive } from './hooks';
import Comparison from './Comparison';

import './App.css';

function App() {
	const { setIsOpen, setSteps, setCurrentStep } = useTour();
	const [mode, setMode] = useState<ComparisonModes>('SLIDE');
	const [imageA, setImageA] = useState<Image | null>(null);
	const [imageB, setImageB] = useState<Image | null>(null);
	const hasAnImage = !!(imageA || imageB);
	const hasBothImages = !!(imageA && imageB);

	const isDragActive = useIsDragActive();

	const swap = useCallback(() => {
		setImageA(imageB);
		setImageB(imageA);
	}, [imageA, imageB]);

	const onDrop = useCallback(
		(setImage: (image: Image) => void, acceptedFiles: Blob[]) => {
			const file = acceptedFiles[0];
			const img = new Image();
			const url = URL.createObjectURL(file);

			img.onload = () => {
				const reader = new FileReader();
				// reader.onabort = () => console.log('File reading was aborted.');
				// reader.onerror = () => console.log('File reading has failed.');
				reader.onload = () => {
					setImage({
						img,
						dataUrl: reader.result,
						height: img.height,
						width: img.width,
						url,
					});
				};
				reader.readAsDataURL(acceptedFiles[0]);
			};

			img.src = url;
		},
		[]
	);
	const onDropA = useCallback(
		(acceptedFiles: Blob[]) => onDrop(setImageA, acceptedFiles),
		[onDrop]
	);
	const onDropB = useCallback(
		(acceptedFiles: Blob[]) => onDrop(setImageB, acceptedFiles),
		[onDrop]
	);

	// Clean up generated URLs to avoid memory leaks.
	useEffect(
		() => () => {
			imageA?.url && URL.revokeObjectURL(imageA.url);
		},
		[imageA]
	);
	useEffect(
		() => () => {
			imageB?.url && URL.revokeObjectURL(imageB.url);
		},
		[imageB]
	);

	const {
		getRootProps: getRootPropsA,
		getInputProps: getInputPropsA,
		isDragActive: isDragActiveA,
	} = useDropzone({
		noClick: hasBothImages,
		onDrop: onDropA,
		accept: { 'image/*': [] },
		multiple: false,
	});
	const {
		getRootProps: getRootPropsB,
		getInputProps: getInputPropsB,
		isDragActive: isDragActiveB,
	} = useDropzone({
		noClick: hasBothImages,
		onDrop: onDropB,
		accept: { 'image/*': [] },
		multiple: false,
	});

	useEffect(() => {
		setSteps(
			hasBothImages ? [tourSteps[0], ...tourSteps.slice(2)] : tourSteps
		);
	}, [hasBothImages]);

	return (
		<div className="App">
			<header className="App-header">
				<div className="title">
					<h1>Compare images</h1>
					<button
						title="Help"
						onClick={() => {
							setCurrentStep(0);
							setIsOpen(true);
						}}
					>
						<Info size={18} />
					</button>
					<button
						title="Swap images"
						disabled={!hasAnImage}
						onClick={swap}
						className="swap"
					>
						<ArrowLeftRight size={18} />
					</button>
					{/* <button
						title="Reposition images"
						disabled={!hasBothImages}
						onClick={() =>
							alert(
								'TODO: Allow images to be dragged, and store their new position as an offset.'
							)
						}
					>
						<Sliders size={18} />
					</button> */}
				</div>
				<div className="mode-toggles">
					<button
						disabled={!hasBothImages}
						className={cnz(
							'mode-slide',
							mode === 'SLIDE' && 'selected'
						)}
						onClick={() => setMode('SLIDE')}
					>
						Slide
					</button>
					<button
						disabled={!hasBothImages}
						className={cnz(
							'mode-diff',
							mode === 'DIFF' && 'selected'
						)}
						onClick={() => setMode('DIFF')}
					>
						Diff
					</button>
					<button
						disabled={!hasBothImages}
						className={cnz(
							'mode-fade',
							mode === 'FADE' && 'selected'
						)}
						onClick={() => setMode('FADE')}
					>
						Fade
					</button>
					<button
						disabled={!hasBothImages}
						className={cnz(
							'mode-flash',
							mode === 'FLASH' && 'selected'
						)}
						onClick={() => setMode('FLASH')}
					>
						Flash
					</button>
				</div>
			</header>
			<main>
				{hasBothImages && (
					<Comparison mode={mode} imageA={imageA} imageB={imageB} />
				)}
				<div
					className={cnz(
						'dropzone',
						imageA && 'with-preview',
						hasBothImages &&
							!isDragActiveA &&
							(isDragActive ? 'transparent' : 'hidden')
					)}
					{...getRootPropsA()}
				>
					<input {...getInputPropsA()} />
					{imageA ? (
						<img
							className="image-preview"
							src={imageA.url}
							alt=""
						/>
					) : (
						<p className="helper-text">Drop an image here…</p>
					)}
				</div>
				<div
					className={cnz(
						'dropzone',
						imageB && 'with-preview',
						hasBothImages &&
							!isDragActiveB &&
							(isDragActive ? 'transparent' : 'hidden')
					)}
					{...getRootPropsB()}
				>
					<input {...getInputPropsB()} />
					{imageB ? (
						<img
							className="image-preview"
							src={imageB.url}
							alt=""
						/>
					) : (
						<p className="helper-text">
							…and drop another image here.
						</p>
					)}
				</div>
			</main>
		</div>
	);
}

export const tourSteps: StepType[] = [
	{
		selector: 'noSelector',
		content:
			'This application helps you compare two images against one-another using a variety of methods.',
		position: 'center',
	},
	{
		selector: 'noSelector',
		content:
			'Start by dragging the images that you want to compare into the app.',
		highlightedSelectors: ['.dropzone', '.dropzone + .dropzone'],
	},
	{
		selector: '.mode-slide',
		content:
			'Slide mode lets you gradually reveal the second image by dragging your mouse left and right.',
	},
	{
		selector: '.mode-diff',
		content:
			'Diff mode compares images pixel-by-pixel, then highlights the differences. It is most useful when you want to spot the difference between two images that are nearly identical.',
	},
	{
		selector: '.mode-fade',
		content:
			'Fade mode lets you gradually fade between the first and second image. Drag the slider on the right to adjust the fade amount.',
	},
	{
		selector: '.mode-flash',
		content:
			'Flash mode initially shows the first image. Click the image or press any key on your keyboard to reveal the second image.',
	},
	{
		selector: '.swap',
		content:
			'You can swap the first and second images by clicking this button.',
	},
	{
		selector: 'noSelector',
		content:
			'If you want to change the images at any point, just drag new images into the app.',
		position: 'center',
	},
];

export default App;
