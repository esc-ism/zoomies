import demo from '@/demo';

let target;

const cancelEvent = (event) => {
	event.preventDefault();
	event.stopPropagation();
};

const diagramContainer = document.createElement('div');

diagramContainer.style.position = 'absolute';
diagramContainer.style.zIndex = '10';
diagramContainer.style.display = 'flex';
diagramContainer.style.width = diagramContainer.style.height = '100%';
diagramContainer.style.justifyContent = 'center';
diagramContainer.style.alignItems = 'center';
diagramContainer.style.pointerEvents = 'all';
diagramContainer.style.cursor = 'pointer';
diagramContainer.style.backgroundColor = 'black';
diagramContainer.style.backgroundColor = 'black';

diagramContainer.addEventListener('wheel', cancelEvent);
diagramContainer.addEventListener('pointerdown', cancelEvent);

diagramContainer.addEventListener('click', (event) => {
	event.stopImmediatePropagation();
	
	target.scrollIntoView({behavior: 'smooth', block: 'center'});
});

const notchContainer = document.createElement('p');

notchContainer.style.position = 'relative';
notchContainer.style.top = 'calc(var(--text-height) * -0.5 + var(--scrollbar-width) * 0.5 - 1em + 1px)';
notchContainer.style.height = 'calc((var(--text-height) - var(--scrollbar-width)) * 2 - 2px)';
notchContainer.style.marginBottom = 'calc((var(--text-height) - var(--scrollbar-width)) * -2 + 2px)';
notchContainer.style.left = '-1em';
notchContainer.style.width = '0';

notchContainer.append(
	document.createElement('div'),
	document.createElement('div'),
	document.createElement('div'),
);

for (const notch of notchContainer.children) {
	notch.style.position = 'absolute';
	notch.style.width = notch.style.height = '0';
	notch.style.borderColor = 'transparent';
	notch.style.borderStyle = 'solid';
	notch.style.borderWidth = '0.5em';
	notch.style.borderLeftColor = 'white';
}

notchContainer.children[0].style.borderTop = notchContainer.children[2].style.borderBottom = 'none';
notchContainer.children[0].style.top = notchContainer.children[2].style.bottom = '0';
notchContainer.children[1].style.top = '50%';
notchContainer.children[1].style.transform = 'translateY(-50%)';

export const register = async (element) => {
	await new Promise((resolve) => {
		window.setTimeout(resolve, 0);
	});
	
	element.style.marginTop = '0';
	element.insertAdjacentElement('beforebegin', notchContainer.cloneNode(true));
};

export const show = (svg, _target) => {
	target = _target;
	
	demo.elements.viewport.style.pointerEvents = 'none';
	
	diagramContainer.appendChild(svg);
	demo.elements.viewport.insertAdjacentElement('afterbegin', diagramContainer);
};

export const hide = () => {
	demo.elements.viewport.style.removeProperty('pointer-events');
	
	diagramContainer.firstChild.remove();
	diagramContainer.remove();
};
