import './css';

import {CLASS_WRAPPER, CLASS_WRAPPER_IMAGE, CLASS_IMAGE, CLASS_CROSSHAIR} from './consts';

const template = document.createElement('div');

const paths = {wrapper: []};

const getNode = (path, root = template) => {
	let node = root;
	
	for (const index of path) {
		node = node.children[index];
	}
	
	return node;
};

const generate = (id, parentPath, style) => {
	const element = document.createElement('div');
	
	for (const [property, value] of Object.entries(style)) {
		element.style[property] = value;
	}
	
	const parent = getNode(parentPath);
	
	paths[id] = [...parentPath, parent.children.length];
	
	parent.appendChild(element);
	
	return element;
};

template.classList.add(CLASS_WRAPPER);

template.style.display = 'flex';
template.style.position = 'relative';
template.style.paddingRight = '20px';
template.style.overflow = 'hidden';

generate('viewport', paths.wrapper, {
	backgroundColor: 'black',
	padding: '1px',
	boxSizing: 'border-box',
	position: 'relative',
	overflow: 'hidden',
	display: 'flex',
	flexFlow: 'column wrap',
	placeContent: 'center center',
	cursor: 'grab',
	
	width: 'auto',
	height: '100%',
	aspectRatio: '1',
});

generate('imageWrapper', paths.viewport, {
	height: '100%',
	width: 'auto',
	aspectRatio: '1',
	position: 'relative',
}).classList.add(CLASS_WRAPPER_IMAGE);

(() => {
	const image = generate('image', paths.imageWrapper, {
		padding: '2px',
		boxSizing: 'border-box',
		height: '100%',
		width: '100%',
		display: 'flex',
	});
	
	const childContainer = document.createElement('div');
	
	childContainer.style.flexGrow = '1';
	childContainer.style.position = 'relative';
	childContainer.style.pointerEvents = 'none';
	
	childContainer.append(...[
		{
			backgroundImage: 'radial-gradient(at left top, rgb(0 255 0), transparent), radial-gradient(at right top, rgb(0 0 255), transparent), radial-gradient(at left bottom, rgb(255 0 0), transparent), radial-gradient(at right bottom, rgb(179 255 0 / 50%), transparent)',
			backgroundBlendMode: 'color-dodge',
		},
		{
			backgroundImage: 'radial-gradient(circle, black, black 1.5px, transparent 0)',
			backgroundSize: '18px 18px',
			backgroundRepeat: 'round',
			// backgroundColor: '#0000006f',
		},
		{
			boxShadow: 'white 0 0 6px 1px',
			zIndex: '1',
			position: 'relative',
		},
	].map((styles) => {
		const element = document.createElement('div');
		
		element.style.position = 'absolute';
		element.style.width = element.style.height = '100%';
		
		for (const [property, value] of Object.entries(styles)) {
			element.style[property] = value;
		}
		
		return element;
	}));
	
	image.appendChild(childContainer);
	
	image.classList.add(CLASS_IMAGE);
})();

export const CROSSHAIR = generate('crosshair', paths.viewport, {
	position: 'absolute',
	top: '50%',
	left: '50%',
	translate: '-50% -50%',
	color: 'black',
	textShadow: '0.5px 0.5px 0 white, 0.5px -0.5px 0 white, -0.5px -0.5px 0 white, -0.5px 0.5px 0 white',
	userSelect: 'none',
	pointerEvents: 'none',
	fontSize: '20px',
});

CROSSHAIR.classList.add(CLASS_CROSSHAIR);

generate('resizer', paths.wrapper, {
	cursor: 'col-resize',
	height: '100%',
	width: '20px',
	borderRight: '1px solid white',
	boxSizing: 'border-box',
	position: 'absolute',
	right: '0',
	backgroundColor: 'var(--background)',
});

export default () => Object.entries(paths)
	.reduce(
		(clones, [id, path]) => ({...clones, [id]: getNode(path, clones.wrapper)}),
		{wrapper: template.cloneNode(true)},
	);
