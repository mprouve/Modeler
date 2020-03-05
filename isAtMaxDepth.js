import isObject from "./isObject.js";
import doesContainSchemaProps from "./doesContainSchemaProps.js";

/**
 * Function to determine if current key-value is at deepest of (un)nested object
 * @param {any} value The value passed in for testing if there is a nested object with contents
 * value is at deepest part of (un)nested object
 */
const isAtMaxDepth = value => {
  if (!isObject(value, false)) return true;
  if (isObject(value, false) && doesContainSchemaProps(value)) return true;
  if (isObject(value, false) && Object.keys(value).length === 0) return true;

  return false;
};

export default isAtMaxDepth