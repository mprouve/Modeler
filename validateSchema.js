import isObject from "./isObject.js";
import isAtMaxDepth from "./isAtMaxDepth.js";

/**
 * Function called by the class method to traverse and validate the entire schema object passed in.
 * @param {object} schema The schema to validate for correctness
 */
const validateSchema = schema => {
  let errors = {};
  let stopAll = false;

  // Check if Schema is an object literal and is not empty
  if (!isObject(schema, false)) {
    errors.invalidSchema =
      "Schema must be an object literal with at least one key-value pair";
  } else if (Object.keys(schema).length === 0) {
    errors.emptySchema = "Schema must not be an empty object";
  }

  // Function to traverse all nodes of schema
  const traverseSchema = (object, prevKey) => {
    for (var key in object) {
      if (stopAll) break;

      let concatKey = key;
      const value = object[key];
      const shouldStopNesting = isAtMaxDepth(value);

      if (prevKey) {
        concatKey = prevKey + "." + key;
      }

      if (shouldStopNesting) {
        // VALIDATE EACH KEY VALUE - Call validatePropSchema() function for each schema property
        const error = validatePropSchema(value, concatKey);

        // Append any errors and break
        if (Object.keys(error).length > 0) {
          errors = {
            ...errors,
            ...error
          };

          stopAll = true;
          break;
        }
      } else {
        // Go one step down in the object tree if object is found!
        traverseSchema(value, concatKey);
      }
    }
  };

  console.log("---------- BEG: VALIDATE SCHEMA PROPS ----------");
  traverseSchema(schema, null);
  console.log("---------- END: VALIDATE SCHEMA PROPS ----------");

  // Check to make sure there were no errors
  if (Object.keys(errors).length > 0) {
    console.log("[VALIDATE SCHEMA ERRORS] -> ", errors);
    // throw new Error("[ERROR]: Invalid Schema");

    return { schema: null, errors };
  }

  return { schema, errors };
};

/**
 * Function to type check an individual property schema
 * @param {object} propSchema The property schema to validate for correctness
 * @param {string} concatKey The string representing the path of the property schema
 */
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
  if (typeof propSchema.type === "undefined" || propSchema.type === null) {
    return {
      [concatKey]: concatKey + " schema <type> must not be undefined or null"
    };
  }

  // Check if neither <required> nor <defaultValue> are provided
  if (
    typeof propSchema.required === "undefined" &&
    typeof propSchema.defaultValue === "undefined"
  ) {
    return {
      [concatKey]:
        concatKey +
        " schema must include <defaultValue> if <required> is false or is not provided. Must set <required> to true if <defaultValue> is not provided."
    };
  }

  // Check if property 'defaultValue' is unddefined and 'required' property is false or undefined
  if (
    typeof propSchema.defaultValue === "undefined" &&
    (propSchema.required === false ||
      typeof propSchema.required === "undefined")
  ) {
    return {
      [concatKey]:
        concatKey +
        " schema must include a <defaultValue> property if <required> is set to false or <required> is not provided"
    };
  }

  // Check if property 'defaultValue' is included while 'required' property is set to true
  if (
    propSchema.required === true &&
    typeof propSchema.defaultValue !== "undefined"
  ) {
    return {
      [concatKey]:
        concatKey +
        " schema must not include a <defaultValue> property if <required> is set to true"
    };
  }

  console.log(`${concatKey} -->`, propSchema); // Debugging

  // Loop through given propSchema keys
  for (var prop in propSchema) {
    const value = propSchema[prop];

    // Check if defaultValue is null or undefined
    if (typeof value === "undefined" || value === null) {
      return { [concatKey]: prop + " must not be null or undefined" };
    }

    switch (prop) {
      case "type":
        // Check if type is a valid Javascript type function or is an array of javascript type functions
        if (typeof value !== "function") {
          if (Array.isArray(value)) {
            if (value.length === 0) {
              return {
                [concatKey]:
                  prop +
                  " array must include valid Javascript Type Functions (String, Number, etc...)"
              };
            }

            for (var i = 0; i < value.length; i++) {
              const type = value[i];

              if (typeof type !== "function") {
                return {
                  [concatKey]:
                    prop +
                    " array can only include valid Javascript Type Functions (String, Number, etc...)"
                };
              }
            }
          } else {
            return {
              [concatKey]:
                prop +
                " must be a valid Javascript Type Function (String, Number, etc...) or an Array of Javascript Type Functions"
            };
          }
        }
        break;
      case "defaultValue":
        // Check if defaultValue is null or undefined
        if (typeof value === "undefined" || value === null) {
          return { [concatKey]: prop + " must not be null or undefined" };
        }

        // Make sure default value aligns with type in <type> property
        // **************************************************
        if (Array.isArray(propSchema.type)) {
          let doesMatch = false;

          for (var i = 0; i < propSchema.type.length; i++) {
            const type = propSchema.type[i];
            const typeString = propSchema.type
              .map(type => type.name)
              .join(", ");

            // Check if defaultValue is not match type
            if (type === String || type === Number || type === Boolean) {
              if (value === type(value)) {
                doesMatch = true;
                break;
              }
            } else {
              if (value instanceof type) {
                doesMatch = true;
                break;
              }
            }
          }

          if (!doesMatch) {
            return {
              [concatKey]: prop + " must be of types " + typeString
            };
          }
        } else {
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
        }

        // Make sure default value aligns with type in <arrayType> property
        // **************************************************
        if (typeof propSchema.arrayType !== "undefined") {
          for (var j = 0; j < value.length; j++) {
            const defValue = value[j];
            console.log(defValue);

            if (Array.isArray(propSchema.arrayType)) {
              let doesMatch = false;
              const typeString = propSchema.arrayType
                .map(type => type.name)
                .join(", ");

              for (var k = 0; k < propSchema.arrayType.length; k++) {
                const currType = propSchema.arrayType[k];

                if (
                  currType === String ||
                  currType === Number ||
                  currType === Boolean
                ) {
                  if (defValue === currType(defValue)) {
                    doesMatch = true;
                    break;
                  }
                } else {
                  if (defValue instanceof currType) {
                    doesMatch = true;
                    break;
                  }
                }
              }

              if (!doesMatch) {
                return {
                  [concatKey]:
                    concatKey + " defaultValue array children must be of types " + typeString
                };
              }
            } else {
              // Check if defaultValue is not match type
              if (
                propSchema.arrayType === String ||
                propSchema.arrayType === Number ||
                propSchema.arrayType === Boolean
              ) {
                if (defValue !== propSchema.arrayType(defValue)) {
                  return {
                    [concatKey]:
                      prop +
                      " array children must be of type " +
                      propSchema.arrayType.name
                  };
                }
              } else {
                if (!(defValue instanceof propSchema.arrayType)) {
                  return {
                    [concatKey]:
                      prop +
                      " array children must be of type " +
                      propSchema.arrayType.name
                  };
                }
              }
            }
          }
        }
        break;
      case "required":
        // Check if required is vaild boolean
        if (value !== true && value !== false) {
          return { [concatKey]: prop + " must be a boolean value" };
        }
        break;
      case "trim":
        if (propSchema.type !== String) {
          return {
            [concatKey]: "Can only apply " + prop + " to type <String>"
          };
        }

        // Check if trim is vaild boolean
        if (value !== true && value !== false) {
          return { [concatKey]: prop + " must be a boolean value" };
        }
        break;
      case "minLength":
        if (propSchema.type !== String && propSchema.type !== Array) {
          return {
            [concatKey]:
              "Can only apply " + prop + " to type <String> and <Array>"
          };
        }

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
        if (propSchema.type !== String && propSchema.type !== Array) {
          return {
            [concatKey]:
              "Can only apply " + prop + " to type <String> and <Array>"
          };
        }

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
        if (propSchema.type !== Number) {
          return {
            [concatKey]: "Can only apply " + prop + " to type <Number>"
          };
        }

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
        if (propSchema.type !== Number) {
          return {
            [concatKey]: "Can only apply " + prop + " to type <Number>"
          };
        }

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
        if (propSchema.type !== Array) {
          return {
            [concatKey]: "Can only apply " + prop + " to type <Array>"
          };
        }

        // Check if arrayType is a valid javascript type function or Array of javascript type functions
        if (typeof value !== "function" && !Array.isArray(value)) {
          return {
            [concatKey]:
              prop +
              " must be a valid Javascript Type Function (String, Number, etc...) or an array of Javascript Type Functions"
          };
        }

        // Check if arrayType is array of javascript type functions
        if (Array.isArray(value)) {
          if (value.length === 0) {
            return {
              [concatKey]:
                prop +
                " array must include valid Javascript Type Functions (String, Number, etc...)"
            };
          }

          for (var i = 0; i < value.length; i++) {
            const type = value[i];

            if (typeof type !== "function") {
              return {
                [concatKey]:
                  prop +
                  " array can only include valid Javascript Type Functions (String, Number, etc...)"
              };
            }
          }
        }
        break;
      case "isNumeric":
        if (propSchema.type !== String) {
          return {
            [concatKey]: "Can only apply " + prop + " to type <String>"
          };
        }

        // Check if isNumeric is a boolean
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
