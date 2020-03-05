import reservedSchemaProps from "./reservedSchemaProps.js";
import validatePropSchema from "./validatePropSchema.js";
import validateModelPOST from "./validateModelPOST.js";
import isObject from "./isObject.js";

// Modeler Class Function
class Modeler {
  schema = {};
  document = {};
  errors = {};

  // FUNCTION TO TRAVERSE ALL NODES OF OBJECT
  traverseSchema = (object, prevKey, validationFunction, crudOp) => {
    for (var key in object) {
      let concatKey = key;
      const shouldStopNesting = isAtDepth(object[key]);

      if (prevKey) {
        concatKey = prevKey + "." + key;
      }

      if (crudOp === "POST") {
        var valueInDoc = concatKey.split(".").reduce((obj, prop) => {
          return obj[prop];
        }, this.document);

        if (typeof valueInDoc === "undefined") {
          this.errors = {
            ...this.errors,
            [concatKey]: concatKey + " is a required property"
          };

          break
        }

        console.log(`${concatKey} --> `, valueInDoc);
      }

      if (shouldStopNesting) {
        // VALIDATE EACH KEY VALUE ****************************
        // - Call validatePropSchema() function for each schema property
        // ****************************************************
        this.errors = {
          ...this.errors,
          ...validationFunction(object, key, concatKey, {
            doc: this.document,
            schema: this.schema
          })
        };
      } else {
        // Go one step down in the object tree if object is found!
        this.traverseSchema(object[key], concatKey, validationFunction, crudOp);
      }
    }
  };

  /**
   * Function to traverse and validate all properties of given schema then return the schema
   * @param {object} schema
   */
  ValidateSchema(schema) {
    this.schema = schema;

    // Check if Schema is an object literal and is not empty
    if (!isObject(schema, false)) {
      this.errors.invalidSchema =
        "Schema must be an object literal with at least one key-value pair";
    } else if (Object.keys(schema).length === 0) {
      this.errors.emptySchema = "Schema must not be an empty object";
    }

    console.log("-------------- BEG: SCHEMA PROPS/ERRORS --------------");
    this.traverseSchema(schema, null, validatePropSchema);
    console.log("-------------- END: SCHEMA PROPS/ERRORS --------------");

    // Check to make sure there were no errors
    if (Object.keys(this.errors).length > 0) {
      console.log("[SCHEMA ERRORS] -> ", this.errors);
      throw new Error("[ERROR]: Invalid Schema");
    }

    return schema;
  }

  /**
   * Function to traverse and validate all properties of given document against
   * corresponding schema and return document
   * @param {object} doc The document/object to be compared against the given schema for validation
   * @param {object} schema A schema that has been traversed and validated by the Modeler class
   */
  ValidateModelPOST(doc, schema) {
    this.schema = schema;
    this.document = doc;

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

    console.log("-------------- BEG: DOCUMENT PROPS/ERRORS --------------");
    this.traverseSchema(schema, null, validateModelPOST, "POST");
    console.log("-------------- END: DOCUMENT PROPS/ERRORS --------------");

    // Check to make sure there were no errors
    if (Object.keys(this.errors).length > 0) {
      console.log("[DOCUMENT ERRORS] -> ", this.errors);
      throw new Error("[ERROR]: Invalid Document");
    }

    return doc;
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

/**
 * Function to determine if current key-value is at deepest of (un)nested object
 * @param {any} value The value passed in for testing if there is a nested object with contents
 * @param {boolean} isSchema Variable to tell function whether to search through schemaProps to see if
 * value is at deepest part of (un)nested object
 */
const isAtDepth = value => {
  if (!isObject(value, false)) return true;
  if (isObject(value, false) && doesContainSchemaProps(value)) return true;
  if (isObject(value, false) && Object.keys(value).length === 0) return true;

  return false;
};

/**
 * Function to determine if object consists of keys found in schemaProps Array
 * @param {object} obj The object whose contents we need to check
 */
const doesContainSchemaProps = obj => {
  const keys = Object.keys(obj);

  for (var i = 0; i < keys.length; i++) {
    const key = keys[i];

    if (reservedSchemaProps.indexOf(key) > -1) {
      return true;
    }
  }

  return false;
};

export default Modeler;
