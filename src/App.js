import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import cnz from 'cnz';

import { useIsDragActive } from './hooks';
import Comparison from './Comparison';

import './App.css';

function App() {
	const [mode, setMode] = useState('SLIDE');
	const [imageA, setImageA] = useState(null);
	const [imageB, setImageB] = useState(null);
	const hasBothImages = !!(imageA && imageB);

	const isDragActive = useIsDragActive();

	const swap = useCallback(() => {
		setImageA(imageB);
		setImageB(imageA);
	}, [imageA, imageB]);

	const onDrop = useCallback((setImage, acceptedFiles) => {
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
	}, []);
	const onDropA = useCallback(
		(...args) => onDrop(setImageA, ...args),
		[onDrop]
	);
	const onDropB = useCallback(
		(...args) => onDrop(setImageB, ...args),
		[onDrop]
	);

	// Clean up generated URLs to avoid memory leaks.
	useEffect(() => () => URL.revokeObjectURL(imageA?.url), [imageA]);
	useEffect(() => () => URL.revokeObjectURL(imageB?.url), [imageB]);

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
					{hasBothImages && (
						<>
							<button className="title-button" onClick={swap}>
								🔀
							</button>
							<button
								className="title-button"
								onClick={() =>
									alert(
										'Drag two images in and compare them with a variety of tools. Sorry, I haven’t written better instructions than this yet.'
									)
								}
							>
								ℹ️
							</button>
						</>
					)}
				</div>
				<div className="mode-toggles">
					<button
						className={mode === 'SLIDE' ? 'selected' : ''}
						onClick={() => setMode('SLIDE')}
					>
						Slide
					</button>
					<button
						className={mode === 'DIFF' ? 'selected' : ''}
						onClick={() => setMode('DIFF')}
					>
						Diff
					</button>
					<button
						className={mode === 'FADE' ? 'selected' : ''}
						onClick={() => setMode('FADE')}
					>
						Fade
					</button>
					<button
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
