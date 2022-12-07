import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import cnz from 'cnz';

import { ArrowLeftRight, Info, Sliders } from 'lucide-react';

import { useIsDragActive } from './hooks';
import Comparison from './Comparison';

import './App.css';

function App() {
	const [mode, setMode] = useState<ComparisonModes>('DIFF');
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

	return (
		<div className="App">
			<header className="App-header">
				<div className="title">
					<h1>Compare images</h1>
					<button
						onClick={() =>
							alert(
								'Drag two images in and compare them with a variety of tools. Sorry, I haven’t written better instructions than this yet.'
							)
						}
					>
						<Info size={18} />
					</button>
					<button disabled={!hasAnImage} onClick={swap}>
						<ArrowLeftRight size={18} />
					</button>
					<button
						disabled={!hasBothImages}
						onClick={() =>
							alert(
								'TODO: Allow images to be dragged, and store their new position as an offset.'
							)
						}
					>
						<Sliders size={18} />
					</button>
				</div>
				<div className="mode-toggles">
					<button
						disabled={!hasBothImages}
						className={mode === 'SLIDE' ? 'selected' : ''}
						onClick={() => setMode('SLIDE')}
					>
						Slide
					</button>
					<button
						disabled={!hasBothImages}
						className={mode === 'DIFF' ? 'selected' : ''}
						onClick={() => setMode('DIFF')}
					>
						Diff
					</button>
					<button
						disabled={!hasBothImages}
						className={mode === 'FADE' ? 'selected' : ''}
						onClick={() => setMode('FADE')}
					>
						Fade
					</button>
					<button
						disabled={!hasBothImages}
						className={mode === 'FLASH' ? 'selected' : ''}
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

export default App;
