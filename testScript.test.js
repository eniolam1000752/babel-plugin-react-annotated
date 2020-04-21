let babelPluginTester = require("babel-plugin-tester").default;
let plugin = require(".");
const babelOptions = "../babel.config.js";
const pluginName = "react-annotated";
const test = { tests: [] };

test.tests = [
  {
    title: "test for well defined react state",
    code: `
    const TestComponent = () => {
      //@state
      var __state1 = 56;
      //@state
      let __state2 = {}, __state3 = 'string', __state4 = [], __state5 = true, __state6 = 908;

      return null;
    }
    `,
    output: `
    const TestComponent = () => {
      const [{ __state1 }, SET__state1] = React.useState({
        __state1: 56
      });
      const [{ __state2 }, SET__state2] = React.useState({
          __state2: {}
        }),
        [{ __state3 }, SET__state3] = React.useState({
          __state3: "string"
        }),
        [{ __state4 }, SET__state4] = React.useState({
          __state4: []
        }),
        [{ __state5 }, SET__state5] = React.useState({
          __state5: true
        }),
        [{ __state6 }, SET__state6] = React.useState({
          __state6: 908
        });
      return null;
    };`,
    snapshot: false
  },
  {
    title: "test for mal-formed defined react state",
    code: `
    const TestComponent = () => {
      var __state1 = 56;
      //@state
      let __state2 = {}, __state3 = 'string', __state4 = [], __state5 = true, __state6 = 908;

      return null;
    }
    `,
    output: `
    const TestComponent = () => {
      const [{ __state1 }, SET__state1] = React.useState({
        __state1: 56
      });
      const [{ __state2 }, SET__state2] = React.useState({
          __state2: {}
        }),
        [{ __state3 }, SET__state3] = React.useState({
          __state3: "string"
        }),
        [{ __state4 }, SET__state4] = React.useState({
          __state4: []
        }),
        [{ __state5 }, SET__state5] = React.useState({
          __state5: true
        }),
        [{ __state6 }, SET__state6] = React.useState({
          __state6: 908
        });
      return null;
    };`,
    snapshot: false
  }
];

babelPluginTester({
  plugin,
  pluginName,
  babelOptions,
  tests: test.tests,
  snapshot: true
});
