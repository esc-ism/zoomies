import demo from '@/demo';

let target;

const cancelEvent = (event) => {
	event.preventDefault();
	event.stopPropagation();
};

const container = (() => {
	const container = document.createElement('div');
	
	container.style.display = 'flex';
	container.style.width = container.style.height = '100%';
	container.style.justifyContent = 'center';
	container.style.alignItems = 'center';
	container.style.pointerEvents = 'all';
	container.style.cursor = 'pointer';
	
	container.addEventListener('wheel', cancelEvent);
	container.addEventListener('pointerdown', cancelEvent);
	
	return container;
})();

container.addEventListener('click', (event) => {
	event.stopImmediatePropagation();
	
	target.scrollIntoView({behavior: 'smooth', block: 'center'});
});

export const register = async (element) => {
	await new Promise((resolve) => {
		window.setTimeout(resolve, 0);
	});
	
	element.previousElementSibling.style.marginBottom = '0';
	const borderWidth = 0.4;
	
	for (let i = 0; i < 3; ++i) {
		const mult = -0.5 + i;
		const notch = document.createElement('div');
		
		notch.style.position = 'relative';
		notch.style.top = `calc(var(--text-height) * ${mult} - ${borderWidth}em - var(--scrollbar-width) * ${mult} + 2px)`;
		notch.style.left = '-1em';
		notch.style.marginBottom = `calc(${borderWidth * -2}em + 1px)`;
		notch.style.width = notch.style.height = '0';
		notch.style.borderColor = 'transparent';
		notch.style.borderStyle = 'solid';
		notch.style.borderWidth = `${borderWidth}em`;
		notch.style.borderLeftColor = 'white';
		
		element.insertAdjacentElement('beforebegin', notch);
	}
};

export const show = (svg, _target) => {
	target = _target;
	
	demo.elements.viewport.style.pointerEvents = 'none';
	demo.readout.element.style.display = 'none';
	demo.elements.crosshair.style.display = 'none';
	demo.elements.imageWrapper.style.display = 'none';
	
	container.appendChild(svg);
	demo.elements.viewport.appendChild(container);
};

export const hide = () => {
	demo.elements.viewport.style.removeProperty('pointer-events');
	demo.elements.crosshair.style.removeProperty('display');
	demo.elements.imageWrapper.style.removeProperty('display');
	demo.readout.element.style.removeProperty('display');
	
	demo.updateSizesViewport();
	
	container.firstChild.remove();
	container.remove();
};
