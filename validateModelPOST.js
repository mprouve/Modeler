import isObject from "./isObject.js";

const validateModelPOST = (object, key, concatKey, params) => {
  const propSchema = object[key]; // Value of property schema to validate document prop value
  const { schema, doc } = params;
  let propValue = doc;

  // Check if property schema is an object
  if (!isObject(propSchema, false)) {
    return { [concatKey]: concatKey + " schema must be an object literal" };
  }

  // Check if propert yschema is an empty object
  if (Object.keys(propSchema).length === 0) {
    return { [concatKey]: concatKey + " schema must not be an empty object" };
  }

  // Split concatenated schema properties by '.'
  const props = concatKey.split(".");

  // Loop through props array to get property value from document
  for (var i = 0; i < props.length; i++) {
    propValue = propValue[props[i]];

    // Check if property is found in schema
    if (
      i < props.length - 1 &&
      (typeof propValue === "undefined" || propValue === null)
    ) {
      propValue = undefined;
      break;
    }
  }

  // console.log(`${concatKey} -->`, propValue);

  // Loop through given propSchema keys
  for (var prop in propSchema) {
    const schemaValue = propSchema[prop];

    switch (prop) {
      case "type":
        // Check if String, Number, or Boolean type matches propValue type
        if (
          schemaValue === String ||
          schemaValue === Number ||
          schemaValue === Boolean
        ) {
          if (propValue !== schemaValue(propValue)) {
            return { [concatKey]: "Must be of type " + schemaValue.name };
          }
        } else {
          if (!(propValue instanceof schemaValue)) {
            return { [concatKey]: "Must be of type " + schemaValue.name };
          }
        }
        break;
      case "defaultValue":
        break;
      case "trim":
        break;
      case "required":
        break;
      case "minLength":
        break;
      case "maxLength":
        break;
      case "minValue":
        break;
      case "maxValue":
        break;
      case "regex":
        break;
      case "arrayType":
        break;
      case "isNumeric":
        break;
      default:
        return {
          [concatKey]: concatKey + " contains unknown schema key (" + key + ")"
        };
    }
  }

  return {};
};

export default validateModelPOST;
