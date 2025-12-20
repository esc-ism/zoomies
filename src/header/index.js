import {inputListener} from '../consts';

import touchIcon from './touch';
import mouseIcon from './mouse';
import gitIcon from './git';

const container = document.createElement('div');

container.style.height = '3em';
container.style.minWidth = '100%';
container.style.display = 'flex';
container.style.alignItems = 'center';
container.style.borderBottom = '1px solid currentcolor';
container.style.boxSizing = 'border-box';
container.style.position = 'sticky';
container.style.left = '0';
container.style.marginTop = '-3em';
// avoid affecting page positions
container.style.marginLeft = '-100%';
container.style.overflowX = 'auto';
container.style.scrollbarWidth = 'none';

const email = document.createElement('a');

email.innerText = 'callumtylerlatham@gmail.com';
email.href = 'mailto:callumtylerlatham@gmail.com';

email.style.opacity = '0.8';
email.style.flexGrow = '1';
email.style.textAlign = 'center';
email.style.padding = '0 0.5em';
email.style.overflow = 'hidden';
email.style.textOverflow = 'ellipsis';
// maximise button size
email.style.lineHeight = '3em';

const buttonContainer = document.createElement('div');

buttonContainer.style.height = '100%';
buttonContainer.style.display = 'flex';

const update = () => {
	const [on, off] = inputListener.isMouse ? [mouseIcon, touchIcon] : [touchIcon, mouseIcon];
	
	on.disabled = true;
	on.style.removeProperty('cursor');
	
	off.disabled = false;
	off.style.cursor = 'pointer';
};

inputListener.add(update);

mouseIcon.addEventListener('click', () => {
	inputListener.set(true);
});

touchIcon.addEventListener('click', () => {
	inputListener.set(false);
});

buttonContainer.append(touchIcon, mouseIcon);
container.append(buttonContainer, email, gitIcon);

export default container;
