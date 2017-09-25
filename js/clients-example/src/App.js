import React from 'react';
import glamorous from 'glamorous';
import Product from './components/Product';
import items from './items.json';

const Shop = glamorous.div(
  {
    padding: '32px 64px',
  },
  ({ theme }) => ({
    backgroundColor: theme.colors.background,
    color: theme.colors.color,
  }),
);

const Header = glamorous.div({
  textTransform: 'uppercase',
  fontSize: 'xx-large',
  textAlign: 'center',
});

const ItemsList = glamorous.div(
  {
    margin: 'auto',
  },
  ({ theme: { layouts } }) => layouts.list,
);

const App = () => (
  <Shop>
    <Header>Tweek Shop</Header>
    <ItemsList>{items.map(({ id, ...props }) => <Product key={id} {...props} />)}</ItemsList>
  </Shop>
);

export default App;
