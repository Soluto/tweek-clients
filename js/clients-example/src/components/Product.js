import React from 'react';
import glamorous from 'glamorous';
import Rating from './Rating';

const Container = glamorous.div(
  {
    display: 'grid',
  },
  ({ theme: { colors, layouts } }) => ({
    backgroundColor: colors.item.background,
    boxShadow: colors.item.shadow,
    ...layouts.item,
  }),
);

const DisplayName = glamorous.div(
  {
    textTransform: 'uppercase',
    fontSize: 'x-large',
    gridArea: 'display-name',
  },
  ({ theme: { layouts } }) => layouts.displayName,
);

const Description = glamorous.div(
  {
    gridArea: 'description',
  },
  ({ theme: { layouts } }) => layouts.description,
);

const Price = glamorous.div(
  {
    gridArea: 'price',
    '&::before': {
      content: '$',
    },
  },
  ({ theme: { layouts } }) => layouts.price,
);

const Thumbnail = glamorous.img(
  {
    gridArea: 'thumbnail',
    maxWidth: '100%',
    maxHeight: '100%',
  },
  ({ theme: { layouts } }) => layouts.thumbnail,
);

const Product = ({ displayName, image, description, price, rating }) => (
  <Container>
    <DisplayName>{displayName}</DisplayName>
    <Description>{description}</Description>
    <Price>{price}</Price>
    <Rating rating={rating} />
    <Thumbnail src={image} alt={displayName} />
  </Container>
);

export default Product;
