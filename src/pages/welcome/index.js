import {getText} from '../shared';

import {CLASS_INSTRUCTION} from '../consts';

export default (wrapper) => {
	wrapper.appendChild(getText(
		{
			content: [
				'Hello! I\'m Callum.',
				'I\'m a front-end developer who has been unemployed for the past two years whilst working on panning problems.',
				'Specifically, I\'ve been working on pan-limiting where zoom, rotation and aspect ratios (for both image and viewport) are variable.',
				'This website serves as my essay on panning, discussing the problems and demonstrating my solutions.',
			],
		},
		{
			content: 'Hit your right arrow key to continue.',
			classList: [CLASS_INSTRUCTION],
		},
	));
};
