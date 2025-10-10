export const getId = (...parts) => parts.join('-');
export const getIdGetter = (...prefixes) => getId.bind(null, ...prefixes);

const styleNode = document.createElement('style');

document.head.appendChild(styleNode);

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
