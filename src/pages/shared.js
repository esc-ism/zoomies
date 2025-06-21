import {CLASS_BUTTON, CLASS_CODE, CLASS_WRAPPER, TWEENS_RESET} from './consts';

const getBroken = (lines) => {
	const broken = [];
	
	for (const [i, line] of lines.entries()) {
		const children = [];
		
		if (i !== 0) {
			children.push({tag: 'br'});
		}
		
		if (Array.isArray(line)) {
			children.push(...line);
		} else {
			children.push(line);
		}
		
		broken.push(...children);
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

export const getCode = (...args) => {
	if (typeof args[0] !== 'object' || Array.isArray(args[0])) {
		return {
			content: {
				tag: 'code',
				content: getBroken(args),
			},
			classList: [CLASS_CODE],
		};
	}
	
	const [{header, ...vars}, ...text] = args;
	
	const content = [{
		tag: 'code',
		content: getBroken(text),
		...vars,
	}];
	
	if (header) {
		content.unshift({
			tag: 'div',
			content: header,
		});
	}
	
	return {
		content,
		classList: [CLASS_CODE],
	};
};

export const getButton = (text, demo, tweens, {doReset = false, getParam = () => undefined} = {}) => {
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
