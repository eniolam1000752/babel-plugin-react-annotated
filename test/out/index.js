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
    onMouseDown: () => {
      SET__state1(_RN_15315748 => {
        _RN_15315748 = Object.assign({}, _RN_15315748);

        _RN_15315748.__state1 = (() => {
          let _RN_15315748 = __state3.value[0];
          SET__state3(_RN_15315748 => {
            _RN_15315748 = Object.assign({}, _RN_15315748);
            ++_var_1234.__state3.value[0];
            return _RN_15315748;
          });
          return ++_RN_15315748;
        })();

        return _RN_15315748;
      });

      (() => {
        let _RN_15315748 = __state1.val;
        SET__state1(_RN_15315748 => {
          _RN_15315748 = Object.assign({}, _RN_15315748);
          ++_RN_15315748.__state1.val;
          return _RN_15315748;
        });
        return ++_RN_15315748;
      })();
    }
  }, __state3), React.createElement("div", {
    onClick: () => {
      // __testState = 3;
      // __testState.data = __state2[
      //   "eniola"
      // ] = __state1 = val1.data[0] = val2[0] = value.person.name[0] = val[0]++;
      // __state3[0].number = ++__state3;
      SET__state3(_RN_641490 => {
        _RN_641490 = Object.assign({}, _RN_641490);
        _RN_641490.__state3 = 2;
        SET__state2(_RN_6774130 => {
          _RN_6774130 = Object.assign({}, _RN_6774130);
          _RN_6774130.__state2 = _RN_641490.__state3;
          SET__state1(_RN_35714776 => {
            _RN_35714776 = Object.assign({}, _RN_35714776);
            _RN_35714776.__state1 = _RN_6774130.__state2;
            return _RN_35714776;
          });
          return _RN_6774130;
        });
        return _RN_641490;
      }); // /*  __state3.eni[0] = */ = __state3 = ++__state2.key;
      // __state3 = __state2.key;
      // __state2 = ++__state1;
    }
  }, __state2 + " : " + __state3)));
};