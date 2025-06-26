import {getIdGetter} from '@css';

import * as code from './code';

import {CLASS_BUTTON, CLASS_CODE, CLASS_WRAPPER, TWEENS_RESET} from './consts';

const getCodeId = getIdGetter('text', 'code');

let count = 0;
let demo;

export const registerDemo = (newDemo) => {
	demo = newDemo;
	
	count = 0;
};

const addContent = (parent, content) => {
	if (typeof content === 'object') {
		parent.appendChild(getNode(content));
	} else if (parent.lastChild && parent.lastChild.nodeType === Node.TEXT_NODE) {
		parent.lastChild.textContent += ` ${content}`;
	} else {
		parent.appendChild(document.createTextNode(content));
	}
};

const getNode = (description) => {
	const {content = [], classList = [], tag = 'p', style = {}, ...attributes} = (typeof description === 'string' || Array.isArray(description)) ? {content: description} : description;
	
	const node = document.createElement(tag);
	
	if (Array.isArray(content)) {
		for (const part of content) {
			addContent(node, part);
		}
	} else {
		addContent(node, content);
	}
	
	for (const [property, value] of Object.entries(style)) {
		node.style[property] = value;
	}
	
	for (const [property, value] of Object.entries(attributes)) {
		node[property] = value;
	}
	
	node.classList.add(...classList);
	
	return node;
};

export const getCode = (statements) => {
	const doReset = count === 0;
	const id = getCodeId(count++);
	
	demo.onInit(() => {
		if (doReset) {
			code.reset(demo);
		}
		
		code.generate(document.getElementById(id), statements, demo);
		
		if (id === 'text-code-0') {
			document.getElementById(id).scrollIntoView({block: 'center'});
		}
	});
	
	return {
		content: {
			tag: 'code',
			content: '',
			id,
		},
		classList: [CLASS_CODE],
	};
};

export const getButton = (text, tweens, {doReset = false, getParam = () => undefined} = {}) => {
	const resetTweens = doReset ? TWEENS_RESET : [];
	
	return {
		tag: 'span',
		content: text,
		classList: [CLASS_BUTTON],
		onpointerover: () => {
			const param = getParam();
			
			demo.setTween(...resetTweens, ...tweens.map((tween) => typeof tween === 'function' ? tween(param) : tween));
		},
		onpointerout: () => {
			if (!demo.tween) {
				return;
			}
			
			if (demo.tween.totalDuration() > 0) {
				demo.tween
					.timeScale(3)
					.reverse();
			} else {
				demo.tween.revert();
				
				demo.tween.vars.onUpdate();
				demo.tween.vars.onReverseComplete();
			}
		},
		onclick: () => {
			if (!demo.tween) {
				return;
			}
			
			demo.constructor.progress.complete();
			
			demo.tween.progress(1);
			
			demo.deleteTween();
		},
	};
};

export const getText = (...children) => {
	const wrapper = document.createElement('div');
	
	wrapper.style.height = '100%';
	wrapper.style.padding = '0 20px';
	wrapper.style.boxSizing = 'border-box';
	wrapper.style.overflow = 'auto';
	wrapper.style.scrollbarColor = 'var(--color) transparent';
	wrapper.style.flexGrow = '1';
	wrapper.style.lineHeight = '1.3';
	
	wrapper.classList.add(CLASS_WRAPPER);
	
	wrapper.append(...children.map(getNode));
	
	return wrapper;
};
