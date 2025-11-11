import demo from '@/demo';
import {inputListener} from '@/consts';
import {SUB_PIXEL_BS} from '@/shared';

import generateCode from '../code';
import {
	CLASS_BUTTON, CLASS_CODE, CLASS_WRAPPER, TWEENS_RESET,
	CLASS_INSTRUCTION, CLASS_FLASH_CONTAINER, CLASS_BUTTON_ACTIVE,
	CLASS_MATH_TITLE, CLASS_MATH_WRAPPER, CLASS_MATH_CONTAINER, CLASS_MATH_BODY,
} from '../consts';

import * as move from './svg/move';
import {xmlns} from './math';

let activeButton;

for (const action of Object.keys(demo.listeners)) {
	demo.hooks[action].add(() => {
		if (activeButton) {
			activeButton.removeEventListener('blur', releaseButton);
			activeButton.blur();
			
			activeButton.classList.remove(CLASS_BUTTON_ACTIVE);
			activeButton = undefined;
			
			demo.deleteTween();
			demo.progress.complete();
		}
	}, true);
}

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
	if (description instanceof Node) {
		return description;
	}
	
	const {
		content = [],
		classList,
		tag = 'p',
		style = {},
		xmlns,
		callback,
		setAttributes = {},
		...attributes
	} = (typeof description === 'string' || Array.isArray(description)) ? {content: description} : description;
	
	const node = xmlns ? document.createElementNS(xmlns, tag) : document.createElement(tag);
	
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
	
	for (const [property, value] of Object.entries(setAttributes)) {
		node.setAttribute(property, value);
	}
	
	if (classList) {
		node.classList.add(...classList);
	}
	
	if (callback) {
		callback(node);
	}
	
	return node;
};

export const getCode = (callbacks, statements) => {
	return {
		content: {
			tag: 'div',
			content: {
				tag: 'code',
				content: '',
				callback: (node) => {
					callbacks.push({
						start: generateCode.bind(null, node, statements),
						end: () => {
							node.previousSibling.remove();
							
							while (node.firstChild) {
								node.firstChild.remove();
							}
						},
					});
				},
			},
		},
		classList: [CLASS_CODE, CLASS_FLASH_CONTAINER],
	};
};

const releaseButton = () => {
	activeButton.classList.remove(CLASS_BUTTON_ACTIVE);
	activeButton = undefined;
	
	if (demo.tween.totalDuration() > 0 && demo.tween.time() > 0) {
		demo.tween
			.timeScale(3)
			.reverse();
	} else {
		demo.tween.revert();
		
		demo.tween.vars.onReverseComplete();
	}
};

export const getButton = (text, tweens, {doReset = false, getParam = () => undefined} = {}) => {
	const resetTweens = doReset ? TWEENS_RESET : [];
	
	let element;
	
	return {
		tag: 'span',
		content: text,
		classList: [CLASS_BUTTON],
		tabIndex: 0,
		onclick: () => {
			if (element.isSameNode(activeButton)) {
				element.removeEventListener('blur', releaseButton);
				
				releaseButton();
				
				return;
			}
			
			element.classList.add(CLASS_BUTTON_ACTIVE);
			activeButton = element;
			
			element.addEventListener('blur', releaseButton, {once: true});
			
			const param = getParam();
			
			demo.setTween(...resetTweens, ...tweens.map((tween) => typeof tween === 'function' ? tween(param) : tween));
		},
		callback: (_element) => {
			element = _element;
		},
	};
};

const getPIncluder = (() => {
	const element = document.createElement('span');
	
	element.style.display = 'flex';
	
	return () => element.cloneNode();
})();

export const getText = (...children) => {
	const wrapper = document.createElement('div');
	const container = document.createElement('div');
	
	wrapper.style.lineHeight = '1.2';
	// I guess chrome gives outlines to scroll elements
	wrapper.style.outline = 'none';
	wrapper.style.minWidth = '100%';
	wrapper.style.scrollSnapAlign = 'center';
	wrapper.style.scrollSnapStop = 'always';
	
	container.style.padding = '0 1em';
	container.style.boxSizing = 'border-box';
	
	wrapper.classList.add(CLASS_WRAPPER);
	
	container.append(getPIncluder(), ...children.map(getNode), getPIncluder());
	wrapper.append(container);
	
	return wrapper;
};

export const getInstruction = (...content) => ({classList: [CLASS_INSTRUCTION], content});

export const getInputDependent = (get) => ({tag: 'span', callback: (element) => {
	inputListener.add(() => {
		element.innerText = get(inputListener.isMouse);
	});
}});

const getMathTitle = (content, isFirst = false) => {
	const title = {tag: 'mtext', classList: [CLASS_MATH_TITLE], onclick: (() => {
		let isHidden = false;
		
		return ({target}) => {
			// eslint-disable-next-line no-cond-assign
			if (isHidden = !isHidden) {
				target.nextElementSibling.style.display = 'none';
			} else {
				target.nextElementSibling.style.removeProperty('display');
			}
		// target.parentElement.style.paddingBottom = '1px';
		};
	})(), xmlns, content};
	
	if (isFirst) {
		return [title];
	}
	
	const blocker = document.createElement('div');
	
	blocker.style.position = 'sticky';
	blocker.style.left = '0';
	blocker.style.width = '10px';
	blocker.style.height = `${SUB_PIXEL_BS}px`;
	blocker.style.marginTop = `-${SUB_PIXEL_BS}px`;
	blocker.style.backgroundColor = '#372d2d';
	
	const line = document.createElement('div');
	
	line.style.backgroundColor = 'var(--border-color)';
	line.style.verticalAlign = 'center';
	// todo make borders SUB_PX_BS instead of 1px
	line.style.height = `${SUB_PIXEL_BS}px`;
	
	return [line, blocker, title];
};

export const getMath = (...sections) => {
	const content = [];
	
	for (let i = sections.length - 1; i >= 0; --i) {
		const section = sections[i];
		const body = {tag: 'div', classList: [CLASS_MATH_BODY], content: section.content};
		
		if (section.isText) {
			content.push(body);
		} else {
			content.push({tag: 'math', xmlns, content: 'title' in section ? [...getMathTitle(section.title, i === 0), body] : body});
		}
	}
	
	return {tag: 'p', classList: [CLASS_MATH_WRAPPER], content: [
		{tag: 'div', classList: [CLASS_MATH_CONTAINER], content},
	]};
};

export const getDiagrammedMath = (diagram, ...sections) => {
	return {...getMath(...sections), callback: (element) => {
		let isShowing = false;
		
		move.register(element);
		
		new IntersectionObserver((entries) => {
			if (entries[entries.length - 1].isIntersecting) {
				move.show(diagram, element);
				
				isShowing = true;
			} else if (isShowing) {
				move.hide();
				
				isShowing = false;
			}
		}, {threshold: 0.5}).observe(element);
	}};
};
