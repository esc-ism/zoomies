const styleNode = document.createElement('style');

document.head.appendChild(styleNode);

export const getIdGetter = (...prefixes) => (...parts) => [...prefixes, ...parts].join('-');

const getStyleString = ([property, value]) => `${property}:${value};`;

const getRuleStrings = (styles) => Object.entries(styles).map(getStyleString).join('');

export const getRuleString = (selectors, styles) => {
	const styleString = getRuleStrings(styles);
	const selectorString = typeof selectors === 'string' ? selectors : selectors.join(',');
	
	return `${selectorString}{${styleString}}`;
};

export const addRule = (selectors, styles, {sheet} = styleNode) => {
	sheet.insertRule(getRuleString(selectors, styles));
};

addRule(':root', {
	'--color': '#e6e6e6',
	'--background': '#242424',
	
	'font-family': 'system-ui, Avenir, Helvetica, Arial, sans-serif',
	'line-height': '1.5',
	'font-weight': '400',
	'background-color': 'var(--background)',
	color: 'var(--color)',
});
