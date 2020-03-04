import React, { Component } from "react";
import { render } from "react-dom";
import Hello from "./Hello";
import "./style.css";
import Modeler from "./modeler.js";

const profileSchema = {
  avatar: { type: String, defaultValue: "", required: false, trim: true },
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
    type: String,
    defaultValue: "",
    required: false,
    trim: true,
    isNumeric: true,
    minLength: 4,
    maxLength: 4
  },
  personalAddress: {
    street: { type: String, defaultValue: "", required: false, trim: true },
    city: { type: String, defaultValue: "", required: false, trim: true },
    county: { type: String, defaultValue: "", required: false, trim: true },
    state: { type: String, defaultValue: "", required: false, trim: true },
    zipCode: { type: String, defaultValue: "", required: false, trim: true },
    districtIds: {
      type: Array,
      defaultValue: [],
      required: false,
      minLength: 0,
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

const profileDoc = {
  avatar: "http://www.cloudinary.com/",
  birthMonth: "01",
  birthDay: "18",
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
    street: "Greacen point Lane",
    city: "Mamaroneck",
    county: "Westchester",
    state: "New York",
    zipCode: "10543",
    districtId: "544"
  }
};

class App extends Component {
  render() {
    // VALIDATE SCHEMA
    const modeler = new Modeler();
    const schema = modeler.ValidateSchema(profileSchema);

    // VALIDATE MODEL
    const model = modeler.ValidateModel(profileDoc, schema, 'POST');

    console.log("[SCHEMA]: ", schema);
    console.log("[MODEL]: ", model);

    return (
      <div>
        <p>{}</p>
      </div>
    );
  }
}

render(<App />, document.getElementById("root"));
