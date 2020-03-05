import reservedSchemaProps from "./reservedSchemaProps.js";
import validateSchema from "./validateSchema.js";
import validateCreateDocument from "./validateCreateDocument.js";
import isObject from "./isObject.js";

// Modeler Class Function
class Modeler {
  errors = {};

  /**
   * Function to traverse and validate all properties of given schema then return the schema
   * @param {object} schema
   */
  ValidateSchema(schema) {
    return validateSchema(schema);
  }

  /**
   * Function to traverse and validate all properties of given document against
   * corresponding schema and return document
   * @param {object} doc The document/object to be compared against the given schema for validation
   * @param {object} schema A schema that has been traversed and validated by the Modeler class
   */
  ValidateCreateDocument(doc, schema) {
    return validateCreateDocument(doc, schema);
  }

  // /**
  //  * Function to traverse and validate all properties of given document against
  //  * corresponding schema and return document
  //  * @param {object} doc The document/object to be compared against the given schema for validation
  //  * @param {object} schema A schema that has been traversed and validated by the Modeler class
  //  */
  // ValidateModelPUT(doc, schema) {
  //   let returnedErrors = {};
  //   let returnedDocument = {};

  //   // Check if Document is an object literal and is not empty
  //   if (!isObject(doc, false)) {
  //     returnedErrors.invalidDoc =
  //       "Document must be an object literal with at least one key-value pair";
  //   } else if (Object.keys(doc).length === 0) {
  //     returnedErrors.emptyDoc = "Document must not be an empty object";
  //   }

  //   // Check if Schema is an object literal and is not empty
  //   if (!isObject(schema, false)) {
  //     returnedErrors.invalidSchema =
  //       "Schema must be an object literal with at least one key-value pair";
  //   } else if (Object.keys(schema).length === 0) {
  //     returnedErrors.emptySchema = "Schema must not be an empty object";
  //   }

  //   // FUNCTION TO TRAVRSE ALL NODES OF OBJECT
  //   const traverse = (object, prevKey) => {
  //     for (var key in object) {
  //       let concatKey = key;
  //       const shouldStopNesting = isAtDepth(object[key], true);

  //       if (prevKey) {
  //         concatKey = prevKey + "." + key;
  //       }

  //       if (shouldStopNesting) {
  //         // VALIDATE EACH KEY VALUE ****************************
  //         // - Call validateModelPOST() function for each document property
  //         // ****************************************************
  //         const { error, returnedProp } = validateModelPOST(
  //           key,
  //           concatKey,
  //           object,
  //           doc
  //         );

  //         returnedErrors = {
  //           ...returnedErrors,
  //           ...error
  //         };
  //         returnedDocument = {
  //           ...returnedDocument,
  //           ...returnedProp
  //         };
  //       } else {
  //         // Go one step down in the object tree if object is found!
  //         traverse(object[key], concatKey);
  //       }
  //     }
  //   };

  //   console.log("-------------- BEG: DOCUMENT PROPS/ERRORS --------------");
  //   traverse(schema, null);
  //   console.log("-------------- END: DOCUMENT PROPS/ERRORS --------------");

  //   // Check to make sure there were no errors
  //   if (Object.keys(returnedErrors).length > 0) {
  //     console.log("[DOCUMENT ERRORS] -> ", returnedErrors);
  //     throw new Error("[ERROR]: Invalid Document");
  //   }

  //   return returnedDocument;
  // }
}

export default Modeler;
