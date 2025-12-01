import {CLASS_WRAPPER, CLASS_SEMANTIC_BUTTON} from './consts';
import {SUB_PIXEL_BS} from './shared';
import {addRule} from './shared/css';
import {addVerticalRule} from './shared/orientation';

addRule(':root', {
	'--color': '#dddddd',
	'--background': '#231e25',
	'--border-color': '#868686',
	
	'font-family': 'EnsuredPerpetua',
	'font-size': '21px',
	'font-weight': '400',
	'background-color': 'var(--background)',
	color: 'var(--color)',
	'scrollbar-color': 'var(--color) transparent',
});

addRule('a', {color: '#badfdf'});

addRule(`.${CLASS_SEMANTIC_BUTTON}`, {
	'background-color': 'unset',
	padding: '0',
	color: 'inherit',
	border: 'none',
	font: 'inherit',
});

addRule(['button:hover', 'a:hover'], {
	filter: 'brightness(1.2)',
});

addRule(`.${CLASS_WRAPPER}`, {
	width: '100%',
	height: '100%',
	display: 'flex',
});

addVerticalRule(`.${CLASS_WRAPPER}`, {'flex-direction': 'column'});
