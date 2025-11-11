export const xmlns = 'http://www.w3.org/1998/Math/MathML';

export const opSpace = {tag: 'mspace', style: {width: '0.8em'}, xmlns};

export const getOverlined = (content) => ({
	tag: 'mrow', xmlns, style: {textDecoration: 'overline', textDecorationThickness: '1px'}, content: content.split('').map((content) => ({
		tag: 'mi', xmlns, content,
	})),
});
