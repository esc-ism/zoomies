import {getIdGetter} from '@/shared/css';

export const ANGLE_RADIUS = 10;

export const BUILT_INS = {
	imageWidth: ({sizesImage: {width: value}}) => ({value, type: 'x', showRotation: false, isPercent: false, doCenter: true}),
	imageHeight: ({sizesImage: {height: value}}) => ({value, type: 'y', showRotation: false, isPercent: false, doCenter: true}),
	
	viewportWidth: ({sizesViewport: {width: value}}) => ({value, type: 'xvp', showRotation: false, isPercent: false, doCenter: true}),
	viewportHeight: ({sizesViewport: {height: value}}) => ({value, type: 'yvp', showRotation: false, isPercent: false, doCenter: true}),
	
	'½imageWidth': ({sizesImage: {halfWidth: value}}) => ({value, type: 'x', showRotation: false, isPercent: false}),
	'½imageHeight': ({sizesImage: {halfHeight: value}}) => ({value, type: 'y', showRotation: false, isPercent: false}),
	
	'½viewportWidth': ({sizesViewport: {halfWidth: value}}) => ({value, type: 'xvp', showRotation: false, isPercent: false}),
	'½viewportHeight': ({sizesViewport: {halfHeight: value}}) => ({value, type: 'yvp', showRotation: false, isPercent: false}),
	
	π: () => ({value: Math.PI, type: 'angle', fight: true}),
	'½π': () => ({value: Math.PI / 2, type: 'angle', fight: true}),
	'¼π': () => ({value: Math.PI / 4, type: 'angle', fight: true}),
	'⅛π': () => ({value: Math.PI / 8, type: 'angle', fight: true}),
	
	x: ({position: {x}}) => ({value: x}),
	y: ({position: {y}}) => ({value: y}),
	
	rotation: ({rotation: value}) => ({value, type: 'angle', fight: true}),
	zoom: ({zoom: value}) => ({value, type: 'zoom'}),
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

export const CLASS_TOOLTIP = getId('tooltip');

export const CLASS_TOOLTIP_BOTTOM = getId('tooltip', 'bottom');
export const CLASS_TOOLTIP_TOP = getId('tooltip', 'top');
export const CLASS_TOOLTIP_LEFT = getId('tooltip', 'left');
export const CLASS_TOOLTIP_RIGHT = getId('tooltip', 'right');
