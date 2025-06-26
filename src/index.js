import './css';

import pages from './pages';
import {CLASS_WRAPPER as CLASS_TEXT} from './pages/consts';

const params = new URLSearchParams(location.search);

let index = Math.max(0, Math.min(pages.length - 1, Number.parseInt(params.get('page')) || 0));

const root = document.querySelector('#root');

const flipPage = (() => {
	const generate = () => {
		const wrapper = document.createElement('div');
		
		wrapper.style.width = '100%';
		wrapper.style.height = '100%';
		wrapper.style.display = 'flex';
		
		root.appendChild(wrapper);
		
		const page = pages[index](wrapper);
		
		wrapper.querySelector(`.${CLASS_TEXT}`).focus();
		
		return () => {
			page.remove();
			
			wrapper.remove();
		};
	};
	
	let remove = generate();
	
	return () => {
		remove();
		
		remove = generate();
	};
})();

const setIndex = (newIndex) => {
	if (newIndex === index) {
		return;
	}
	
	index = newIndex;
	
	flipPage();
	
	params.set('page', index);
	
	history.replaceState(null, '', `${location.origin}?${params.toString()}`);
};

window.addEventListener('keydown', ({key}) => {
	switch (key) {
		case 'ArrowRight':
			setIndex(Math.min(pages.length - 1, index + 1));
			break;
		case 'ArrowLeft':
			setIndex(Math.max(0, index - 1));
			break;
	}
});
