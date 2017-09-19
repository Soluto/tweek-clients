import React from 'react';
import ReactDOM from 'react-dom';
import { withTweekKeys, Provider } from 'react-tweek';
import './index.css';
import items from './items.json';

const Item = ({ displayName, image, description, price }) => (
  <div className="item">
    <div className="display-name">{displayName}</div>
    <div className="description">Description: {description}</div>
    <div className="price">Price: {price}</div>
    <img className="thumbnail" src={image} alt={displayName} />
  </div>
);

const Shop = () => (
  <div className="shop">
    <div className="header">Tweek Shop</div>
    <div className="item-list">{items.map(({ id, ...props }) => <Item key={id} {...props} />)}</div>
  </div>
);

ReactDOM.render(
  <Provider baseServiceUrl="http://localhost:4003">
    <Shop />
  </Provider>,
  document.getElementById('root'),
);
