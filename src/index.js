import './css';

import demo from './demo';
import pages from './pages';
import {CLASS_WRAPPER, inputListener} from './consts';
import touchIcon from './input/touch';
import mouseIcon from './input/mouse';
import {CLASS_ACTIVE} from './pages/consts';
import {ALLOWANCE_ERROR} from './shared';

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
	
	const buttonContainer = document.createElement('div');
	
	buttonContainer.style.height = '100%';
	buttonContainer.style.display = 'flex';
	
	const update = (isMouse) => {
		const [on, off] = isMouse ? [mouseIcon, touchIcon] : [touchIcon, mouseIcon];
		
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
	container.append(buttonContainer, email);
	
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

let currentIndex = Math.max(0, Math.min(pages.length - 1, Number.parseInt(params.get('page')) || 0));
let currentPage = pages[currentIndex];

demo.setSystem(currentPage);
currentPage.text.classList.add(CLASS_ACTIVE);

demo.init().then(async () => {
	currentPage.start?.();
	
	const setPage = (index, page, pushState = true) => {
		const {scrollTop} = textContainer;
		
		currentPage.text.classList.remove(CLASS_ACTIVE);
		currentPage.end?.();
		demo.system.remove();
		demo.remove();
		
		currentIndex = index;
		currentPage = page;
		
		currentPage.text.classList.add(CLASS_ACTIVE);
		demo.setSystem(page);
		page.start?.();
		
		textContainer.scrollTop = Math.min(scrollTop, header.offsetHeight);
		
		if (pushState) {
			params.set('page', index);
			
			// record page navigation in the history
			history.pushState({index}, '', `${location.origin}${location.pathname}?${params.toString()}`);
		}
	};
	
	for (const page of pages) {
		textContainer.appendChild(page.text);
	}
	
	currentPage.text.scrollIntoView();
	
	demo.pageMinWidth = textContainer.offsetWidth - currentPage.text.clientWidth + 2;
	demo.pageMinHeight = header.offsetHeight;
	
	textContainer.style.minWidth = `${demo.pageMinWidth}px`;
	textContainer.style.minHeight = `${demo.pageMinHeight}px`;
	
	// handle history navigation without reloading the site
	window.addEventListener('popstate', (event) => {
		if (typeof event.state?.index !== 'number') {
			return;
		}
		
		setPage(event.state.index, pages[event.state.index], false);
		
		pages[event.state.index].text.scrollIntoView();
		
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
			width = textContainer.getBoundingClientRect().width;
		}).observe(textContainer);
		
		textContainer.addEventListener('scroll', () => {
			if (textContainer.scrollLeft === scrollLeft) {
				return;
			}
			
			scrollLeft = textContainer.scrollLeft;
			
			const progress = scrollLeft / width;
			const index = Math.round(progress);
			
			if (Math.abs(progress - index) > ALLOWANCE_ERROR) {
				return;
			}
			
			if (!pages[index].text.isSameNode(currentPage.text)) {
				setPage(index, pages[index]);
			}
		});
	}
});
