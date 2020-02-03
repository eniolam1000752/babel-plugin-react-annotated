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
  }); // const __testState = { data: "eniola" };

  //@state
  let var1 = {};
  var _value = "string";
  return React.createElement(React.Fragment, null, React.createElement("div", null, React.createElement("div", null, __state2), React.createElement("div", {
    onMouseDown: () => {
      SET__state3(_RN_38227378 => {
        _RN_38227378 = Object.assign({}, _RN_38227378);
        ++_RN_38227378.__state3.value[0];
        return _RN_38227378;
      });
      SET__state1(_RN_38227378 => {
        _RN_38227378 = Object.assign({}, _RN_38227378);
        ++_RN_38227378.__state1;
        return _RN_38227378;
      });
    }
  }, __state3), React.createElement("div", {
    onClick: () => {
      // __testState = 3;
      // __testState.data = __state2[
      //   "eniola"
      // ] = __state1 = val1.data[0] = val2[0] = value.person.name[0] = val[0]++;
      // __state3[0].number = ++__state3;
      SET__state3(_RN_3961673 => {
        _RN_3961673 = Object.assign({}, _RN_3961673);

        /*  __state3.eni[0] = */
        _RN_3961673.__state3 = (() => {
          let _var_1234 = __state2;
          SET__state2(_var_1234 => ++_var_1234.key);
          return ++_var_1234.key;
        })();

        tunde.left.leg = _RN_3961673.__state3;
        eni.leg = tunde.left.leg;
        SET__state2(_RN_2448710 => {
          _RN_2448710 = Object.assign({}, _RN_2448710);
          _RN_2448710.__state2[9] = eni.leg;
          SET__state1(_RN_8574140 => {
            _RN_8574140 = Object.assign({}, _RN_8574140);
            _RN_8574140.__state1.key[0] = _RN_2448710.__state2[9];
            return _RN_8574140;
          });
          return _RN_2448710;
        });
        return _RN_3961673;
      }); // __state3 = __state2.key;
      // __state2 = ++__state1;
    }
  }, __state2 + " : " + __state3)));
};