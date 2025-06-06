import './css';

import pages from './pages';

const params = new URLSearchParams(location.search);

let index = Math.max(0, Math.min(pages.length - 1, Number.parseInt(params.get('page')) || 0));

const root = document.querySelector('#root');

const getWrapper = () => {
	const wrapper = document.createElement('div');
	
	wrapper.style.width = '100%';
	wrapper.style.height = '100%';
	wrapper.style.display = 'flex';
	
	root.appendChild(wrapper);
	
	return wrapper;
};

let wrapper = getWrapper();

pages[index](wrapper);

const setIndex = (newIndex) => {
	if (newIndex === index) {
		return;
	}
	
	wrapper.remove();
	
	wrapper = getWrapper();
	
	pages[newIndex](wrapper);
	
	params.set('page', newIndex);
	
	history.replaceState(null, '', `${location.origin}?${params.toString()}`);
	
	index = newIndex;
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
