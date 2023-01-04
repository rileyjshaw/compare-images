import React from 'react';
import ReactDOM from 'react-dom/client';
import { TourProvider } from '@reactour/tour';

import App, { tourSteps } from './App';

import './index.css';

const tourStyles = {
	dot: (base: any, { current }: { current: boolean }) => {
		if (!current) return base;
		return { ...base, backgroundColor: '#000' };
	},
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<TourProvider
			steps={tourSteps}
			showBadge={false}
			styles={tourStyles}
			padding={{ mask: 0 }}
		>
			<App />
		</TourProvider>
	</React.StrictMode>
);
