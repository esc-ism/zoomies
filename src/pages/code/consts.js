import {getIdGetter} from '@/shared/css';

export const ANGLE_RADIUS = 10;

export const BUILT_INS = {
	imageWidth: ({sizesImage: {width: value}}) => ({value, description: 'The image\'s horizontal diameter', type: 'x', isPercent: false, doCenter: true}),
	imageHeight: ({sizesImage: {height: value}}) => ({value, description: 'The image\'s vertical diameter', type: 'y', isPercent: false, doCenter: true}),
	
	viewportWidth: ({sizesViewport: {width: value}}) => ({value, description: 'The viewport\'s horizontal diameter', type: 'xvp', isPercent: false, doCenter: true}),
	viewportHeight: ({sizesViewport: {height: value}}) => ({value, description: 'The viewport\'s vertical diameter', type: 'yvp', isPercent: false, doCenter: true}),
	
	'½imageWidth': ({sizesImage: {halfWidth: value}}) => ({value, description: 'The image\'s horizontal radius', type: 'x', isPercent: false}),
	'½imageHeight': ({sizesImage: {halfHeight: value}}) => ({value, description: 'The image\'s vertical radius', type: 'y', isPercent: false}),
	
	'½viewportWidth': ({sizesViewport: {halfWidth: value}}) => ({value, description: 'The viewport\'s horizontal radius', type: 'xvp', isPercent: false}),
	'½viewportHeight': ({sizesViewport: {halfHeight: value}}) => ({value, description: 'The viewport\'s vertical radius', type: 'yvp', isPercent: false}),
	
	'2π': () => ({value: Math.PI * 2, description: '360°', type: 'angle', fight: true}),
	π: () => ({value: Math.PI, description: '180°', type: 'angle', fight: true}),
	'½π': () => ({value: Math.PI / 2, description: '90°', type: 'angle', fight: true}),
	'¼π': () => ({value: Math.PI / 4, description: '45°', type: 'angle', fight: true}),
	'⅛π': () => ({value: Math.PI / 8, description: '22.5°', type: 'angle', fight: true}),
	
	x: ({position: {x}}) => ({value: x, description: 'The x position of the viewport\'s center as a fraction of image width', type: 'x'}),
	y: ({position: {y}}) => ({value: y, description: 'The y position of the viewport\'s center as a fraction of image height', type: 'y'}),
	
	rotation: ({rotation: value}) => ({value, description: 'The angle between the image\'s positive y-axis and its un-rotated positive x-axis', type: 'angle', fight: true}),
	zoom: ({zoom: value}) => ({value, description: 'The image\'s scale', type: 'zoom'}),
	
	'∞': () => ({value: Infinity, description: 'Infinity'}),
	ε: () => ({value: Number.EPSILON, description: 'The smallest number that JavaScript can handle'}),
};

const getId = getIdGetter('codegen');

export const CLASS_MAXIMISED = getId('maximised');

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
	'==': getId('eq'),
	'||': getId('or'),
	'&&': getId('and'),
	'...': getId('spread'),
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
	log2: getId('log2'),
	call: getId('call'),
	evocation: getId('evocation'),
	args: getId('args'),
	params: getId('params'),
	csv: getId('csv'),
	id: getId('id'),
	bool: getId('bool'),
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
	line: getId('line'),
	wrapper: getId('wrapper'),
};

export const CLASS_TOOLTIP_WRAPPER = getId('tooltip', 'wrapper');
export const CLASS_TOOLTIP_CONTAINER = getId('tooltip', 'container');
export const CLASS_TOOLTIP_BODY = getId('tooltip', 'body');
export const CLASS_TOOLTIP_BACKGROUND = getId('tooltip', 'background');

export const CLASS_TOOLTIP_VALUE = getId('tooltip', 'value');

export const CLASS_TOOLTIP_BOTTOM = getId('tooltip', 'bottom');
export const CLASS_TOOLTIP_TOP = getId('tooltip', 'top');
export const CLASS_TOOLTIP_LEFT = getId('tooltip', 'left');
export const CLASS_TOOLTIP_RIGHT = getId('tooltip', 'right');

export const ALLOWANCE_TOOLTIP_SIDE = 12;
