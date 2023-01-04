import { useCallback, useState } from 'react';
import {
	ReactCompareSlider,
	ReactCompareSliderHandle,
	ReactCompareSliderImage,
} from 'react-compare-slider';
import pixelmatch from 'pixelmatch';
import cnz from 'cnz';

import { useKeyPresses } from './hooks';

import './Comparison.css';

const keyConfig = {
	accept: /^[A-Za-z0-9,. ]|Space$/,
};

interface ComparisonProps {
	imageA: Image;
	imageB: Image;
}

function Slide({ imageA, imageB }: ComparisonProps) {
	return (
		<div className="slide-container">
			<ReactCompareSlider
				itemOne={<ReactCompareSliderImage src={imageA.url} alt="" />}
				itemTwo={<ReactCompareSliderImage src={imageB.url} alt="" />}
				handle={
					<ReactCompareSliderHandle
						buttonStyle={{ display: 'none' }}
						linesStyle={{
							height: '100%',
							width: 1,
							background: '#000',
						}}
					/>
				}
			/>
		</div>
	);
}

function Diff({ imageA, imageB }: ComparisonProps) {
	const [isImageDiffed, setIsImageDiffed] = useState(false);

	const canvasRef = useCallback(
		(canvas: HTMLCanvasElement | null) => {
			// Unblock the initial render.
			setTimeout(() => {
				setIsImageDiffed(false);
				if (!canvas || !imageA || !imageB) return;

				const { width, height } = imageA;
				canvas.width = width;
				canvas.height = height;

				const ctx = canvas.getContext('2d');
				if (!ctx) {
					throw new Error('Could not get canvas context.');
				}

				// Note: This doesn’t work because it’s the raw file data, not pixel data.
				// const imageAData = new Uint8Array(imageA.arrayBuffer);
				// const imageBData = new Uint8Array(imageB.arrayBuffer);

				ctx.drawImage(imageA.img, 0, 0);
				const imageAContext = ctx.getImageData(0, 0, width, height);

				ctx.drawImage(imageB.img, 0, 0);
				const imageBContext = ctx.getImageData(0, 0, width, height);

				const diffContext = ctx.createImageData(width, height);

				pixelmatch(
					imageAContext.data,
					imageBContext.data,
					diffContext.data,
					width,
					height,
					{
						threshold: 0.5,
					}
				);
				ctx.clearRect(0, 0, width, height);
				ctx.putImageData(diffContext, 0, 0);
				setIsImageDiffed(true);
			}, 0);
		},
		[imageA, imageB]
	);

	const isSameDimensions =
		imageA &&
		imageB &&
		imageA.width === imageB.width &&
		imageA.height === imageB.height;

	return (
		<div className="full-image diff-container">
			{isSameDimensions ? (
				<>
					<canvas
						ref={canvasRef}
						className={cnz(
							'full-image diff-item',
							isImageDiffed ? '' : 'hidden'
						)}
					/>
					{!isImageDiffed && (
						<p className="helper-text loading-text">
							Creating image diff. Please wait…
						</p>
					)}
				</>
			) : (
				<p className="helper-text">
					Diff mode only works for images with identical dimensions.
				</p>
			)}
		</div>
	);
}

function Fade({ imageA, imageB }: ComparisonProps) {
	const [fadeAmount, setFadeAmount] = useState(0.5);

	return (
		<div
			className="full-image fade-container"
			style={{ '--fade-amount': fadeAmount }}
		>
			<img className="full-image fade-item" src={imageA.url} alt="" />
			<img
				className="full-image fade-item fade-item-b"
				src={imageB.url}
				alt=""
			/>
			<div className="fade-slider-container">
				<span className="fade-char fade-char-b">B</span>
				<input
					className="fade-slider"
					type="range"
					min={0}
					max={1}
					step="any"
					value={fadeAmount}
					onChange={(e) => setFadeAmount(+e.target.value)}
				/>
				<span className="fade-char">A</span>
			</div>
		</div>
	);
}

function Flash({ imageA, imageB }: ComparisonProps) {
	const [isMouseDown, setIsMouseDown] = useState(false);
	const pressedKeys = useKeyPresses(keyConfig);
	const showImageB = isMouseDown || !!pressedKeys.size;
	return (
		<div
			className="full-image flash-container"
			onMouseDown={() => setIsMouseDown(true)}
			onTouchStart={() => setIsMouseDown(true)}
			onMouseUp={() => setIsMouseDown(false)}
			onTouchEnd={() => setIsMouseDown(false)}
		>
			<img
				className="full-image"
				src={showImageB ? imageB.url : imageA.url}
				alt=""
			/>
		</div>
	);
}

function Comparison({
	mode,
	imageA,
	imageB,
}: { mode: ComparisonModes } & ComparisonProps) {
	switch (mode) {
		case 'SLIDE':
			return <Slide imageA={imageA} imageB={imageB} />;
		case 'DIFF':
			return <Diff imageA={imageA} imageB={imageB} />;
		case 'FADE':
			return <Fade imageA={imageA} imageB={imageB} />;
		case 'FLASH':
			return <Flash imageA={imageA} imageB={imageB} />;
		default:
			return null;
	}
}

export default Comparison;
