import {getTextId} from '../../consts';

export const CLASS_BUTTON = getTextId('button', 'page');

export const PREFIX_ID = getTextId('button', 'page', '');

export const IDS = {
	UNBOUND: 'Unbound',
	CENTER: 'Viewport Center',
	EDGE: 'Viewport Edge',
	SINGLE: 'Single-Line',
	IMAGE: 'Double-Line',
	DOUBLE: 'Doubled Down',
};

export const INDEXES = {
	[IDS.UNBOUND]: 1,
	[IDS.CENTER]: 2,
	[IDS.EDGE]: 3,
	[IDS.SINGLE]: 4,
	[IDS.IMAGE]: 5,
	[IDS.DOUBLE]: 6,
};
