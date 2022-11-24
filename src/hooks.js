import { useCallback, useEffect, useRef, useState } from 'react';

function useForceUpdate() {
	const [, setN] = useState(0);
	return useCallback(() => setN((n) => n + 1), []);
}

// `keyHandlers` example: {Escape: {onDown: () => setOpen(false)}}.
export function useKeyPresses({ keyHandlers, accept, ignore }) {
	// We keep key state in a ref so we can just mutate the same Set…
	const pressedKeysRef = useRef(new Set());
	// …but we still need a way to tell calling components to re-render.
	const forceUpdate = useForceUpdate();

	useEffect(() => {
		function skipKey({ key, metaKey }) {
			return (
				metaKey ||
				(accept && !accept.test(key)) ||
				(ignore && ignore.test(key))
			);
		}

		function downHandler(e) {
			if (skipKey(e)) return;
			const { key } = e;
			e.preventDefault();
			if (!pressedKeysRef.current.has(key)) {
				pressedKeysRef.current.add(key);
				forceUpdate();
			}
			const handlers = keyHandlers?.[key];
			handlers?.onDown?.(pressedKeysRef.current);
		}

		function upHandler(e) {
			if (skipKey(e)) return;
			const { key } = e;
			e.preventDefault();
			if (pressedKeysRef.current.has(key)) {
				pressedKeysRef.current.delete(key);
				forceUpdate();
			}
			const handlers = keyHandlers?.[key];
			handlers?.onUp?.(pressedKeysRef.current);
		}

		window.addEventListener('keydown', downHandler);
		window.addEventListener('keyup', upHandler);
		return () => {
			window.removeEventListener('keydown', downHandler);
			window.removeEventListener('keyup', upHandler);
		};
	}, [forceUpdate, keyHandlers, accept, ignore]);

	return pressedKeysRef.current;
}

// Returns whether a file is being dragged over the window.
export function useIsDragActive() {
	const [isDragActive, setIsDragActive] = useState(false);

	useEffect(() => {
		function dragEnterHandler(e) {
			e.preventDefault();
			setIsDragActive(true);
		}

		function dragLeaveHandler(e) {
			e.preventDefault();
			setIsDragActive(false);
		}

		function dragOverHandler(e) {
			e.preventDefault();
			setIsDragActive(true);
		}

		function dropHandler(e) {
			e.preventDefault();
			setIsDragActive(false);
		}

		window.addEventListener('dragenter', dragEnterHandler);
		window.addEventListener('dragleave', dragLeaveHandler);
		window.addEventListener('dragover', dragOverHandler);
		window.addEventListener('drop', dropHandler);
		return () => {
			window.removeEventListener('dragenter', dragEnterHandler);
			window.removeEventListener('dragleave', dragLeaveHandler);
			window.removeEventListener('dragover', dragOverHandler);
			window.removeEventListener('drop', dropHandler);
		};
	}, []);

	return isDragActive;
}
