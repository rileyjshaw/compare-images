import type * as CSS from 'csstype';

declare module 'csstype' {
	interface Properties {
		// Add a CSS Custom Property
		'--fade-amount'?: number;
	}
}
