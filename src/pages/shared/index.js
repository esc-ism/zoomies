import demo from '@/demo';

import generateCode from '../code';

import {
	CLASS_BUTTON, CLASS_CODE, CLASS_WRAPPER, TWEENS_RESET,
	CLASS_INSTRUCTION, CLASS_FLASH_CONTAINER, CLASS_BUTTON_ACTIVE,
} from '../consts';
import {InputMethod} from '@/consts';

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
		
		demo.tween.vars.onUpdate();
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
	
	container.style.padding = '0 20px';
	container.style.boxSizing = 'border-box';
	
	wrapper.classList.add(CLASS_WRAPPER);
	
	container.append(getPIncluder(), ...children.map(getNode), getPIncluder());
	wrapper.append(container);
	
	return wrapper;
};

export const getInstruction = (...content) => ({classList: [CLASS_INSTRUCTION], content});

export const flash = (target) => {
	// todo remove
	if (!target.classList.contains(CLASS_FLASH_CONTAINER)) {
		console.error('ohno');
		debugger;
	}
	
	const flash = document.createElement('span');
	
	flash.style.position = 'absolute';
	flash.style.height = '100%';
	flash.style.width = '100%';
	flash.style.backgroundColor = '#777';
	flash.style.top = '0';
	flash.style.left = '0';
	flash.style.opacity = '1';
	flash.style.transition = 'opacity 0.5s ease-out';
	
	target.appendChild(flash);
	
	window.setTimeout(() => {
		flash.style.opacity = '0';
	}, 0);
	
	flash.addEventListener('transitionend', () => flash.remove(), {once: true});
};

export const getInputDependent = (get) => ({tag: 'span', callback: (element) => {
	const update = () => {
		element.innerText = get(InputMethod.isMouse);
	};
	
	update();
	
	InputMethod.addListener(update);
}});
