import {getId, getRuleString} from './css';

const {sheet} = (() => {
	const styleNode = document.createElement('style');
	
	document.head.appendChild(styleNode);
	
	return styleNode;
})();

const horizontalRules = [];
const verticalRules = [];

export const addHorizontalRule = (...rule) => {
	horizontalRules.push(getRuleString(...rule));
};

export const addVerticalRule = (...rule) => {
	verticalRules.push(getRuleString(...rule));
};

export const list = window.matchMedia('(orientation: portrait)');

export const isVertical = () => list.matches;

const update = () => {
	for (let i = sheet.cssRules.length - 1; i >= 0; --i) {
		sheet.deleteRule(i);
	}
	
	for (const rule of isVertical() ? verticalRules : horizontalRules) {
		sheet.insertRule(rule);
	}
};

export const CLASS_HIDE_HORIZONTAL = getId('hide', 'horizontal');
export const CLASS_HIDE_VERTICAL = getId('hide', 'vertical');

addHorizontalRule(`.${CLASS_HIDE_HORIZONTAL}`, {display: 'none'});
addVerticalRule(`.${CLASS_HIDE_VERTICAL}`, {display: 'none'});

window.setTimeout(() => {
	update();
	
	list.addEventListener('change', update);
}, 0);
