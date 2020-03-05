import isObject from "./isObject.js";
import isAtMaxDepth from "./isAtMaxDepth.js";

const validateSchema = schema => {
  let errors = {};

  // Check if Schema is an object literal and is not empty
  if (!isObject(schema, false)) {
    this.errors.invalidSchema =
      "Schema must be an object literal with at least one key-value pair";
  } else if (Object.keys(schema).length === 0) {
    this.errors.emptySchema = "Schema must not be an empty object";
  }

  // Function to traverse all nodes of schema
  const traverseSchema = (object, prevKey) => {
    for (var key in object) {
      let concatKey = key;
      const value = object[key];
      const shouldStopNesting = isAtMaxDepth(value);

      if (prevKey) {
        concatKey = prevKey + "." + key;
      }

      if (shouldStopNesting) {
        // VALIDATE EACH KEY VALUE - Call validatePropSchema() function for each schema property
        const error = validatePropSchema(value, concatKey);

        errors = {
          ...errors,
          ...error
        };
      } else {
        // Go one step down in the object tree if object is found!
        traverseSchema(value, concatKey);
      }
    }
  };

  console.log("-------------- BEG: VALIDATE SCHEMA PROPS --------------");
  traverseSchema(schema, null);
  console.log("-------------- END: VALIDATE SCHEMA PROPS --------------");

  // Check to make sure there were no errors
  if (Object.keys(errors).length > 0) {
    console.log("[SCHEMA ERRORS] -> ", errors);
    throw new Error("[ERROR]: Invalid Schema");
  }

  return { schema, errors };
};

const validatePropSchema = (propSchema, concatKey) => {
  // Check if property schema is an object
  if (!isObject(propSchema, false)) {
    return { [concatKey]: concatKey + " schema must be an object literal" };
  }

  // Check if propert yschema is an empty object
  if (Object.keys(propSchema).length === 0) {
    return { [concatKey]: concatKey + " schema must not be an empty object" };
  }

  // Check if property 'type' is included
  if (typeof propSchema.type === "undefined") {
    return {
      [concatKey]: concatKey + " schema must include a <type> property"
    };
  }

  // Check if property 'defaultValue' is included
  if (typeof propSchema.defaultValue === "undefined") {
    return {
      [concatKey]: concatKey + " schema must include a <defaultValue> property"
    };
  }

  console.log(`${concatKey} -->`, propSchema); // Debugging

  // Loop through given propSchema keys
  for (var prop in propSchema) {
    const value = propSchema[prop];

    switch (prop) {
      case "type":
        // Check if type is a valid Javascript type function
        if (typeof value !== "function") {
          return {
            [concatKey]:
              prop +
              " must be a valid Javascript Type Function (String, Number, etc...)"
          };
        }
        break;
      case "defaultValue":
        // Check if defaultValue is not null or undefined
        if (typeof value === "undefined" || value === null) {
          return { [concatKey]: prop + " must not be null or undefined" };
        }
        // Check if defaultValue is not match type
        if (
          propSchema.type === String ||
          propSchema.type === Number ||
          propSchema.type === Boolean
        ) {
          if (value !== propSchema.type(value)) {
            return {
              [concatKey]: prop + " must be of type " + propSchema.type.name
            };
          }
        } else {
          if (!(value instanceof propSchema.type)) {
            return {
              [concatKey]: prop + " must be of type " + propSchema.type.name
            };
          }
        }
        break;
      case "trim":
        // Check if trim is vaild boolean
        if (value !== true && value !== false) {
          return { [concatKey]: prop + " must be a boolean value" };
        }
        break;
      case "required":
        // Check if required is vaild boolean
        if (value !== true && value !== false) {
          return { [concatKey]: prop + " must be a boolean value" };
        }
        break;
      case "minLength":
        // Check if minLength is an integer
        if (typeof value !== "number") {
          return { [concatKey]: prop + " must be an integer" };
        }
        // Check if minLength is not a float or negative
        if (typeof value === "number" && (value % 1 !== 0 || value < 0)) {
          return {
            [concatKey]: prop + " cannot be a float value or be negative"
          };
        }
        break;
      case "maxLength":
        // Check if maxLength is an integer
        if (typeof value !== "number") {
          return { [concatKey]: prop + " must be an integer" };
        }
        // Check if maxLength is not a float or negative
        if (typeof value === "number" && (value % 1 !== 0 || value < 0)) {
          return {
            [concatKey]: prop + " cannot be a float value or be negative"
          };
        }
        break;
      case "minValue":
        // Check if minValue is an integer
        if (typeof value !== "number") {
          return { [concatKey]: prop + " must be an integer" };
        }
        // Check if minValue is not a float
        if (typeof value === "number" && value % 1 !== 0) {
          return { [concatKey]: prop + " cannot be a float value" };
        }
        break;
      case "maxValue":
        // Check if maxValue is an integer
        if (typeof value !== "number") {
          return { [concatKey]: prop + " must be an integer" };
        }
        // Check if maxValue is not a float
        if (typeof value === "number" && value % 1 !== 0) {
          return { [concatKey]: prop + " cannot be a float value" };
        }
        break;
      case "regex":
        // Check if regex is a valid regex expression
        if (!(value instanceof RegExp)) {
          return {
            [concatKey]: prop + " must be in the form of a regular expression"
          };
        }
        break;
      case "arrayType":
        // Check if arrayType is a valid javascript type function
        if (typeof value !== "function") {
          return {
            [concatKey]:
              prop +
              " must be a valid Javascript Type Function (String, Number, etc...)"
          };
        }
        break;
      case "isNumeric":
        // Check if isNUmeric is a boolean
        if (value !== true && value !== false) {
          return { [concatKey]: prop + " must be a boolean value" };
        }
        break;
      default:
        // Catch any unrecognized schema prop values
        return {
          [concatKey]: concatKey + " contains unknown schema key (" + prop + ")"
        };
    }
  }

  return {};
};

export default validateSchema;