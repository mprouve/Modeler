import isObject from "./isObject.js";

const reservedSchemaProps = [
  "type",
  "trim",
  "required",
  "isNumeric",
  "min",
  "max",
  "regex",
  "arrayValues"
];

const validateSchema = schema => {
  // TODO: Validate Schema Here
  let errors = {};
  let propKeyValues = []

  // FUNCTION TO TRAVRSE ALL NODES OF OBJECT
  const traverse = (object, prevKey) => {
    for (var key in object) {
      console.log(key + ": ", object[key]);

      let keyName = key;

      if (prevKey) {
        console.log(prevKey + '.' + key);
      }

      if (object[key] !== null && isObject(object[key], false)) {
        if (reservedSchemaProps.indexOf(Object.keys(object[key])[0]) > -1) {
          // TODO: Push full key separated by period if needed
        } else {
          // Go one step down in the object tree if object is found!
          traverse(object[key], keyName);
        }
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

  console.log("-------------- BEG: SCHEMA PROPS --------------");
  traverse(schema);
  console.log("-------------- END: SCHEMA PROPS --------------");

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

const Schema = schema => {
  const { errors, isValid } = validateSchema(schema);

  if (!isValid) {
    // Return failed repsonse from backend
    // return response.status(400).json({})
    console.log("[SCHEMA ERRORS] -> ", JSON.stringify(errors));
    throw new Error("[ERROR]: Invalid Schema");
  }

  return schema;
};

const Model = (document, schema) => {
  // TODO: Validate Model against Created schema
  return document;
};

const Modeler = {
  Schema,
  Model
};

export default Modeler;
