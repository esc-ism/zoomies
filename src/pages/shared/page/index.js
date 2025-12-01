import {CLASS_BUTTON, PREFIX_ID, INDEXES, IDS} from './consts';

import './css';

export {IDS};

let pages;
let count = 0;

export const setPages = (value) => {
	pages = value;
};

export const getPageButton = (content) => {
	const index = INDEXES[content];
	
	return {
		tag: 'a',
		id: `${PREFIX_ID}${count++}`,
		href: `${location.origin}${location.pathname}?page=${index}`,
		tabIndex: -1,
		classList: [CLASS_BUTTON],
		content,
		onclick(event) {
			event.preventDefault();
			
			const {text} = pages[index];
			
			history.replaceState(window.history.state, '', `${location.origin}${location.pathname}${location.search}#${this.id}`);
			
			text.scrollIntoView();
		},
	};
};
