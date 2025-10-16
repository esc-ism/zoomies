import '../css';

import {ID_WRAPPER, ID_WRAPPER_IMAGE, ID_IMAGE, ID_CROSSHAIR, ID_RESIZER_HORIZONTAL, ID_RESIZER_VERTICAL} from '../consts';
import {CLASS_HIDE_HORIZONTAL, CLASS_HIDE_VERTICAL} from '@/shared/orientation';
import crosshairImage from './crosshair';

const wrapper = document.createElement('div');

const paths = {wrapper: []};

const getNode = (path, root = wrapper) => {
	let node = root;
	
	for (const index of path) {
		node = node.children[index];
	}
	
	return node;
};

const generate = (id, parentPath, style, element) => {
	if (!element) {
		element = document.createElement('div');
		
		for (const [property, value] of Object.entries(style)) {
			element.style[property] = value;
		}
	}
	
	const parent = getNode(parentPath);
	
	paths[id] = [...parentPath, parent.children.length];
	
	parent.appendChild(element);
	
	return element;
};

wrapper.id = ID_WRAPPER;

wrapper.style.display = 'flex';
wrapper.style.position = 'relative';
wrapper.style.overflow = 'hidden';

generate('viewport', paths.wrapper, {
	backgroundColor: 'black',
	padding: '1px',
	boxSizing: 'border-box',
	position: 'relative',
	overflow: 'hidden',
	display: 'flex',
	flexWrap: 'wrap',
	placeContent: 'center center',
	cursor: 'grab',
	aspectRatio: '1',
	touchAction: 'none',
});

generate('imageWrapper', paths.viewport, {
	aspectRatio: '1',
	position: 'relative',
}).id = ID_WRAPPER_IMAGE;

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
			backgroundImage: 'radial-gradient(at -100% center, rgb(0 200 160), transparent), radial-gradient(at center 300%, rgb(255 0 0), transparent), radial-gradient(at 130% center, rgb(160 200 0), transparent), radial-gradient(at center -200%, rgb(0 0 255), transparent)',
			backgroundBlendMode: 'overlay',
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
	
	image.id = ID_IMAGE;
})();

export const CONTAINER_BOUND_LIMIT = generate('boundLimit', paths.imageWrapper, {display: 'contents', pointerEvents: 'none'});
export const CONTAINER_RAIL = generate('rail', paths.imageWrapper, {display: 'contents', pointerEvents: 'none'});
export const CONTAINER_BOUND_LINE = generate('boundLine', paths.imageWrapper, {display: 'contents', pointerEvents: 'none'});
export const CONTAINER_TANGENTS = generate('tangents', paths.imageWrapper, {display: 'contents', pointerEvents: 'none'});

export const CROSSHAIR = generate('crosshair', paths.viewport, {}, crosshairImage);

CROSSHAIR.id = ID_CROSSHAIR;

const RESIZER_HORIZONTAL = generate('resizerHorizontal', paths.wrapper, {
	right: 0,
	height: '100%',
	width: '20px',
	'border-right': '1px solid white',
	cursor: 'col-resize',
});

RESIZER_HORIZONTAL.id = ID_RESIZER_HORIZONTAL;
RESIZER_HORIZONTAL.classList.add(CLASS_HIDE_VERTICAL);

const RESIZER_VERTICAL = generate('resizerVertical', paths.wrapper, {
	bottom: 0,
	width: '100%',
	height: '20px',
	'border-bottom': '1px solid white',
	cursor: 'row-resize',
});

RESIZER_VERTICAL.id = ID_RESIZER_VERTICAL;
RESIZER_VERTICAL.classList.add(CLASS_HIDE_HORIZONTAL);

export default () => Object.entries(paths)
	.reduce(
		(elements, [id, path]) => ({...elements, [id]: getNode(path, wrapper)}),
		{wrapper},
	);
