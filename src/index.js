import './css';

import demo from './demo';
import pages from './pages';
import {CLASS_WRAPPER, InputMethod} from './consts';
import touchIcon from './input/touch';
import mouseIcon from './input/mouse';
import {CLASS_ACTIVE} from './pages/consts';

const params = new URLSearchParams(location.search);

const root = document.querySelector('#root');

const wrapper = document.createElement('div');

wrapper.classList.add(CLASS_WRAPPER);

const header = (() => {
	const container = document.createElement('div');
	
	container.style.minHeight = '3em';
	container.style.display = 'flex';
	container.style.alignItems = 'center';
	container.style.borderBottom = '1px solid currentcolor';
	
	// todo weird colour. are all your links this colour now? why?
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
	
	const update = () => {
		const [on, off] = InputMethod.isMouse ? [mouseIcon, touchIcon] : [touchIcon, mouseIcon];
		
		on.disabled = true;
		on.style.removeProperty('cursor');
		
		off.disabled = false;
		off.style.cursor = 'pointer';
	};
	
	InputMethod.addListener(update);
	
	update();
	
	mouseIcon.addEventListener('click', () => {
		InputMethod.isMouse = true;
	});
	
	touchIcon.addEventListener('click', () => {
		InputMethod.isMouse = false;
	});
	
	buttonContainer.append(touchIcon, mouseIcon);
	container.append(buttonContainer, email);
	
	return container;
})();

const textWrapper = document.createElement('div');

textWrapper.style.display = 'flex';
textWrapper.style.overflowY = 'auto';
textWrapper.style.overflowX = 'hidden';
textWrapper.style.scrollbarWidth = 'none';
textWrapper.style.flexGrow = '1';
textWrapper.style.flexDirection = 'column';
textWrapper.style.height = '100vh';

window.setTimeout(() => {
	textWrapper.scrollTop = header.offsetHeight;
	
	let isListening = false;
	
	textWrapper.addEventListener('scroll', () => {
		if (textWrapper.scrollTop < header.offsetHeight - 1) {
			if (!isListening) {
				for (const page of pages) {
					page.text.style.setProperty('overflow-y', 'clip');
				}
				
				isListening = true;
			}
			
			return;
		}
		
		if (isListening) {
			for (const page of pages) {
				page.text.style.removeProperty('overflow-y');
			}
			
			isListening = false;
		}
	});
}, 0);

const textContainer = document.createElement('div');

textContainer.style.display = 'flex';
textContainer.style.minHeight = '100vh';
textContainer.style.scrollSnapType = 'x mandatory';
textContainer.style.scrollSnapStop = 'always';
textContainer.style.overflowX = 'auto';

textWrapper.append(header, textContainer);
wrapper.append(demo.element, textWrapper);
root.appendChild(wrapper);

let currentPage = pages[Math.max(0, Math.min(pages.length - 1, Number.parseInt(params.get('page')) || 0))];

demo.setSystem(new currentPage.System());
currentPage.text.classList.add(CLASS_ACTIVE);

demo.init().then(() => {
	currentPage.start?.();
	
	const setPage = (index, page, pushState = true) => {
		currentPage.text.classList.remove(CLASS_ACTIVE);
		currentPage.end?.();
		demo.system.remove();
		demo.remove();
		
		currentPage = page;
		
		currentPage.text.classList.add(CLASS_ACTIVE);
		demo.setSystem(new page.System());
		page.start?.();
		
		if (pushState) {
			params.set('page', index);
			
			history.pushState({index}, '', `${location.origin}${location.pathname}?${params.toString()}`);
		}
	};
	
	for (const [i, page] of pages.entries()) {
		textContainer.appendChild(page.text);
		
		let isFirst = true;
		
		const observer = new IntersectionObserver((entries) => {
			if (isFirst) {
				isFirst = false;
				
				if (entries.length < 2) {
					return;
				}
			}
			
			if (entries[entries.length - 1].intersectionRatio >= 0.5) {
				setPage(i, page);
			}
		}, {root: textContainer, threshold: 0.5});
		
		observer.observe(page.text);
	}
	
	currentPage.text.focus();
	
	window.addEventListener('popstate', (event) => {
		if (typeof event.state?.index !== 'number') {
			return;
		}
		
		setPage(event.state.index, pages[event.state.index], false);
		
		event.preventDefault();
	});
});
