import React, { Fragment } from "react";

const useTestComponent = () => {
  // @state
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
      <div>
        <div>{__state2}</div>
        <div onMouseDown={() => ++__state3}>{__state3}</div>
        <div
          onClick={() => {
            // __testState = 3;
            // __testState.data = __state2[
            //   "eniola"
            // ] = __state1 = val1.data[0] = val2[0] = value.person.name[0] = val[0]++;
            // __state3[0].number = ++__state3;
            __state3.data = __state1 = __state2 + 1;
            // __state2 = ++__state1;
          }}
        >
          {/* {__status}, {__testState.data},{__state3[6]} */}
          {__state2 + " : " + __state3}
        </div>
      </div>
    </React.Fragment>
  );
};
