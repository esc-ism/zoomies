import {getTextId} from '../../consts';

export const CLASS_BUTTON = getTextId('button', 'page');

export const PREFIX_ID = getTextId('button', 'page', '');

// todo redo; single source of truth
export const IDS = {
	SPLASH: 'Introduction',
	UNBOUND: 'Unbound',
	CENTER: 'Viewport Center',
	EDGE: 'Viewport Edge',
	EDGER: 'Viewport Edge+',
	SINGLE: 'Single-Line',
	IMAGE: 'Double-Line',
	DOUBLE: 'Doubled Down',
	TRIPLE: 'Tripled Down',
};

export const INDEXES = {
	[IDS.SPLASH]: 0,
	[IDS.UNBOUND]: 1,
	[IDS.CENTER]: 2,
	[IDS.EDGE]: 3,
	[IDS.EDGER]: 4,
	[IDS.SINGLE]: 5,
	[IDS.IMAGE]: 6,
	[IDS.DOUBLE]: 7,
	[IDS.TRIPLE]: 8,
};

for (const [id, index] of Object.entries(INDEXES)) {
	IDS[index] = id;
}
