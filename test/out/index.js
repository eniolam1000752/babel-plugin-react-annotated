import React, { Fragment } from "react";

const testComponent = () => {
  const [__state1, SET__state1] = React.useState(3),
        [__state2, SET__state2] = React.useState({}),
        [__state3, SET__state3] = React.useState([]),
        [__status, SET__status] = React.useState(false);
  const [__testState, SET__testState] = React.useState({
    data: "eniola"
  });
  let var1 = {};
  var _value = "string";
  return React.createElement(React.Fragment, null, React.createElement("div", null, React.createElement("div", null, __state2), React.createElement("div", {
    onMouseDown: () => SET__state3(_RN_6824531 => {
      ++_RN_6824531;
      return _RN_6824531;
    })
  }, __state3), React.createElement("div", {
    onClick: () => {
      // __testState = 3;
      // __testState.data = __state2[
      //   "eniola"
      // ] = __state1 = val1.data[0] = val2[0] = value.person.name[0] = val[0]++;
      SET__state3(_RN_6824531 => {
        _RN_6824531[0].number = ++state3;
        return _RN_6824531;
      });
      SET__state3(_RN_021628659 => {
        _RN_021628659 = "r";
        SET__state2(_RN_9460409 => {
          _RN_9460409 = _RN_021628659;
          return _RN_9460409;
        });
        return _RN_021628659;
      });
    }
  }, __state2 + " : " + __state3)));
};