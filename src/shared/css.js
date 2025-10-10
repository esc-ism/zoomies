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

class OrientationRules {
	#query;
	#ruleStrings = [];
	
	constructor(mediaQuery) {
		this.#query = `@media (${mediaQuery})`;
	}
	
	add(...rule) {
		this.#ruleStrings.push(getRuleString(...rule));
	}
	
	enable() {
		styleNode.sheet.insertRule(`${this.#query}{${this.#ruleStrings.join('')}}`);
		
		// Ideally the instance would be garbage collected now
		this.#query = undefined;
		this.#ruleStrings = undefined;
	}
}

export const HorizontalRules = new OrientationRules(`not (max-aspect-ratio: 1/1)`);
export const VerticalRules = new OrientationRules(`max-aspect-ratio: 1/1`);

export const CLASS_HIDE_HORIZONTAL = getId('hide', 'horizontal');
export const CLASS_HIDE_VERTICAL = getId('hide', 'vertical');

HorizontalRules.add(`.${CLASS_HIDE_HORIZONTAL}`, {display: 'none'});
VerticalRules.add(`.${CLASS_HIDE_VERTICAL}`, {display: 'none'});

window.setTimeout(() => {
	HorizontalRules.enable();
	VerticalRules.enable();
}, 0);
