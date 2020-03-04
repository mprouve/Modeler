import isObject from "./isObject.js";

const validateModelPOST = (key, concatKey, object, document, crudOp) => {
  const propSchema = object[key]; // Value of property schema to validate document prop value
  let propValue = document;
  let error = {}; // Variables ot hold returned error
  let returnedProp = {}; // variable to hold validated document object to object-spread into returned document

  // Check if property schema is an object
  if (!isObject(propSchema, false)) {
    error[concatKey] = concatKey + " schema must be an object literal";
    return { error, returnedProp: {} };
  }

  // Check if propert yschema is an empty object
  if (Object.keys(propSchema).length === 0) {
    error[concatKey] = concatKey + " schema must not be an empty object";
    return { error, returnedProp: {} };
  }

  // Split concatenated schema properties by '.'
  const props = concatKey.split(".");

  // Loop through props array to get property value from document
  for (var i = 0; i < props.length; i++) {
    propValue = propValue[props[i]];
    returnedProp[props[i]] = { ...document[props[i]] };

    // Check if property is found in schema
    if (
      i < props.length - 1 &&
      (typeof propValue === "undefined" || propValue === null)
    ) {
      propValue = undefined;
      break;
    }
  }

  console.log(`${concatKey} -->`, propValue);

  if (typeof propValue === "undefined") {
    if (crudOp === "POST") {
      if (propSchema.required) {
      }
    }

    if (crudOp === "PUT") {
    }
  }

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
            error[concatKey] = "Must be of type " + schemaValue.name;
            return { error, returnedProp: {} };
          }
        } else {
          if (!(propValue instanceof schemaValue)) {
            error[concatKey] = "Must be of type " + schemaValue.name;
            return { error, returnedProp: {} };
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
        error[concatKey] =
          concatKey + " contains unknown schema key (" + key + ")";
        return { error, returnedProp: {} };
    }
  }

  return { error: {}, returnedProp };
};

export default validateModelPOST;