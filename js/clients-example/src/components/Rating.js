import React from 'react';
import glamorous from 'glamorous';
import { branch, compose, renderNothing } from 'recompose';
import { withTweekKeys } from 'react-tweek';

const Container = glamorous.div(
  {
    gridArea: 'rating',
  },
  ({ theme: { layouts } }) => layouts.rating,
);

const StarContainer = glamorous.svg(
  {
    stroke: 'black',
    strokeWidth: 3,
    height: '1em',
    margin: '0 1px',
  },
  ({ theme: { colors }, type }) => {
    let fill;
    switch (type) {
      case 'full':
        fill = colors.star.fill;
        break;
      case 'half':
        fill = 'url(#grad1)';
        break;
      default:
        fill = '#BBBBBB';
        break;
    }

    return { ...colors.star, fill, color: colors.star.fill };
  },
);

const Span = glamorous.span({
  verticalAlign: 'text-bottom',
  marginLeft: 5,
});

const Star = props => (
  <StarContainer {...props} viewBox="0 0 50 48">
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: 'currentColor', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#BBBBBB', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <g transform="matrix(0.5, 0, 0, 0.5, -27, -310)">
      <path d="M103,620l16.5,30.2l33.5,6.5l-23.3,25.1l4.2,34.2L103,701.4L72.1,716l4.2-34.2L53,656.7l33.5-6.5L103,620" />
    </g>
  </StarContainer>
);

function renderStars(rating) {
  const result = new Array(5);
  for (let i = 0; i < 5; i++) {
    let type;
    if (rating > 0.75) {
      type = 'full';
    } else if (rating > 0.25) {
      type = 'half';
    } else {
      type = 'empty';
    }
    result[i] = <Star key={i} type={type} />;
    rating -= 1;
  }
  return result;
}

const Rating = ({ rating }) => (
  <Container>
    {renderStars(rating)}
    <Span>{rating}</Span>
  </Container>
);

export default compose(withTweekKeys('shop/rating/is_enabled'), branch(props => !props.isEnabled, renderNothing))(
  Rating,
);
