import {getIdGetter} from '@css';

export const BUILT_INS = {
	imageWidth: ({imageDimensions: {width: value}}) => ({value, type: 'x', showRotation: false}),
	imageHeight: ({imageDimensions: {height: value}}) => ({value, type: 'y', showRotation: false}),
	
	viewportWidth: ({viewportDimensions: {width: value}}) => ({value, type: 'xvp', showRotation: false}),
	viewportHeight: ({viewportDimensions: {height: value}}) => ({value, type: 'yvp', showRotation: false}),
	
	'image½Width': ({imageDimensions: {halfWidth: value}}) => ({value, type: 'x', showRotation: false}),
	'image½Height': ({imageDimensions: {halfHeight: value}}) => ({value, type: 'y', showRotation: false}),
	
	'viewport½Width': ({viewportDimensions: {halfWidth: value}}) => ({value, type: 'xvp', showRotation: false}),
	'viewport½Height': ({viewportDimensions: {halfHeight: value}}) => ({value, type: 'yvp', showRotation: false}),
	
	π: () => ({value: Math.PI, type: 'angle'}),
	'½π': () => ({value: Math.PI / 2, type: 'angle'}),
	
	x: ({position: {x}}) => ({value: x}),
	y: ({position: {y}}) => ({value: y}),
	
	rotation: ({rotation: value}) => ({value, type: 'angle'}),
	zoom: ({zoom: value}) => ({value, type: 'zoom'}),
};

const getId = getIdGetter('codegen');

export const CLASS_NAMES = {
	'+': getId('add'),
	'-': getId('sub'),
	'*': getId('mult'),
	'/': getId('div'),
	'=': getId('assign'),
	array: getId('array'),
	if: getId('if'),
	'?': getId('question'),
	':': getId('colon'),
	'!': getId('not'),
	'<=': getId('le'),
	'>=': getId('ge'),
	'<': getId('l'),
	'>': getId('g'),
	'!=': getId('ne'),
	abs: getId('abs'),
	floor: getId('floor'),
	min: getId('min'),
	max: getId('max'),
	sin: getId('sin'),
	cos: getId('cos'),
	tan: getId('tan'),
	atan: getId('atan'),
	root: getId('root'),
	pow: getId('pow'),
	call: getId('call'),
	evocation: getId('evocation'),
	args: getId('args'),
	params: getId('params'),
	csv: getId('csv'),
	id: getId('id'),
	number: getId('number'),
	negative: getId('negative'),
	clause: getId('clause'),
	indent: getId('indent'),
	return: getId('return'),
	func: getId('func'),
	branch: {
		accept: getId('branch', 'accept'),
		reject: getId('branch', 'reject'),
	},
	inactive: getId('inactive'),
	hovered: getId('hovered'),
	
	refresh: getId('refresh'),
};
