import reservedSchemaProps from "./reservedSchemaProps.js";
import validateSchema from "./validateSchema.js";
import validateCreateDocument from "./validateCreateDocument.js";
import validateUpdateDocument from "./validateUpdateDocument.js";
import isObject from "./isObject.js";

// Modeler Class Function
class Modeler {
  schema = {};

  /**
   * Function to traverse and validate all properties of given schema then return the schema
   * @param {object} schema
   */
  ValidateSchema(schema) {
    const validateSchemaData = validateSchema(schema);

    if (Object.keys(validateSchemaData.errors).length === 0) {
      this.schema = validateSchemaData.schema;
    }

    return validateSchemaData;
  }

  /**
   * Function to (Create new document in collection) traverse and validate all properties of given document against corresponding schema and return document
   * @param {object} doc The document/object to be compared against the given schema for validation
   * @param {object} schema A schema that has been traversed and validated by the Modeler class
   */
  ValidateCreateDocument(doc, schema) {
    // Check if schema passed in has been validated by Modeler. If not, return errors and set doc to null to it cant be inserted.
    if (this.schema !== schema) {
      const errors = {
        invalidSchema: "Passed in schema has not been validated."
      };

      return { errors, doc: null };
    }

    // Call validation method for CreateDocument
    const validateCreateDocData = validateCreateDocument(doc, schema);

    return validateCreateDocData;
  }

  /**
   * Function to (Update existing document in collection) traverse and validate all properties of given document against corresponding schema and return document
   * @param {object} doc The document/object to be compared against the given schema for validation
   * @param {object} schema A schema that has been traversed and validated by the Modeler class
   */
  ValidateUpdateDocument(doc, schema) {
    // Check if schema passed in has been validated by Modeler. If not, return errors and set doc to null to it cant be inserted.
    if (this.schema !== schema) {
      const errors = {
        invalidSchema: "Passed in schema has not been validated."
      };

      return { errors, doc: null };
    }

    // Call validation method for UpdateDocument
    const validateUpdateDocData = validateUpdateDocument(doc, schema);

    return validateUpdateDocData;
  }
}

export default Modeler;
