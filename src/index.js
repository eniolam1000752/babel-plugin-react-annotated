import React, { Fragment } from "react";

const testComponent = () => {
  //@state
  const __state1 = 3,
    __state2 = {},
    __state3 = [],
    __status = false;
  //@state
  const __testState = { data: "eniola" };
  let var1 = {};
  var _value = "string";

  return (
    <React.Fragment>
      <div>{__state2}</div>
      <div onMouseDown={() => ++__state3}>{__state3}</div>
      <div
        onClick={() => {
          __testState = 3;
          __testState.data = __state2["eniola"] = __state1 = val++;
          __state3[0].number = 8;
        }}
      >
        {__status}, {__testState.data},{__state3[6]}
      </div>
    </React.Fragment>
  );
};
