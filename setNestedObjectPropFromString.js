/**
   * Function to set a property in nested object with string in form of 'x.x.0.x...'
   * @param {object} obj The object to set
   * @param {any} value The value to set to the property at corresponding path
   * @param {string} path The path to property to set
   */
const setNestedPropFromString = (obj, value, path) => {
  let object = obj

  path = path.split('.');

  for (i = 0; i < path.length - 1; i++)
    object = object[path[i]];

  obj[path[i]] = value;

  return object
}

export default setNestedPropFromString