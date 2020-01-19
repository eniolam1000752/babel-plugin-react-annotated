import React, { Fragment } from "react";

const useTestComponent = () => {
  // @state
  const [{
    __state1
  }, SET__state1] = React.useState({
    __state1: 3
  }),
        [{
    __state2
  }, SET__state2] = React.useState({
    __state2: {}
  }),
        [{
    __state3
  }, SET__state3] = React.useState({
    __state3: []
  }),
        [{
    __status
  }, SET__status] = React.useState({
    __status: false
  });
  const [{
    __testState
  }, SET__testState] = React.useState({
    __testState: {
      data: "eniola"
    }
  });
  let var1 = {};
  var _value = "string";
  return React.createElement(React.Fragment, null, React.createElement("div", null, React.createElement("div", null, __state2), React.createElement("div", {
    onMouseDown: () => SET__state3(_RN_9045517 => {
      ++_RN_9045517;
      return _RN_9045517;
    })
  }, __state3), React.createElement("div", {
    onClick: () => {
      // __testState = 3;
      // __testState.data = __state2[
      //   "eniola"
      // ] = __state1 = val1.data[0] = val2[0] = value.person.name[0] = val[0]++;
      // __state3[0].number = ++__state3;
      SET__state1(_RN_44538737 => {
        _RN_44538737.__state1 = __state2 + 1;
        SET__state3(_RN_5497159 => {
          _RN_5497159.__state3.data = _RN_44538737;
          return _RN_5497159;
        });
        return _RN_44538737;
      }); // __state2 = ++__state1;
    }
  }, __state2 + " : " + __state3)));
};