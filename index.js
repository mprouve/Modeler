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
    isNumeric: true,
    min: 2,
    max: 2
  },
  birthDay: {
    type: String,
    required: true,
    trim: true,
    isNumeric: true,
    min: 2,
    max: 2
  },
  birthYear: {
    type: String,
    required: true,
    trim: true,
    isNumeric: true,
    min: 4,
    max: 4
  },
  personalAddress: {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    county: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    districtIds: { type: Array, required: true, min: 0, arrayValues: String }
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
    const schema = Modeler.Schema(profileSchema);

    // VALIDATE MODEL
    const model = Modeler.Model(
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
