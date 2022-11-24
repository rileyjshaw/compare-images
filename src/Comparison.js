import { Fragment, useCallback, useState } from 'react';
import ReactCompareImage from 'react-compare-image'; // TODO: React Compare Slider might be better.
import pixelmatch from 'pixelmatch';
import cnz from 'cnz';

import { useKeyPresses } from './hooks';

import './Comparison.css';

const keyConfig = {
	accept: /^[A-Za-z0-9,. ]|Space$/,
};

function Slide({ imageA, imageB }) {
	return (
		<div className="slide-container">
			<ReactCompareImage
				leftImage={imageA.url}
				rightImage={imageB.url}
				sliderLineColor="#000"
				sliderLineWidth={1}
				handle={<Fragment />}
			/>
		</div>
	);
}

function Diff({ imageA, imageB }) {
	const [isImageDiffed, setIsImageDiffed] = useState(false);

	const canvasRef = useCallback(
		(canvas) => {
			// Unblock the initial render.
			setTimeout(() => {
				setIsImageDiffed(false);
				if (!canvas || !imageA || !imageB) return;

				const { width, height } = imageA;
				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext('2d');

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
						threshold: 0.1,
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

function Fade({ imageA, imageB }) {
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
function Flash({ imageA, imageB }) {
	const pressedKeys = useKeyPresses(keyConfig);
	const showImageB = !!pressedKeys.size;
	return (
		<img
			className="full-image"
			src={showImageB ? imageB.url : imageA.url}
			alt=""
		/>
	);
}

function Comparison({ mode, ...props }) {
	switch (mode) {
		case 'SLIDE':
			return <Slide {...props} />;
		case 'DIFF':
			return <Diff {...props} />;
		case 'FADE':
			return <Fade {...props} />;
		case 'FLASH':
			return <Flash {...props} />;
		default:
			return null;
	}
}

export default Comparison;
