import { mapProps } from 'recompose';

export default (propName, allowedValues, defaultValue = allowedValues[0]) => {
  allowedValues = new Set(allowedValues);

  return mapProps(({ [propName]: value, ...props }) => ({
    [propName]: allowedValues.has(value) ? value : defaultValue,
    ...props,
  }));
};
