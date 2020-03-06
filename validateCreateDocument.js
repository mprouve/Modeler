import isObject from "./isObject.js";
import isAtMaxDepth from "./isAtMaxDepth.js";
import setNestedPropFromString from "./setNestedPropFromString.js";

const validateCreateDocument = (doc, schema) => {
  let errors = {};
  let stopAll = false;

  // Check if Document is an object literal and is not empty
  if (!isObject(doc, false)) {
    errors.invalidDoc =
      "Document must be an object literal with at least one key-value pair";
  } else if (Object.keys(doc).length === 0) {
    errors.emptyDoc = "Document must not be an empty object";
  }

  // Create new document variable to hold document with inserted defaultValues if neccessary
  let returnedDoc = { ...doc };

  // STEP 1: MAKE SURE ALL PROPERTIES IN SCHEMA EXIST IN DOCUMENT
  // Function to traverse all nodes of schema
  const traverseSchema = (object, prevKey) => {
    for (var key in object) {
      if (stopAll) break;

      let concatKey = key;
      const value = object[key]; // Represent value of current key in object
      const shouldStopNesting = isAtMaxDepth(value);

      if (prevKey) {
        concatKey = prevKey + "." + key;
      }

      // For CREATE document *ONLY*
      // Check if any property while traversing is not found in document
      var propValue = concatKey.split(".").reduce((obj, prop) => {
        return obj[prop];
      }, returnedDoc);

      // Only return an error here if not currently at deepest part of branch and property is missing from document. Check for undefined / null values happens in validateDocumentProps (At end of branch ONLY)
      if (
        (typeof propValue === "undefined" || propValue === null) &&
        !shouldStopNesting
      ) {
        errors = {
          ...errors,
          [concatKey]: concatKey + " is a required property"
        };

        stopAll = true;
        break;
      }

      if (shouldStopNesting) {
        // VALIDATE EACH KEY VALUE - Call validateModelPOST() function for each schema property
        const { error, newPropValue } = validateDocumentProp(
          value,
          propValue,
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
          setNestedPropFromString(returnedDoc, newPropValue, concatKey);
        }
      } else {
        // Go one step down in the object tree if object is found!
        traverseSchema(value, concatKey);
      }
    }
  };

  // STEP 2: MAKE SURE THERE ARE NO PROPERTIES IN DOCUMENT THAT DONT EXIST IN SCHEMA
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

      // Check if any property while traversing is not found in document
      var propValue = concatKey.split(".").reduce((obj, prop) => {
        return obj[prop];
      }, schema);

      if (typeof propValue === "undefined" || propValue === null) {
        errors = {
          ...errors,
          [concatKey]: concatKey + " is not recognized by schema"
        };

        stopAll = true;
        break;
      }

      if (!shouldStopNesting) {
        // Go one step down in the object tree if object is found!
        traverseDocument(value, concatKey);
      }
    }
  };

  console.log("---------- BEG: CREATE DOCUMENT PROPS ----------");
  traverseSchema(schema, null); // Validate all fields in document against Schema
  traverseDocument(returnedDoc, null); // Make sure no document properties are absent in schema
  console.log("---------- END: CREATE DOCUMENT PROPS ----------");

  // Check to make sure there were no errors
  if (Object.keys(errors).length > 0) {
    console.log("[CREATE DOCUMENT ERRORS] -> ", errors);
    // throw new Error("[ERROR]: Invalid Document");

    return { doc: null, errors };
  }

  return { doc: returnedDoc, errors };
};

const validateDocumentProp = (propSchema, propValue, concatKey) => {
  let error = {};
  let newPropValue = propValue;
  const isUndefined =
    typeof newPropValue === "undefined" || newPropValue === null;

  console.log(`${concatKey} -->`, propValue);

  // **********************************************************
  // Take care of required and defaultValue props right away!!
  // **********************************************************
  if (isUndefined) {
    if (propSchema.required === true) {
      error[concatKey] = concatKey + " property is required";
      return { error };
    }

    // set propValue to default Value
    newPropValue = propSchema.defaultValue;

    // Return default value now since all other schema props dont apply to values set by defaultValue
    return { error, newPropValue };
  }

  // **********************************************************
  // Take care of type prop right away!!
  // **********************************************************
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

  // Loop through given propSchema keys
  for (var prop in propSchema) {
    const schemaValue = propSchema[prop];

    switch (prop) {
      // TYPE CASE IS TAKEN CARE OF ABOVE
      case "type":
        break;
      // DEFAULT VALUE CASE IS TAKEN CARE OF ABOVE
      case "defaultValue":
        break;
      // REQUIRED CASE IS TAKEN CARE OF ABOVE
      case "required":
        break;
      case "trim":
        if (schemaValue === true) {
          newPropValue = newPropValue.trim();
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
          if (
            propSchema.arrayType === String ||
            propSchema.arrayType === Number ||
            propSchema.arrayType === Boolean
          ) {
            if (newPropValue[i] !== schemaValue(newPropValue[i])) {
              error[concatKey] =
                concatKey +
                " array children must be of type " +
                schemaValue.name;
              return { error };
            }
          } else {
            if (!(newPropValue[i] instanceof schemaValue(newPropValue[i]))) {
              error[concatKey] =
                concatKey +
                " array children must be of type " +
                schemaValue.name;
              return { error };
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
      default:
        // Catch any unrecognized schema prop values
        error[concatKey] =
          concatKey + " contains unknown schema key (" + prop + ")";
        return { error };
    }
  }

  return { error, newPropValue };
};

export default validateCreateDocument;
