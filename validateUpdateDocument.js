import isObject from "./isObject.js";
import isAtMaxDepth from "./isAtMaxDepth.js";

/**
 * Function called by the class method to (Update an existing document ina collection) traverse and validate 1) the schema to make sure all properties found in the document pass type checking and 2) the document itself to make sure there are no properties that don't exists in the schema passed in.
 * @param {object} doc The document for which the schema is used to type check every property traversed
 * @param {object} schema Teh schema used to validate the document passed in.
 */
const validateUpdateDocument = (doc, schema) => {
  let errors = {};
  let returnedDoc = {};
  let stopAll = false;

  // Check if Document is an object literal and is not empty
  if (!isObject(doc, false)) {
    errors.invalidDoc =
      "Document must be an object literal with at least one key-value pair";
  } else if (Object.keys(doc).length === 0) {
    errors.emptyDoc = "Document must not be an empty object";
  }

  // STEP 1: MAKE SURE THERE ARE NO PROPERTIES IN DOCUMENT THAT DONT EXIST IN SCHEMA AND TYPE CHECK VALUES
  // Function to traverse all nodes of document
  const traverseDocument = (object, prevKey) => {
    for (var key in object) {
      if (stopAll) break;

      let concatKey = key;
      const value = object[key];
      const shouldStopNesting = isAtMaxDepth(value);

      if (prevKey) {
        concatKey = prevKey + "." + key;
      }

      // Check if any property while traversing is not found in schema
      var propSchema = concatKey.split(".").reduce((obj, prop) => {
        return obj[prop];
      }, schema);

      if (typeof propSchema === "undefined" || propSchema === null) {
        errors = {
          ...errors,
          [concatKey]: concatKey + " is not recognized by schema"
        };

        stopAll = true;
        break;
      }

      if (shouldStopNesting) {
        // VALIDATE EACH KEY VALUE - Call validateDocumentProp() function for each schema property
        const { error, newPropValue } = validateDocumentProp(
          propSchema,
          value,
          concatKey
        );

        // Append any errors and break
        if (Object.keys(error).length > 0) {
          errors = {
            ...errors,
            ...error
          };

          stopAll = true;
          break;
        }

        // Set value returned from validation into returned document variable (for setting defaultValues)
        if (typeof newPropValue !== "undefined") {
          returnedDoc[concatKey] = newPropValue;
        }
      } else {
        // Go one step down in the object tree if object is found!
        traverseDocument(value, concatKey);
      }
    }
  };

  console.log("---------- BEG: UPDATE DOCUMENT PROPS ----------");
  traverseDocument(doc, null); // Make sure no document properties are absent in schema
  console.log("---------- END: UPDATE DOCUMENT PROPS ----------");

  // Check to make sure there were no errors
  if (Object.keys(errors).length > 0) {
    console.log("[UPDATE DOCUMENT ERRORS] -> ", errors);
    // throw new Error("[ERROR]: Invalid Document for UPDATE");

    return { doc: null, errors };
  }

  // Append whenModified: Date.now() to returned Document
  return { doc: returnedDoc, errors };
};

/**
 * Function to type check an individual document property against the passed in property schema
 * @param {object} propSchema The property schema totype-check and validate the document property value
 * @param {object} propValue The value of the document property denoted by the concat key string (path)
 * @param {string} concatKey The string representing the path of the property schema
 */
const validateDocumentProp = (propSchema, propValue, concatKey) => {
  let error = {};
  let newPropValue = propValue;
  const isUndefined =
    typeof newPropValue === "undefined" || newPropValue === null;

  console.log(`${concatKey} -->`, propValue)

  // **********************************************************
  // Take care of readOnly fields right away!!
  // **********************************************************
  if (propSchema.readOnly === true) {
    error[concatKey] = "Write not allowed - " + concatKey + " is readOnly";
    return { error };
  }

  // **********************************************************
  // Take care of undefined or null props right away!!
  // **********************************************************
  if (isUndefined) {
    error[concatKey] = concatKey + " cannot be null or undefined";
    return { error };
  }

  // **********************************************************
  // Take care of defaultValue prop right away!!
  // **********************************************************
  if (typeof propSchema.defaultValue !== "undefined") {
    if (propSchema.defaultValue === newPropValue) {
      // Return default value now since all other schema props dont apply to values set by defaultValue
      return { error, newPropValue };
    }
  }

  // **********************************************************
  // Take care of type prop right away!!
  // If type is an Array of types, check each index
  // **********************************************************
  if (propSchema.type instanceof Array) {
    let doesMatch = false;
    let typeString = "";

    for (var i = 0; i < propSchema.type.length; i++) {
      const type = propSchema.type[i];
      typeString += i === 0 ? type.name : ", " + type.name;
      if (type === String || type === Number || type === Boolean) {
        if (newPropValue === type(newPropValue)) {
          doesMatch = true;
          break;
        }
      } else {
        if (newPropValue instanceof type) {
          doesMatch = true;
          break;
        }
      }
    }

    if (!doesMatch) {
      error[concatKey] = "Must be of types " + typeString;
      return { error };
    }
  } else {
    if (
      propSchema.type === String ||
      propSchema.type === Number ||
      propSchema.type === Boolean
    ) {
      if (newPropValue !== propSchema.type(newPropValue)) {
        error[concatKey] = "Must be of type " + propSchema.type.name;
        return { error };
      }
    } else {
      if (!(newPropValue instanceof propSchema.type)) {
        error[concatKey] = "Must be of type " + propSchema.type.name;
        return { error };
      }
    }
  }

  // Loop through given propSchema keys
  for (var prop in propSchema) {
    const schemaValue = propSchema[prop];

    switch (prop) {
      // TYPE CASE IS TAKEN CARE OF ABOVE
      case "type":
        break;
      // IGNORE CASE FOR UPDATE DOCUMENT
      case "defaultValue":
        break;
      // IGNORE CASE FOR UPDATE DOCUMENT
      case "required":
        break;
      // READONLY CASE IS TAKEN CARE OF ABOVE
      case "readOnly":
        break;
      case "trim":
        if (schemaValue === true) {
          newPropValue = newPropValue.trim();
        }
        break;
      case "toLowerCase":
        if (schemaValue === true) {
          newPropValue = newPropValue.toLowerCase();
        }
        break;
      case "minLength":
        if (newPropValue.length < schemaValue) {
          error[concatKey] =
            concatKey + " length must be at least " + schemaValue;
          return { error };
        }
        break;
      case "maxLength":
        if (newPropValue.length > schemaValue) {
          error[concatKey] =
            concatKey + " length must be at most " + schemaValue;
          return { error };
        }
        break;
      case "minValue":
        if (newPropValue < schemaValue) {
          error[concatKey] =
            concatKey + " must be greater than or equal to " + schemaValue;
          return { error };
        }
        break;
      case "maxValue":
        if (newPropValue > schemaValue) {
          error[concatKey] =
            concatKey + " must be less than or equal to " + schemaValue;
          return { error };
        }
        break;
      case "regex":
        if (!schemaValue.test(newPropValue)) {
          error[concatKey] = concatKey + " does not pass regex test";
          return { error };
        }
        break;
      case "arrayType":
        for (var i = 0; i < newPropValue.length; i++) {
          const val = newPropValue[i];

          if (schemaValue instanceof Array) {
            let doesMatch = false;
            const typeString = schemaValue.map(value => value.name).join(", ");

            for (var j = 0; j < schemaValue.length; j++) {
              const type = schemaValue[j];

              if (type === String || type === Number || type === Boolean) {
                if (val === type(val)) {
                  doesMatch = true;
                  break;
                }
              } else {
                if (val instanceof type) {
                  doesMatch = true;
                  break;
                }
              }
            }

            if (!doesMatch) {
              error[concatKey] =
                concatKey + " array children must be of types " + typeString;
              return { error };
            }
          } else {
            if (
              schemaValue === String ||
              schemaValue === Number ||
              schemaValue === Boolean
            ) {
              if (val !== schemaValue(val)) {
                error[concatKey] = "Array children must be of type " + schemaValue.name;
                return { error };
              }
            } else {
              if (!(val instanceof schemaValue)) {
                error[concatKey] = "Array children must be of type " + schemaValue.name;
                return { error };
              }
            }
          }
        }
        break;
      case "isNumeric":
        if (isNaN(newPropValue)) {
          error[concatKey] = concatKey + " must be a numeric string";
          return { error };
        }
        break;
      case "validationFn":
        let result;

        try {
          result = schemaValue(newPropValue);
        } catch {
          result = false;
        }

        if (result !== true) {
          error[concatKey] = concatKey + " did not pass validation function.";
          return { error };
        }
        break;
      default:
        // Catch any unrecognized schema prop values
        error[concatKey] =
          concatKey + " contains unknown schema key (" + prop + ")";
        return { error };
    }
  }

  return { error, newPropValue };
};

export default validateUpdateDocument;
