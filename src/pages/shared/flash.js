import {CLASS_FLASH_CONTAINER} from '../consts';

const element = document.createElement('span');

element.style.position = 'absolute';
element.style.height = '100%';
element.style.width = '100%';
element.style.backgroundColor = '#777';
element.style.top = '0';
element.style.left = '0';

export default (target) => {
	// todo remove
	if (!target.classList.contains(CLASS_FLASH_CONTAINER)) {
		console.error('ohno');
		debugger;
	}
	
	target.appendChild(element);
	
	element
		.animate([{opacity: 1, easing: 'ease-in'}, {opacity: 0}], 500)
		.finished.then(() => element.remove());
};
