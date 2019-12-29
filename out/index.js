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
  return React.createElement(React.Fragment, null, React.createElement("div", null, __state2), React.createElement("div", {
    onMouseDown: () => SET__state3(_RN_48974340 => {
      ++_RN_48974340;
      return _RN_48974340;
    })
  }, __state3), React.createElement("div", {
    onClick: () => {
      SET__testState(_RN_48974340 => {
        _RN_48974340 = 3;
        return _RN_48974340;
      });
      SET__state1(_RN_0834647 => {
        _RN_0834647 = val++;
        SET__state2(_RN_9339645 => {
          _RN_9339645["eniola"] = _RN_0834647;
          SET__testState(_RN_3257885 => {
            _RN_3257885.data = _RN_9339645["eniola"];
            return _RN_3257885;
          });
          return _RN_9339645;
        });
        return _RN_0834647;
      });
      SET__state3(_RN_48974340 => {
        _RN_48974340[0].number = 8;
        return _RN_48974340;
      });
    }
  }, __status, ", ", __testState.data, ",", __state3[6]));
};