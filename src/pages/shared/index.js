import {getIdGetter} from '@/shared/css';

import {generateWhenReady as generateCode} from '../code';
import touchIcon from '../input/touch';
import mouseIcon from '../input/mouse';

import {
	CLASS_BUTTON, CLASS_CODE, CLASS_WRAPPER, TWEENS_RESET,
	CLASS_INSTRUCTION, CLASS_FLASH_CONTAINER,
} from '../consts';
import {InputMethod} from '@/consts';

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

export const getCode = (statements) => {
	const id = getCodeId(count++);
	
	return {
		content: {
			tag: 'div',
			content: {
				tag: 'code',
				content: '',
				id,
				callback: (node) => {
					generateCode(node, statements);
				},
			},
		},
		classList: [CLASS_CODE, CLASS_FLASH_CONTAINER],
	};
};

export const getButton = (text, tweens, {doReset = false, getParam = () => undefined} = {}) => {
	const resetTweens = doReset ? TWEENS_RESET : [];
	
	return {
		tag: 'span',
		content: text,
		classList: [CLASS_BUTTON],
		onpointerover: () => demo.init().then(async () => {
			const param = await getParam();
			
			demo.setTween(...resetTweens, ...tweens.map((tween) => typeof tween === 'function' ? tween(param) : tween));
		}),
		onpointerout: () => demo.init().then(() => {
			if (!demo.tween || demo.isRemoved) {
				return;
			}
			
			if (demo.tween.totalDuration() > 0 && demo.tween.time() > 0) {
				demo.tween
					.timeScale(3)
					.reverse();
			} else {
				demo.tween.revert();
				
				demo.tween.vars.onUpdate();
				demo.tween.vars.onReverseComplete();
			}
		}),
		onclick: () => demo.init().then(() => {
			if (!demo.tween) {
				return;
			}
			
			demo.constructor.progress.complete();
			
			demo.tween.progress(1);
			
			demo.deleteTween();
			
			// hacky solution to run after final tween update
			demo.tweenUpdate.then(() => {
				demo.constructor.target.hide();
			});
		}),
	};
};

const getFooter = () => {
	const container = document.createElement('div');
	
	container.style.width = '100%';
	container.style.height = '3em';
	container.style.display = 'flex';
	container.style.boxSizing = 'border-box';
	container.style.position = 'relative';
	container.style.alignItems = 'center';
	container.style.borderBottom = '1px solid currentcolor';
	
	const email = document.createElement('a');
	
	email.innerText = 'callumtylerlatham@gmail.com';
	email.href = 'mailto:callumtylerlatham@gmail.com';
	
	email.style.opacity = '0.8';
	email.style.flexGrow = '1';
	email.style.textAlign = 'center';
	email.style.padding = '0 0.5em';
	email.style.overflow = 'hidden';
	email.style.textOverflow = 'ellipsis';
	
	const buttonContainer = document.createElement('div');
	
	buttonContainer.style.height = '100%';
	buttonContainer.style.display = 'flex';
	
	const update = () => {
		const [on, off] = InputMethod.isMouse ? [mouseIcon, touchIcon] : [touchIcon, mouseIcon];
		
		on.disabled = true;
		on.style.removeProperty('cursor');
		
		off.disabled = false;
		off.style.cursor = 'pointer';
	};
	
	InputMethod.addListener(update);
	
	update();
	
	mouseIcon.addEventListener('click', () => {
		InputMethod.isMouse = true;
	});
	
	touchIcon.addEventListener('click', () => {
		InputMethod.isMouse = false;
	});
	
	buttonContainer.append(touchIcon, mouseIcon);
	container.append(buttonContainer, email);
	
	return container;
};

const getPIncluder = (() => {
	const element = document.createElement('span');
	
	element.style.display = 'flex';
	
	return () => element.cloneNode();
})();

export const getText = (...children) => {
	const wrapper = document.createElement('div');
	const container = document.createElement('div');
	
	wrapper.style.overflow = 'auto';
	wrapper.style.scrollbarColor = 'var(--color) transparent';
	wrapper.style.flexGrow = '1';
	wrapper.style.lineHeight = '1.2';
	// I guess chrome gives outlines to scroll elements
	wrapper.style.outline = 'none';
	
	container.style.padding = '0 20px';
	container.style.boxSizing = 'border-box';
	container.style.minHeight = '100%';
	
	wrapper.classList.add(CLASS_WRAPPER);
	
	container.append(getPIncluder(), ...children.map(getNode), getPIncluder());
	wrapper.append(container);
	
	window.setTimeout(() => {
		const footer = getFooter();
		
		wrapper.insertAdjacentElement('afterbegin', footer);
		
		wrapper.scrollTop = footer.offsetHeight;
	}, 0);
	
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
