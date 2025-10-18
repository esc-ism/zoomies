import {CLASS_WRAPPER} from './consts';
import {addRule} from './shared/css';
import {addVerticalRule} from './shared/orientation';

addRule(':root', {
	'--color': '#dddddd',
	'--background': '#231e25',
	
	'font-family': 'perpetua, serif',
	'font-size': '21px',
	'font-weight': '400',
	'background-color': 'var(--background)',
	color: 'var(--color)',
	'scrollbar-color': 'var(--color) transparent',
});

addRule('a', {color: '#badfdf'});

addRule(`.${CLASS_WRAPPER}`, {
	width: '100%',
	height: '100%',
	display: 'flex',
});

addVerticalRule(`.${CLASS_WRAPPER}`, {'flex-direction': 'column'});
