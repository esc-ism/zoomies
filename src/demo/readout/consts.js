import {DEGREES} from '@/shared';

export const ID = 'demo-readout';

export const IDS = {
	X: 'x',
	Y: 'y',
	ZOOM: 'zoom',
	ANGLE: 'angle',
};

const MULTIPLIER_DEGREES = 180 / Math.PI;

const getRoundedString = (number, pow = 2) => {
	const decimal = Math.abs(number % 1);
	const decimalString = `${Math.round(decimal * Math.pow(10, pow))}`.padStart(pow, '0');
	const integer = Math.trunc(number);
	
	return `${integer === 0 && number < 0 ? '-' : ''}${integer}.${decimalString}`;
};

export const PRETTIFIERS = {
	[IDS.X]: (value) => getRoundedString(value),
	[IDS.Y]: (value) => getRoundedString(value),
	[IDS.ZOOM]: (value) => getRoundedString(value),
	[IDS.ANGLE]: (value) => Math.round((DEGREES[90] - value) * MULTIPLIER_DEGREES),
};

export const POSTFIXES = {
	[IDS.ZOOM]: '×',
	[IDS.ANGLE]: '°',
};
