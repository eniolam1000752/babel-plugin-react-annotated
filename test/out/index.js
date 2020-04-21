import React, { Fragment } from "react";

function TestComponent() {
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
  });
  let var1 = {};
  var _value = "string";

  function initData() {
    console.log("data init");
  }

  const initialization = data => {
    SET__state3(_RN_6819158 => {
      _RN_6819158 = Object.assign({}, _RN_6819158);

      _RN_6819158.__state3[0].number = (() => {
        let _RN_6819158 = __state2.value;
        SET__state2(_RN_6819158 => {
          _RN_6819158 = Object.assign({}, _RN_6819158);
          ++_RN_6819158.__state2.value;
          return _RN_6819158;
        });
        return ++_RN_6819158;
      })();

      return _RN_6819158;
    });
  };

  React.useEffect(() => {
    SET__state1(_RN_6819158 => {
      _RN_6819158 = Object.assign({}, _RN_6819158);
      _RN_6819158.__state1 = {
        val: 90
      };
      return _RN_6819158;
    });
    console.log('eniola');
  }, []);
  return React.createElement(React.Fragment, null, React.createElement("div", null, React.createElement("div", null, __state2), React.createElement("div", {
    onMouseDown: () => {}
  }, __state3), React.createElement("div", {
    onClick: () => {
      SET__state2(_RN_6819158 => {
        _RN_6819158 = Object.assign({}, _RN_6819158);
        _RN_6819158.__state2 = __state3;
        return _RN_6819158;
      });
      SET__state2(_RN_6819158 => {
        _RN_6819158 = Object.assign({}, _RN_6819158);

        _RN_6819158.__state2 = (() => {
          let _RN_6819158 = __state1;
          SET__state1(_RN_6819158 => {
            _RN_6819158 = Object.assign({}, _RN_6819158);
            ++_RN_6819158.__state1;
            return _RN_6819158;
          });
          return ++_RN_6819158;
        })();

        return _RN_6819158;
      });
    }
  }, __state2 + " : " + __state3)));
}