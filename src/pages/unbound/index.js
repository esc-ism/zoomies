import {CLASS_MATH_LOOSE, TWEEN_OPTIONS_SETUP} from '../consts';
import {getText, getInstruction, getInputDependent, getMath, getDialogue, getConnectedPunctuation} from '../shared';
import {getButton} from '../shared/button';
import {xmlns} from '../shared/math';
import {IDS} from '../shared/page';

import System from './demo';

export default {
	System,
	text: getText(
		{
			tag: 'h1',
			style: {textAlign: 'center'},
			content: IDS.UNBOUND,
		},
		[
			'Panning is limited through the enforcement of "bounds".',
			'Bounds enclose an area where users may move freely, keeping everywhere else off-limits.',
		],
		[
			'To begin, I\'d like to talk about why bounds are helpful.',
			'Aiding my explanation is this page\'s playground, in which bounds are entirely absent.',
			'Where ',
			{tag: 'math', xmlns, classList: [CLASS_MATH_LOOSE], content: [
				{tag: 'mo', xmlns, content: '('},
				{tag: 'mi', xmlns, content: 'x'},
				{tag: 'mo', xmlns, content: ','},
				{tag: 'mi', xmlns, content: 'y'},
				{tag: 'mo', xmlns, content: ')'},
			]},
			' is the position of the viewport\'s center, a formal description of the system used by the playground might read:',
		],
		getMath({
			content: {tag: 'mtable', xmlns, content: [
				{tag: 'mtr', xmlns, content: [
					{tag: 'mtd', xmlns, content: [
						{tag: 'mn', xmlns, content: '-∞'},
						{tag: 'mo', xmlns, content: '<'},
						{tag: 'mi', xmlns, content: 'x'},
						{tag: 'mo', xmlns, content: '<'},
						{tag: 'mn', xmlns, content: '∞'},
					]},
				]},
				{tag: 'mtr', xmlns, content: [
					{tag: 'mtd', xmlns, content: [
						{tag: 'mn', xmlns, content: '-∞'},
						{tag: 'mo', xmlns, content: '<'},
						{tag: 'mi', xmlns, content: 'y'},
						{tag: 'mo', xmlns, content: '<'},
						{tag: 'mn', xmlns, content: '∞'},
					]},
				]},
			]},
		}),
		{
			tag: 'h2',
			style: {textAlign: 'center'},
			content: 'Effectiveness',
		},
		getInstruction([
			'See the pink text below?',
			getInputDependent((isMouse) =>
				` ${isMouse ? 'Click' : 'Tap'} it for a visualisation.` +
				` ${isMouse ? 'Click' : 'Tap'} again to restore your playground state.`),
		]),
		[
			'A competent user of this system may ',
			getButton('self-impose', [
				[{zoom: 1, position: 0}, TWEEN_OPTIONS_SETUP],
				[{position: 0.2}],
				[{position: {x: 0.3, y: -0.2}}],
				[{position: {x: -0.2, y: -0.3}}],
				[{position: {x: -0.4, y: 0.2}}],
			]),
			' bounds to keep their bearings.',
			'But what if their ',
			getConnectedPunctuation(getButton('finger slips', [
				[{zoom: 1, position: 0}, TWEEN_OPTIONS_SETUP],
				[{position: 2}],
			]), '?'),
		],
		[
			'It\'s possible for users to fall away from the image and become lost in the void.',
			'Bounds prevent this by keeping users from straying too far beyond the confines of the image.',
			'Like how game developers endeavour to keep players from clipping out of levels, effective bounds keep the viewport attached to its content.',
		],
		[
			'A subtler deficiency exists in this system\'s snap-panning abilities.',
			'The problem is shared by the system on the next page, where it will be discussed in detail.',
		],
		{
			tag: 'h2',
			style: {textAlign: 'center'},
			content: 'Conclusion',
		},
		[
			'There do exist niche use cases for unbound panning.',
			'It\'s preferable for images with no max size,',
			'like a world map that wraps around, or a canvas that grows to accommodate new input.',
			'In most cases, however, bounds are useful.',
		],
		[
			'Utility doesn\'t ', {tag: 'i', content: 'really'}, ' matter to me, though.',
			'More important is that unbound panning is ', {tag: 'strong', content: 'boring'}, ' and bound panning is ', {tag: 'strong', content: 'interesting'}, '!',
		],
		getDialogue('you agree this is boring? why write about it?'),
		[
			'No story\'s ending is as impactful without context.',
			'These early pages set up the complex bounding coming later, and document the journey I took to get there.',
			'We\'ll get to the good stuff soon, and, when we do, hopefully you\'ll find it as interesting as I do!',
		],
	),
};
