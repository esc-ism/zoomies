import demo from './demo';
import pages from './pages';
import {IDS} from './pages/shared/page';
import {CLASS_WRAPPER, inputListener} from './consts';
import touchIcon from './input/touch';
import mouseIcon from './input/mouse';
import {CLASS_ACTIVE} from './pages/consts';
import {ALLOWANCE_ERROR} from './shared';
import {addRule} from './shared/css';

import './css';

const {host, pathname} = location;
const params = new URLSearchParams(location.search);

const wrapper = document.createElement('div');

wrapper.classList.add(CLASS_WRAPPER);

const header = (() => {
	const container = document.createElement('div');
	
	container.style.height = '3em';
	container.style.minWidth = '100%';
	container.style.display = 'flex';
	container.style.alignItems = 'center';
	container.style.borderBottom = '1px solid currentcolor';
	container.style.boxSizing = 'border-box';
	container.style.position = 'sticky';
	container.style.left = '0';
	container.style.marginTop = '-3em';
	// avoid affecting page positions
	container.style.marginLeft = '-100%';
	
	const email = document.createElement('a');
	
	email.innerText = 'callumtylerlatham@gmail.com';
	email.href = 'mailto:callumtylerlatham@gmail.com';
	
	email.style.opacity = '0.8';
	email.style.flexGrow = '1';
	email.style.textAlign = 'center';
	email.style.padding = '0 0.5em';
	email.style.overflow = 'hidden';
	email.style.textOverflow = 'ellipsis';
	
	const version = document.createElement('div');
	
	version.innerText = 'v0.2';
	
	version.style.opacity = '0.8';
	version.style.position = 'absolute';
	version.style.top = version.style.right = '4px';
	version.style.fontSize = '0.6em';
	
	const buttonContainer = document.createElement('div');
	
	buttonContainer.style.height = '100%';
	buttonContainer.style.display = 'flex';
	
	const update = () => {
		const [on, off] = inputListener.isMouse ? [mouseIcon, touchIcon] : [touchIcon, mouseIcon];
		
		on.disabled = true;
		on.style.removeProperty('cursor');
		
		off.disabled = false;
		off.style.cursor = 'pointer';
	};
	
	inputListener.add(update);
	
	mouseIcon.addEventListener('click', () => {
		inputListener.set(true);
	});
	
	touchIcon.addEventListener('click', () => {
		inputListener.set(false);
	});
	
	buttonContainer.append(touchIcon, mouseIcon);
	container.append(buttonContainer, email, version);
	
	return container;
})();

const textContainer = document.createElement('div');

textContainer.style.display = 'flex';
textContainer.style.scrollSnapType = 'x mandatory';
textContainer.style.overflow = 'auto';
textContainer.style.paddingTop = '3em';
textContainer.style.position = 'relative';
textContainer.style.flexGrow = '1';
textContainer.style.boxSizing = 'border-box';
// prevents :focus-visible outline
textContainer.style.outline = 'none';
textContainer.tabIndex = 0;

// Without this, snap scroll breaks after scrolling down 🤷‍♂️
(() => {
	const span = document.createElement('span');
	
	textContainer.addEventListener('onscrollend' in textContainer ? 'scrollend' : 'scroll', () => {
		textContainer.appendChild(span);
	});
})();

textContainer.append(header);
wrapper.append(demo.element, textContainer);
document.body.appendChild(wrapper);

textContainer.focus();

// `|| 0` to replace NaN
let currentIndex = Number.parseInt(params.get('page')) || 0;

if (currentIndex < 0) {
	currentIndex = 0;
} else if (currentIndex > pages.length - 1) {
	currentIndex = pages.length - 1;
}

params.set('page', currentIndex);

history.replaceState({index: currentIndex}, '', `${location.origin}${location.pathname}?${params.toString()}${location.hash}`);

let currentPage = pages[currentIndex];

const setTitle = () => {
	document.title = `${IDS[currentIndex]} | Zoomies`;
};

setTitle();

const setTabIndexes = (value = 0, {text} = currentPage) => {
	for (const button of text.querySelectorAll('[tabindex]')) {
		button.tabIndex = value;
	}
};

currentPage.text.classList.add(CLASS_ACTIVE);
demo.setSystem(currentPage).then(async () => {
	for (const page of pages) {
		textContainer.appendChild(page.text);
	}
	
	currentPage.text.scrollIntoView();
	
	currentPage.start?.();
	
	setTabIndexes();
	
	if (location.hash) {
		document.querySelector(location.hash)?.focus();
	}
	
	const setPage = (index, page, pushState = true) => {
		const {scrollTop} = textContainer;
		
		setTabIndexes(-1);
		
		currentPage.text.classList.remove(CLASS_ACTIVE);
		currentPage.end?.();
		demo.remove();
		
		currentIndex = index;
		currentPage = page;
		
		setTitle();
		
		currentPage.text.classList.add(CLASS_ACTIVE);
		textContainer.scrollTop = Math.min(scrollTop, header.offsetHeight);
		
		setTabIndexes();
		
		// kill focus on any links
		textContainer.focus();
		
		if (pushState) {
			params.set('page', index);
			
			// record page navigation in history
			history.pushState({index}, '', `${location.origin}${location.pathname}?${params.toString()}`);
		}
		
		return demo.setSystem(page).then(() => {
			page.start?.();
		});
	};
	
	(() => {
		const styleNode = document.createElement('style');
		
		document.head.appendChild(styleNode);
		
		addRule(':root', {'--scrollbar-width': '0'}, styleNode);
		
		// detects zoom changes - they change scrollbar px size
		new ResizeObserver(() => {
			styleNode.sheet.deleteRule(0);
			
			addRule(':root', {'--scrollbar-width': `${textContainer.getBoundingClientRect().width - currentPage.text.getBoundingClientRect().width}px`}, styleNode);
		}).observe(demo.elements.crosshair);
	})();
	
	(() => {
		const styleNode = document.createElement('style');
		
		document.head.appendChild(styleNode);
		
		addRule(':root', {'--text-height': '0'}, styleNode);
		
		new ResizeObserver(() => {
			styleNode.sheet.deleteRule(0);
			
			addRule(':root', {'--text-height': `${textContainer.getBoundingClientRect().height}px`}, styleNode);
		}).observe(textContainer);
	})();
	
	demo.pageMinWidth = textContainer.offsetWidth - currentPage.text.clientWidth + 2;
	demo.pageMinHeight = header.offsetHeight;
	
	textContainer.style.minWidth = `${demo.pageMinWidth}px`;
	textContainer.style.minHeight = `${demo.pageMinHeight}px`;
	
	// handle history navigation without reloading the site
	window.addEventListener('popstate', (event) => {
		if (!event.state || location.host !== host || location.pathname !== pathname) {
			return;
		}
		
		const load = setPage(event.state.index, pages[event.state.index], false);
		
		pages[event.state.index].text.scrollIntoView();
		
		if (location.hash) {
			// wait for `setSystem` to call page `start` callback to generate code
			load.then(() => {
				const target = document.querySelector(location.hash);
				
				target.blur();
				target.focus({focusVisible: true});
			});
		}
		
		event.preventDefault();
	});
	
	// improves handling of held down horizontal arrow keys
	// also prevents pausing when the keys are hit mid-scroll
	(() => {
		let isInterim = false;
		
		if ('onscrollsnapchanging' in textContainer && 'onscrollsnapchange' in textContainer) {
			textContainer.addEventListener('scrollsnapchanging', () => {
				isInterim = true;
			});
			
			textContainer.addEventListener('scrollsnapchange', () => {
				window.setTimeout(() => {
					isInterim = false;
				}, 100);
			});
		} else {
			let timeout;
			
			textContainer.addEventListener('scroll', () => {
				isInterim = true;
				
				window.clearTimeout(timeout);
				
				timeout = window.setTimeout(() => {
					isInterim = false;
					
					timeout = undefined;
				}, 200);
			});
		}
		
		window.addEventListener('keydown', (event) => {
			if (!isInterim || event.ctrlKey || event.altKey || event.shiftKey) {
				return;
			}
			
			switch (event.key) {
				case 'ArrowLeft':
				case 'ArrowRight':
					event.preventDefault();
			}
		});
	})();
	
	// set page as active when it's scrolled to
	if ('onscrollsnapchange' in textContainer) {
		// keep from triggering on page load
		await new Promise((resolve) => {
			textContainer.addEventListener('scroll', resolve, {once: true});
		});
		
		const indices = new Map();
		
		for (const [i, page] of pages.entries()) {
			indices.set(page.text, i);
		}
		
		textContainer.addEventListener('scrollsnapchange', ({snapTargetInline: target}) => {
			// prevents a second setPage call in popstate handler
			if (currentPage.text.isSameNode(target)) {
				return;
			}
			
			const index = indices.get(target);
			
			setPage(index, pages[index]);
		});
	} else {
		let scrollLeft;
		let width;
		
		new ResizeObserver(() => {
			scrollLeft = textContainer.scrollLeft;
			width = header.getBoundingClientRect().width;
		}).observe(header);
		
		textContainer.addEventListener('onscrollend' in textContainer ? 'scrollend' : 'scroll', () => {
			if (textContainer.scrollLeft === scrollLeft) {
				return;
			}
			
			scrollLeft = textContainer.scrollLeft;
			
			const progress = scrollLeft / width;
			const index = Math.round(progress);
			
			if (Math.abs(progress - index) > ALLOWANCE_ERROR) {
				return;
			}
			
			// prevents a second setPage call in popstate handler
			if (!pages[index].text.isSameNode(currentPage.text)) {
				setPage(index, pages[index]);
			}
		});
	}
});
