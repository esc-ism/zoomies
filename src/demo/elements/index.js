import {CLASS_HIDE_HORIZONTAL, CLASS_HIDE_VERTICAL} from '@/shared/orientation';

import {
	ID_WRAPPER, ID_WRAPPER_IMAGE, ID_IMAGE, ID_CROSSHAIR,
	ID_RESIZER_HORIZONTAL, ID_RESIZER_VERTICAL, PADDING_VIEWPORT,
} from '../consts';

import crosshairImage from './crosshair';

import '../css';

const generate = ({parent, style, id, classList}) => {
	const element = document.createElement('div');
	
	for (const [property, value] of Object.entries(style)) {
		element.style[property] = value;
	}
	
	if (id) {
		element.id = id;
	}
	
	if (classList) {
		element.classList.add(...classList);
	}
	
	if (parent) {
		parent.appendChild(element);
	}
	
	return element;
};

const elements = {
	wrapper: generate({
		id: ID_WRAPPER,
		style: {
			display: 'flex',
			position: 'relative',
		},
	}),
};

elements.viewport = generate({
	parent: elements.wrapper,
	style: {
		backgroundColor: 'black',
		position: 'relative',
		overflow: 'hidden',
		cursor: 'grab',
		aspectRatio: '1',
		touchAction: 'none',
	},
});

elements.imageWrapper = generate({
	parent: elements.viewport,
	style: {
		padding: `${PADDING_VIEWPORT}px`,
		boxSizing: 'border-box',
		height: '100%',
		width: '100%',
		display: 'flex',
		flexWrap: 'wrap',
		placeContent: 'center center',
	},
});

elements.imageContainer = generate({
	id: ID_WRAPPER_IMAGE,
	parent: elements.imageWrapper,
	style: {
		aspectRatio: '1',
		position: 'relative',
	},
});

elements.image = generate({
	parent: elements.imageContainer,
	id: ID_IMAGE,
	style: {
		height: '100%',
		width: '100%',
		display: 'flex',
	},
});

elements.crosshair = elements.viewport.appendChild(crosshairImage);
elements.crosshair.id = ID_CROSSHAIR;

elements.resizerHorizontal = generate({
	parent: elements.wrapper,
	id: ID_RESIZER_HORIZONTAL,
	classList: [CLASS_HIDE_VERTICAL],
	style: {
		right: 0,
		height: '100%',
		width: '1lh',
		'border-right': '1px solid currentcolor',
		'border-left': '1px solid currentcolor',
		cursor: 'col-resize',
	},
});

elements.resizerVertical = generate({
	parent: elements.wrapper,
	id: ID_RESIZER_VERTICAL,
	classList: [CLASS_HIDE_HORIZONTAL],
	style: {
		bottom: 0,
		width: '100%',
		height: '1lh',
		'border-top': '1px solid currentcolor',
		'border-bottom': '1px solid currentcolor',
		cursor: 'row-resize',
	},
});

(() => {
	const childContainer = document.createElement('div');
	
	childContainer.style.flexGrow = '1';
	childContainer.style.position = 'relative';
	childContainer.style.pointerEvents = 'none';
	
	childContainer.append(...[
		{
			backgroundImage: 'radial-gradient(at -100% center, rgb(0 200 160), transparent), radial-gradient(at center 300%, rgb(255 0 0), transparent), radial-gradient(at 130% center, rgb(160 200 0), transparent), radial-gradient(at center -200%, rgb(0 0 255), transparent)',
			backgroundBlendMode: 'overlay',
			outline: '2px solid currentcolor',
		},
		{
			backgroundImage: 'radial-gradient(circle, black, black 1.5px, transparent 0)',
			backgroundSize: '18px 18px',
			backgroundRepeat: 'round',
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
	elements.image.appendChild(childContainer);
})();

for (const name of ['boundLimit', 'rail', 'boundLine', 'tangents']) {
	elements[name] = generate({
		parent: elements.imageContainer,
		style: {display: 'contents', pointerEvents: 'none'},
	});
}

export default elements;
