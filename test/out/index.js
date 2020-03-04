import React, { Fragment } from "react";

const useTestComponent = () => {
  // @state
  const [{
    __state1
  }, SET__state1] = React.useState({
    __state1: {
      val: 3
    }
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
  }); // const __testState = { data: "eniola" };

  //@state
  let var1 = {};
  var _value = "string";
  return React.createElement(React.Fragment, null, React.createElement("div", null, React.createElement("div", null, __state2), React.createElement("div", {
    onMouseDown: () => {// __state1 = ++__state3.value[0];
      // ++__state1.val;
    }
  }, __state3), React.createElement("div", {
    onClick: async () => {
      // __testState = 3;
      // __testState.data = __state2[
      //   "eniola"
      // ] = __state1 = val1.data[0] = val2[0] = value.person.name[0] = val[0]++;
      // __state3[0].number = ++__state3;
      // __state3 = ++__state1.val; // /*  __state3.eni[0] = */ = __state3 = ++__state2.key;
      //@depend(__state3)
      await (() => {
        SET__state2(_RN_8092307 => {
          _RN_8092307 = Object.assign({}, _RN_8092307);
          _RN_8092307.__state2 = __state3;
          return _RN_8092307;
        });
      })(); // __state3 = __state2.key;
      // __state2 = ++__state1;
    }
  }, __state2 + " : " + __state3)));
};