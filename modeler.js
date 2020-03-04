import isObject from "./isObject.js";

const reservedSchemaProps = [
  "type",
  "trim",
  "required",
  "minLength",
  "maxLength",
  "minValue",
  "maxValue",
  "regex",
  "arrayType",
  "isNumeric"
];

// Modeler Class Function
class Modeler {
  constructor() {}

  /**
   * Function to traverse and validate all properties of given schema then return the schema
   * @param {object} schema
   */
  Schema(schema) {
    let errors = {};
    let propKeyValues = []; // For Debugging

    // FUNCTION TO TRAVRSE ALL NODES OF OBJECT
    const traverse = (object, prevKey) => {
      for (var key in object) {
        let concatKey = key;
        const doesContainSchemaProps =
          reservedSchemaProps.indexOf(Object.keys(object[key])[0]) > -1;
        const isAtMaxDepth =
          !isObject(object[key], false) ||
          (isObject(object[key], false) &&
            (doesContainSchemaProps || Object.keys(object[key]).length === 0));

        if (prevKey) {
          concatKey = prevKey + "." + key;
        }

        if (isAtMaxDepth) {
          // VALIDATE EACH KEY VALUE ****************************
          // - Call validate() function for each schema property
          // ****************************************************
          errors = {
            ...errors,
            ...validate(key, concatKey, object)
          };

          // Uncomment below to gather schema properties
          propKeyValues.push({ [concatKey]: object[key] }); // For Debugging
        } else {
          // Go one step down in the object tree if object is found!
          traverse(object[key], concatKey);
        }
      }
    };

    if (!isObject(schema, false)) {
      errors.invalidObject =
        "Schema must be an object literal with at least one key-value pair";
    }

    if (Object.keys(schema).length === 0) {
      errors.emptyObject = "Schema must not be an empty object";
    }

    console.log("-------------- BEG: SCHEMA PROPS/ERRORS --------------");
    traverse(schema);

    console.log(propKeyValues); // For Debugging
    console.log("-------------- END: SCHEMA PROPS/ERRORS --------------");

    // Check to make sure there were no errors
    if (Object.keys(errors).length > 0) {
      console.log("[SCHEMA ERRORS] -> ", errors);
      throw new Error("[ERROR]: Invalid Schema");
    }

    return schema;
  }

  /**
   * Function to traverse and validate all properties of given schema then return the schema
   * @param {object} document the document/object to be compared against the given schema for validation
   * @param {object} schema a schema that has been traversed and validated by the Modeler class
   */
  Model(document, schema) {
    // TODO: Validate Model against Created schema
    return document;
  }
}

const validate = (key, concatKey, object) => {
  const propSchema = object[key];

  // Check if property schema is an object
  if (!isObject(propSchema, false)) {
    return { [concatKey]: concatKey + " schema must be an object literal" };
  }

  // Check if propert yschema is an empty object
  if (Object.keys(propSchema).length === 0) {
    return { [concatKey]: concatKey + " schema must not be an empty object" };
  }

  // Loop through given propSchema keys
  for (var key in propSchema) {
    const value = propSchema[key];

    switch (key) {
      case "type":
        if (typeof value !== "function") {
          return {
            [concatKey]:
              key +
              " must be a valid Javascript Type Function (String, Number, etc...)"
          };
        }
        break;
      case "trim":
        if (value !== true && value !== false) {
          return { [concatKey]: key + " must be a boolean value" };
        }
        break;
      case "required":
        if (value !== true && value !== false) {
          return { [concatKey]: key + " must be a boolean value" };
        }
        break;
      case "minLength":
        if (typeof value !== "number") {
          return { [concatKey]: key + " must be an integer" };
        }
        if (typeof value === "number" && (value % 1 !== 0 || value < 0)) {
          return {
            [concatKey]: key + " cannot be a float value or be negative"
          };
        }
        break;
      case "maxLength":
        if (typeof value !== "number") {
          return { [concatKey]: key + " must be an integer" };
        }
        if (typeof value === "number" && (value % 1 !== 0 || value < 0)) {
          return {
            [concatKey]: key + " cannot be a float value or be negative"
          };
        }
        break;
      case "minValue":
        if (typeof value !== "number") {
          return { [concatKey]: key + " must be an integer" };
        }
        if (typeof value === "number" && value % 1 !== 0) {
          return { [concatKey]: key + " cannot be a float value" };
        }
        break;
      case "maxValue":
        if (typeof value !== "number") {
          return { [concatKey]: key + " must be an integer" };
        }
        if (typeof value === "number" && value % 1 !== 0) {
          return { [concatKey]: key + " cannot be a float value" };
        }
        break;
      case "regex":
        if (!(value instanceof RegExp)) {
          return {
            [concatKey]: key + " must be in the form of a regular expression"
          };
        }
        break;
      case "arrayType":
        if (typeof value !== "function") {
          return {
            [concatKey]:
              key +
              " must be a valid Javascript Type Function (String, Number, etc...)"
          };
        }
        break;
      case "isNumeric":
        if (value !== true && value !== false) {
          return { [concatKey]: key + " must be a boolean value" };
        }
        break;
      default:
        return {
          [concatKey]: concatKey + " contains unknown schema key (" + key + ")"
        };
    }
  }

  return {};
};

export default Modeler;
