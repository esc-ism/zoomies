import demo from '@/demo';

import {CLASS_BUTTON, CLASS_BUTTON_ACTIVE, TWEENS_RESET} from '../consts';

let activeButton;

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
	demo.hooks[action].add(clearButton, true);
}

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
