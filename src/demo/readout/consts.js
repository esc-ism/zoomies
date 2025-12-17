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

const getSymbol = (symbol) => {
	const span = document.createElement('span');
	
	span.innerText = symbol;
	
	span.style.fontSize = '0.8em';
	span.style.position = 'relative';
	span.style.bottom = '0.1em';
	
	return span;
};

const getRoundedString = (number) => {
	if (Math.abs(number) >= 99.95) {
		return [getSymbol(number < 0 ? '⩽' : '⩾'), document.createTextNode('100')];
	}
	
	const pow = Math.abs(number) < 9.995 ? 2 : 1;
	const decimal = Math.abs(number % 1);
	const emptyDecimal = '0'.repeat(pow);
	const decimalString = `${Math.round(decimal * Math.pow(10, pow))}`.padStart(pow, '0');
	
	if (decimalString.length > pow) {
		return [document.createTextNode(`${Math.round(number)}.${emptyDecimal}`)];
	}
	
	const integer = Math.trunc(number);
	const sign = integer === 0 && decimalString !== emptyDecimal && number < 0 ? '-' : '';
	
	return [document.createTextNode(`${sign}${integer}.${decimalString}`)];
};

export const FORMATTERS = {
	[IDS.X]: (value) => getRoundedString(value),
	[IDS.Y]: (value) => getRoundedString(value),
	[IDS.ZOOM]: (value) => getRoundedString(value),
	[IDS.ANGLE]: (value) => [document.createTextNode(Math.round((DEGREES[90] - value) * MULTIPLIER_DEGREES))],
	[IDS.RATIO]: (value) => getRoundedString(value),
};

export const POSTFIXES = {
	[IDS.ZOOM]: '×',
	[IDS.ANGLE]: '°',
};
