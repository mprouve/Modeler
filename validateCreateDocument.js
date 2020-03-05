import isObject from "./isObject.js";
import isAtMaxDepth from "./isAtMaxDepth.js";

const validateCreateDocument = (doc, schema) => {
  let errors = {};

  // Check if Document is an object literal and is not empty
  if (!isObject(doc, false)) {
    this.errors.invalidDoc =
      "Document must be an object literal with at least one key-value pair";
  } else if (Object.keys(doc).length === 0) {
    this.errors.emptyDoc = "Document must not be an empty object";
  }

  // Check if Schema is an object literal and is not empty
  if (!isObject(schema, false)) {
    this.errors.invalidSchema =
      "Schema must be an object literal with at least one key-value pair";
  } else if (Object.keys(schema).length === 0) {
    this.errors.emptySchema = "Schema must not be an empty object";
  }

  // Create new document variable to hold document with inserted defaultValues if neccessary
  let returnedDoc = { ...doc };

  // STEP 1: MAKE SURE ALL PROPERTIES IN SCHEMA EXIST IN DOCUMENT
  // Function to traverse all nodes of schema
  const traverseSchema = (object, prevKey) => {
    for (var key in object) {
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
      }, doc);

      // Only return an error here if not currently at deepest part of branch and property is missing from document. Check for undefined / null values happens in validateDocumentProps (At end of branch ONLY)
      if (
        (typeof propValue === "undefined" || propValue === null) &&
        !shouldStopNesting
      ) {
        errors = {
          ...errors,
          [concatKey]: concatKey + " is a required property"
        };

        break;
      }

      if (shouldStopNesting) {
        // VALIDATE EACH KEY VALUE - Call validateModelPOST() function for each schema property
        const errors = validateDocumentProp(value, propValue, concatKey, doc);

        this.errors = {
          ...this.errors,
          ...errors
        };
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

        break;
      }

      if (!shouldStopNesting) {
        // Go one step down in the object tree if object is found!
        traverseDocument(value, concatKey);
      }
    }
  };

  console.log("-------------- BEG: CREATE DOCUMENT PROPS --------------");
  traverseSchema(schema, null); // Validate all fields in document with Schema
  traverseDocument(doc, null); // Make sure no document properties are absent in schema
  console.log("-------------- END: CREATE DOCUMENT PROPS --------------");

  // Check to make sure there were no errors
  if (Object.keys(errors).length > 0) {
    console.log("[CREATE DOCUMENT ERRORS] -> ", errors);
    // throw new Error("[ERROR]: Invalid Document");

    return { doc: null, errors };
  }

  return { doc: returnedDoc, errors };
};

const validateDocumentProp = (propSchema, propValue, concatKey) => {
  // Check if document property value is undefined or null
  if (typeof propValue === 'undefined' || propValue === null) {
    // TODO
  }

  console.log(`${concatKey} -->`, propValue);

  // Loop through given propSchema keys
  for (var prop in propSchema) {
    const schemaValue = propSchema[prop];

    switch (prop) {
      case "type":
        // Check if String, Number, Boolean, Array, and Object type matches propValue type
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
        // TODO
        break;
      case "required":
        break;
      case "trim":
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
          [concatKey]: concatKey + " contains unknown schema key (" + prop + ")"
        };
    }
  }

  return {};
};

export default validateCreateDocument;
