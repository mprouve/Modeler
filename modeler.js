import reservedSchemaProps from "./reservedSchemaProps.js";
import validatePropertySchema from "./validatePropertySchema.js";
import validateModelPOST from "./validateModelPOST.js";
import isObject from "./isObject.js";

// Modeler Class Function
class Modeler {
  constructor() {}

  /**
   * Function to traverse and validate all properties of given schema then return the schema
   * @param {object} schema
   */
  ValidateSchema(schema) {
    let returnedErrors = {};

    // Check if Schema is an object literal and is not empty
    if (!isObject(schema, false)) {
      errors.invalidSchema =
        "Schema must be an object literal with at least one key-value pair";
    } else if (Object.keys(schema).length === 0) {
      errors.emptySchema = "Schema must not be an empty object";
    }

    // FUNCTION TO TRAVRSE ALL NODES OF OBJECT
    const traverseSchema = (object, prevKey) => {
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
          returnedErrors = {
            ...returnedErrors,
            ...validateSchema(key, concatKey, object)
          };
        } else {
          // Go one step down in the object tree if object is found!
          traverseSchema(object[key], concatKey);
        }
      }
    };

    console.log("-------------- BEG: SCHEMA PROPS/ERRORS --------------");
    traverseSchema(schema, null);
    console.log("-------------- END: SCHEMA PROPS/ERRORS --------------");

    // Check to make sure there were no errors
    if (Object.keys(returnedErrors).length > 0) {
      console.log("[SCHEMA ERRORS] -> ", returnedErrors);
      throw new Error("[ERROR]: Invalid Schema");
    }

    return schema;
  }

  /**
   * Function to traverse and validate all properties of given document against
   * corresponding schema and return document
   * @param {object} document the document/object to be compared against the given schema for validation
   * @param {object} schema a schema that has been traversed and validated by the Modeler class
   */
  ValidateModel(doc, schema, crudOp) {
    let returnedErrors = {};
    let returnedDocument = {};

    // Check if Document is an object literal and is not empty
    if (!isObject(doc, false)) {
      errors.invalidDoc =
        "Document must be an object literal with at least one key-value pair";
    } else if (Object.keys(doc).length === 0) {
      errors.emptyDoc = "Document must not be an empty object";
    }

    // Check if Schema is an object literal and is not empty
    if (!isObject(schema, false)) {
      errors.invalidSchema =
        "Schema must be an object literal with at least one key-value pair";
    } else if (Object.keys(schema).length === 0) {
      errors.emptySchema = "Schema must not be an empty object";
    }

    // Check if crudOp is equal to 'POST' or 'PUT'
    if (
      typeof crudOp !== "string" ||
      (crudOp.toLowerCase() !== "post" && crudOp.toLowerCase() !== "put")
    ) {
      errors.invalidCRUDOperation =
        "CRUD operation must be equal to 'post' or 'put' (case insensitive)";
    }

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
          // - Call validate() function for each document property
          // ****************************************************
          const { error, returnedProp } = validateModelPOST(
            key,
            concatKey,
            object,
            doc,
            crudOp
          );

          returnedErrors = {
            ...returnedErrors,
            ...error
          };
          returnedDocument = {
            ...returnedDocument,
            ...returnedProp
          };
        } else {
          // Go one step down in the object tree if object is found!
          traverse(object[key], concatKey);
        }
      }
    };

    console.log("-------------- BEG: DOCUMENT PROPS/ERRORS --------------");
    traverse(schema, null);
    console.log("-------------- END: DOCUMENT PROPS/ERRORS --------------");

    // Check to make sure there were no errors
    if (Object.keys(returnedErrors).length > 0) {
      console.log("[DOCUMENT ERRORS] -> ", returnedErrors);
      throw new Error("[ERROR]: Invalid Document");
    }

    return returnedDocument;
  }
}

const traverse = () => {};

export default Modeler;
