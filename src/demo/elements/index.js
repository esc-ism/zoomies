import {CLASS_HIDE_HORIZONTAL, CLASS_HIDE_VERTICAL} from '@/shared/orientation';

import {
	ID_WRAPPER, ID_WRAPPER_IMAGE, ID_CONTAINER_IMAGE, ID_IMAGE,
	ID_CROSSHAIR, ID_RESIZER_HORIZONTAL, ID_RESIZER_VERTICAL,
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
	id: ID_WRAPPER_IMAGE,
	parent: elements.viewport,
	style: {
		boxSizing: 'border-box',
		height: '100%',
		width: '100%',
		display: 'flex',
		flexWrap: 'wrap',
		placeContent: 'center center',
		border: '1px solid transparent',
		borderRightColor: 'currentcolor',
		position: 'relative',
	},
});

elements.imageContainer = generate({
	id: ID_CONTAINER_IMAGE,
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
		position: 'absolute',
		boxSizing: 'border-box',
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
		'border-bottom': '1px solid currentcolor',
		cursor: 'row-resize',
	},
});

(() => {
	const childContainer = document.createElement('div');
	
	childContainer.style.flexGrow = '1';
	childContainer.style.position = 'relative';
	childContainer.style.pointerEvents = 'none';
	
	const dotSize = '18px';
	
	childContainer.append(
		...[
			{
				backgroundImage: 'linear-gradient(to right, #666, #666), radial-gradient(at -100% center, rgb(0 200 160), transparent), radial-gradient(at center 300%, rgb(255 0 0), transparent), radial-gradient(at 130% center, rgb(160 200 0), transparent), radial-gradient(at center -200%, rgb(0 0 255), transparent)',
				backgroundBlendMode: 'overlay',
				boxSizing: 'border-box',
			},
			{
				backgroundImage: 'radial-gradient(circle, black, black 1.5px, transparent 0)',
				backgroundSize: `${dotSize} ${dotSize}`,
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
		}),
		...[
			['width', 'height', 'right'],
			['width', 'height', 'left'],
			['height', 'width', 'top'],
			['height', 'width', 'bottom'],
		].map(([small, large, edge]) => {
			const element = document.createElement('div');
			
			element.style.position = 'absolute';
			element.style.backgroundColor = '#ffffff50';
			element.style[small] = `min(50%, ${dotSize})`;
			element.style[large] = '100%';
			element.style[edge] = '0';
			
			return element;
		}),
	);
	
	elements.image.appendChild(childContainer);
})();

for (const name of ['boundLimit', 'rail', 'boundLine', 'tangents']) {
	elements[name] = generate({
		parent: elements.imageContainer,
		style: {display: 'contents', pointerEvents: 'none'},
	});
}

export default elements;
