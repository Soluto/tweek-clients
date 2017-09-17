import { shape, func } from 'prop-types';

export default shape({
  prepare: func.isRequired,
  get: func.isRequired,
  refresh: func.isRequired,
});
