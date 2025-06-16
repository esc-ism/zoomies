import {CLASS_BUTTON, CLASS_WRAPPER, TWEENS_RESET} from './consts';

let buttonCount = 0;

const getBroken = (lines) => {
	const broken = [];
	
	for (const line of lines) {
		broken.push(line, {tag: 'br'});
	}
	
	return broken;
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

export const getCode = (...content) => ({
	content: ({
		tag: 'code',
		content: getBroken(content),
	}),
});

export const getButton = (text, demo, tweens, {doReset = false, getParam = () => undefined} = {}) => {
	const id = buttonCount++;
	
	const resetTweens = doReset ? TWEENS_RESET : [];
	
	return {
		tag: 'span',
		content: text,
		classList: [CLASS_BUTTON],
		onpointerover: () => {
			if (demo.tween?.data.id === id) {
				demo.tween.play();
				
				return;
			}
			
			const param = getParam();
			
			if (demo.setTween(...resetTweens, ...tweens.map((tween) => typeof tween === 'function' ? tween(param) : tween))) {
				demo.tween.data.id = id;
			}
		},
		onpointerout: () => {
			if (!demo.tween) {
				return;
			}
			
			if (demo.tween.totalDuration() > 0) {
				demo.tween.reverse();
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
