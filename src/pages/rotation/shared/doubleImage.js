import {getLine} from '../../shared/svg';

export const getMirroredLine = (...points) => [getLine(...points), getLine(...points.map(([x, y]) => [-x, -y]))];

export const getDoubleImage = (duo, trio) => ({tag: 'div', style: {
	display: 'flex',
	maxHeight: 'calc(var(--text-height) - 2em - var(--scrollbar-width))',
	// avoids a weird scroll snap when resizing viewport with page top inside the images
	overflowAnchor: 'none',
}, content: [duo, trio].map((image) => {
	const container = document.createElement('div');
	
	container.style.display = 'flex';
	container.style.justifyContent = 'center';
	container.style.flexGrow = `${image.viewBox.baseVal.width / image.viewBox.baseVal.height}`;
	
	container.appendChild(image);
	
	return container;
})});
