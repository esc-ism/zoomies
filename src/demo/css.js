import {addRule, HorizontalRules, VerticalRules} from '@/shared/css';

import {
	ID_WRAPPER, ID_WRAPPER_IMAGE, ID_CROSSHAIR,
	ID_RESIZER_HORIZONTAL, ID_RESIZER_VERTICAL,
} from './consts';

HorizontalRules.add(`#${ID_WRAPPER} + *`, {width: 0});
VerticalRules.add(`#${ID_WRAPPER} + *`, {height: 0});

HorizontalRules.add([`#${ID_WRAPPER}`, `#${ID_WRAPPER_IMAGE}`], {
	width: 'auto',
	height: '100%',
});
VerticalRules.add([`#${ID_WRAPPER}`, `#${ID_WRAPPER_IMAGE}`], {
	height: 'auto',
	width: '100%',
});

HorizontalRules.add(`#${ID_WRAPPER}`, {
	'padding-right': '20px',
});

VerticalRules.add(`#${ID_WRAPPER}`, {
	'flex-direction': 'column',
	'padding-bottom': '20px',
});

HorizontalRules.add(`#${ID_WRAPPER_IMAGE}`, {
	height: 'auto !important',
});

VerticalRules.add(`#${ID_WRAPPER_IMAGE}`, {
	width: 'auto !important',
});

addRule(`#${ID_WRAPPER_IMAGE} > *`, {position: 'absolute'});

addRule(`#${ID_CROSSHAIR}`, {'font-family': 'consolas, monospace'});
addRule(`#${ID_CROSSHAIR}::after`, {content: '"🞣"'});

addRule([`#${ID_RESIZER_HORIZONTAL}`, `#${ID_RESIZER_VERTICAL}`], {
	boxSizing: 'border-box',
	position: 'absolute',
	backgroundColor: 'var(--background)',
});
