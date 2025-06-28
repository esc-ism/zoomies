import {DEGREES} from '@/shared';

export const ID = 'demo-readout';

export const IDS = {
	X: 'x',
	Y: 'y',
	ZOOM: 'zoom',
	ANGLE: 'angle',
	RATIO: 'ratio',
};

const MULTIPLIER_DEGREES = 180 / Math.PI;

const getRoundedString = (number, pow = 2) => {
	const decimal = Math.abs(number % 1);
	const emptyDecimal = '0'.repeat(pow);
	const decimalString = `${Math.round(decimal * Math.pow(10, pow))}`.padStart(pow, '0');
	
	if (decimalString.length > pow) {
		return `${Math.round(number)}.${emptyDecimal}`;
	}
	
	const integer = Math.trunc(number);
	const sign = integer === 0 && decimalString !== emptyDecimal && number < 0 ? '-' : '';
	
	return `${sign}${integer}.${decimalString}`;
};

export const FORMATTERS = {
	[IDS.X]: (value) => getRoundedString(value),
	[IDS.Y]: (value) => getRoundedString(value),
	[IDS.ZOOM]: (value) => getRoundedString(value),
	[IDS.ANGLE]: (value) => Math.round((DEGREES[90] - value) * MULTIPLIER_DEGREES),
	[IDS.RATIO]: (value) => getRoundedString(value),
};

export const POSTFIXES = {
	[IDS.ZOOM]: '×',
	[IDS.ANGLE]: '°',
};
