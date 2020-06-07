const fs = require("fs");

const webPackConfigPath = "../react-scripts/config/webpack.config.js"; //"mock_webpack.config.js";
const babelConfigPath = "../../babel.config.js";
const transfromPath = "react-annotated"; //@babel/custom-babel-plugin/react-annotation
const babelPluginConfig = `,
  plugins: ['react-annotated'],
};`;
const replacementConfig = `
            //added by init generator during post install
            /* this loader enables the use of annotations for react states and init useEffect
            * on dev
            */
            {
              test: /\.(jsx|tsx|js|ts)$/,
              include: paths.appSrc,
              exclude:/node_modules/,
              loader: require.resolve("babel-loader"),
              options: {
                // @remove-on-eject-begin
                babelrc: false,
                configFile: false,
                plugins: [['${transfromPath}', {}], ["@babel/plugin-proposal-class-properties"]],
                presets: [["@babel/preset-react"]],
               
                // cacheDirectory: true,
                // cacheCompression: false,
                // compact: isEnvProduction,
              }
            },`;

const runScripts = () => {
  try {
    console.log("<<<  checking if REACT project");
    const data = fs.readFileSync(webPackConfigPath).toString();
    if (!new RegExp(`plugins: \\[\\['${transfromPath}', {}\\]`).test(data)) {
      console.log(
        "Did not find react-annotated plugin in webpack.config. Adding to config <<<"
      );
      fs.writeFileSync(
        webPackConfigPath,
        data.replace(/oneOf:\s*\[/g, "oneOf: [" + replacementConfig)
      );
    } else {
      console.log(
        "found react-annotated config in webpack.config. Skipping >>>"
      );
    }
  } catch (exp) {
    console.log("not a REACT project >>>");
    try {
      console.log("<<<  checking if REACT NATIVE project");
      const data = fs.readFileSync(babelConfigPath).toString();
      if (/plugins:\s\[\'react-annotated\'\]/g.test(data)) {
        console.log(
          "found react-annotate config in babel.config.js Skipping >>>"
        );
      } else {
        console.log("Adding config to babel config <<<");
        const dataConfig = data
          .replace("\n", "")
          .replace(
            /((?<=(presets)).*)/g,
            `$1\nplugins: ['${babelPluginConfig}'],`
          );
        fs.writeFileSync(babelConfigPath, dataConfig);
      }
    } catch (exp) {
      console.log(
        new Error(
          "This is not a REACT NATIVE project or babel.config.js file is provided under a different location"
        )
      );
    }
  }
};

runScripts();
