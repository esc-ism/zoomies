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
	'--color': '#dddddd',
	'--background': '#231e25',
	
	'font-family': '"High Tower Text", courier-new, monospace',
	'font-size': '20px',
	'font-weight': '400',
	'background-color': 'var(--background)',
	color: 'var(--color)',
});
