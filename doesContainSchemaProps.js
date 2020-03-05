import reservedSchemaProps from "./reservedSchemaProps.js";

/**
 * Function to determine if object consists of keys found in schemaProps Array
 * @param {object} obj The object whose contents we need to check
 */
const doesContainSchemaProps = obj => {
  const keys = Object.keys(obj);

  for (var i = 0; i < keys.length; i++) {
    const key = keys[i];

    if (reservedSchemaProps.indexOf(key) > -1) {
      return true;
    }
  }

  return false;
};

export default doesContainSchemaProps