import React, { Component } from "react";
import { render } from "react-dom";
import Hello from "./Hello";
import "./style.css";
import Modeler from "./modeler.js";

const profileSchema = {
  avatar: { type: String, required: true, trim: true },
  birthMonth: {
    type: String,
    required: true,
    trim: true,
    minLength: 2,
    maxLength: 2
  },
  birthDay: {
    type: String,
    required: true,
    trim: true,
    minLength: 2,
    maxLength: 2
  },
  birthYear: {
    type: String,
    required: true,
    trim: true,
    isNumeric: true,
    minLength: 4,
    maxLength: 4,
  },
  personalAddress: {
    street: { type: Object, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    county: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    districtIds: { type: Array, required: true, minLength: 0, arrayType: String }
  },
  officeAddress: {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    county: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    districtId: { type: String, required: true, trim: true, isNumeric: true }
  }
};

class App extends Component {
  render() {
    // VALIDATE SCHEMA
    const modeler = new Modeler()
    const schema = modeler.Schema(profileSchema);

    // VALIDATE MODEL
    const model = modeler.Model(
      {
        test: "test"
      },
      schema
    );

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
