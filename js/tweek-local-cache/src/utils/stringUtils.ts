function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function snakeToCamelCase(keyName: string) {
  let [first, ...others] = keyName.split('_');
  return [first, ...others.map(capitalize)].join('');
}
