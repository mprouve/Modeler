import React, { Component } from "react";
import { render } from "react-dom";
import Hello from "./Hello";
import "./style.css";
import MongoValidator from "./mongo-validator.js";

const profileSchema = {
  avatar: { type: String, defaultValue: "", required: false, trim: true },
  email: {
    type: String,
    defaultValue: "",
    required: false,
    trim: true,
    toLowerCase: true
  },
  numVotes: { type: Number, defaultValue: 0, readOnly: true },
  valFnTest: {
    type: String,
    defaultValue: "",
    validationFn: value => {
      if (value === "hello1") {
        return true;
      }

      return false;
    }
  },
  birthMonth: {
    type: String,
    defaultValue: "",
    required: false,
    trim: true,
    minLength: 2,
    maxLength: 2
  },
  birthDay: {
    type: String,
    defaultValue: "",
    required: false,
    trim: true,
    minLength: 2,
    maxLength: 2
  },
  birthYear: {
    type: [Array, String],
    defaultValue: "",
    required: false
  },
  personalAddress: {
    street: { type: String, defaultValue: "", required: false, trim: true },
    city: { type: String, defaultValue: "", required: false, trim: true },
    county: { type: String, defaultValue: "", required: false, trim: true },
    state: { type: String, defaultValue: "", required: false, trim: true },
    zipCode: {
      type: String,
      defaultValue: "",
      trim: true,
      regex: /(^\d{5}$)|(^\d{5}-\d{4}$)/
    },
    districtIds: {
      type: Array,
      defaultValue: [],
      required: false,
      arrayType: String
    }
  },
  officeAddress: {
    street: { type: String, defaultValue: "", required: false, trim: true },
    city: { type: String, defaultValue: "", required: false, trim: true },
    county: { type: String, defaultValue: "", required: false, trim: true },
    state: { type: String, defaultValue: "", required: false, trim: true },
    zipCode: { type: String, defaultValue: "", required: false, trim: true },
    districtId: {
      type: String,
      defaultValue: "",
      required: false,
      trim: true,
      isNumeric: true
    }
  }
};

const profileDocCreate = {
  avatar: "       http://www.cloudinary.com/     ",
  email: "       prouve.MaRCO@gmail.Com      ",
  // numVotes: 0,
  valFnTest: "",
  birthMonth: "02",
  birthDay: "16",
  birthYear: "1993",
  personalAddress: {
    street: "53rd St. and 2nd Ave.",
    city: "New York",
    county: "New York",
    state: "New York",
    zipCode: "10010",
    districtIds: ["544"]
  },
  officeAddress: {
    street: "lakjd",
    city: "Mamaroneck",
    county: "Westchester",
    state: "New York",
    zipCode: "10543",
    districtId: null
  }
};

const profileDocUpdate = {
  avatar: "       http://www.cloudinary.com/     ",
  email: "       prouve.MaRCO@gmail.Com      ",
  // numVotes: 0,
  valFnTest: "hello1",
  birthMonth: "02",
  birthDay: "16",
  personalAddress: {
    street: "53rd St. and 2nd Ave.",
    city: "New York",
    county: "New York",
    state: "New York",
    districtIds: ["544"]
  },
  officeAddress: {
    street: "lakjd",
    city: "Mamaroneck",
    county: "Westchester",
    state: "New York",
    zipCode: "10543"
  }
};

class App extends Component {
  render() {
    // REGEXP EXAMPLE
    // /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/

    // Create Modeler Instance
    const mongoValidator = new MongoValidator();

    // VALIDATE SCHEMA
    const schemaData = mongoValidator.ValidateSchema(profileSchema);
    // CREATE DOCUMENT
    const createDocData = mongoValidator.ValidateCreateDocument(
      profileDocCreate
    );
    // UPDATE DOCUMENT
    const updateDocData = mongoValidator.ValidateUpdateDocument(
      profileDocUpdate
    );

    console.log("[SCHEMA ERRORS]: ", schemaData.errors);
    console.log("[CREATE DOC ERRORS]: ", createDocData.errors);
    console.log("[UPDATE DOC ERRORS]: ", updateDocData.errors);
    console.log("[SCHEMA]: ", mongoValidator.schema);
    console.log("[CREATED DOCUMENT]: ", createDocData.doc);
    console.log("[UPDATED DOCUMENT]: ", updateDocData.doc);

    return (
      <div>
        <p>{}</p>
      </div>
    );
  }
}

render(<App />, document.getElementById("root"));
