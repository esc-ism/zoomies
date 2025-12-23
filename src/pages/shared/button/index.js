import {CLASS_SEMANTIC_BUTTON} from '@/consts';
import demo from '@/demo';

import {CLASS_CONTAINER as CLASS_CODE_BUTTON_CONTAINER} from '../../code/buttons/consts';

import {CLASS_BUTTON, CLASS_BUTTON_ACTIVE} from './consts';

import './css';

let activeButton;
let isReversing = false;

export const clearButton = () => {
	if (activeButton) {
		activeButton.removeEventListener('blur', releaseButton);
		activeButton.blur();
		
		activeButton.classList.remove(CLASS_BUTTON_ACTIVE);
		activeButton = undefined;
		
		demo.deleteTween();
		demo.progress.complete();
	}
};

for (const action of Object.keys(demo.listeners)) {
	demo.hooks[action].add(clearButton, true, false);
}

const releaseButton = (event) => {
	isReversing = true;
	
	activeButton.classList.remove(CLASS_BUTTON_ACTIVE);
	
	if (event?.relatedTarget) {
		const {relatedTarget} = event;
		
		if (relatedTarget.classList.contains(CLASS_BUTTON)) {
			return;
		}
		
		if (relatedTarget.parentElement.classList.contains(CLASS_CODE_BUTTON_CONTAINER)) {
			clearButton();
			
			return;
		}
	}
	
	if (demo.tween.totalDuration() > 0 && demo.tween.time() > 0) {
		demo.tween
			.timeScale(5)
			.reverse();
	} else {
		demo.tween.revert();
		
		demo.tween.vars.onReverseComplete();
	}
};

export const getButton = (text, tweens, {getParam = () => undefined, isRandom = false, callback} = {}) => {
	let element;
	
	const extras = {};
	
	if (isRandom) {
		extras.style = {textDecoration: 'wavy underline'};
	}
	
	return {
		...extras,
		tag: 'button',
		content: text,
		tabIndex: -1,
		classList: [CLASS_BUTTON, CLASS_SEMANTIC_BUTTON],
		onclick: () => {
			if (activeButton) {
				if (element.isSameNode(activeButton)) {
					if (isReversing) {
						activeButton.classList.add(CLASS_BUTTON_ACTIVE);
						
						demo.tween
							.timeScale(1)
							.play();
						
						isReversing = false;
					} else {
						releaseButton();
					}
					
					return;
				}
				
				activeButton.removeEventListener('blur', releaseButton);
			}
			
			isReversing = false;
			
			element.classList.add(CLASS_BUTTON_ACTIVE);
			activeButton = element;
			
			element.addEventListener('blur', releaseButton);
			
			const param = getParam();
			
			demo.setTween(...tweens.map((tween) => typeof tween === 'function' ? tween(param) : tween));
			
			demo.tweenEnd.then(() => {
				element.removeEventListener('blur', releaseButton);
				
				activeButton = undefined;
			});
		},
		callback: (_element) => {
			callback?.(_element);
			
			element = _element;
		},
	};
};
