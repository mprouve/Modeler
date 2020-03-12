/**
 * Function to set a property in nested object with string in form of 'x.x.0.x...'
 * ***NOTE: Affects passed in object - does NOT return
 * @param {object} obj The object to set
 * @param {any} value The value to set to the property at corresponding path
 * @param {string} path The path to property to set
 */
const setNestedPropFromString = (obj, value, path) => {
  var i;

  path = path.split(".");

  for (i = 0; i < path.length - 1; i++) {
    if (typeof obj[path[i]] === "undefined") {
      obj[path[i]] = {};
    }

    obj = obj[path[i]];
  }

  obj[path[i]] = value;
};

export default setNestedPropFromString;
