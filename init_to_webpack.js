const fs = require("fs");

const webPackConfigPath = "../react-scripts/config/webpack.config.js"; //"mock_webpack.config.js";
const transfromPath = "react-annotated"; //@babel/custom-babel-plugin/react-annotation
const replacementConfig = `
            //added by init generator during post install
            /* this loader enables the use of annatations for react states removing the need for setState
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
    const data = fs.readFileSync(webPackConfigPath).toString();
    if (
      /* data.indexOf(replacementConfig) === -1 */ !new RegExp(
        `plugins: \\[\\['${transfromPath}', {}\\]`
      ).test(data)
    ) {
      console.log(
        "Did not find react-annotated plugin in webpack.config. adding to config <<<<"
      );
      fs.writeFileSync(
        webPackConfigPath,
        data.replace(/oneOf:\s*\[/g, "oneOf: [" + replacementConfig)
      );
    } else {
      console.log(
        "found react-annotated config in webpack.config. skipping >>>>"
      );
    }
  } catch (exp) {
    console.log(
      new Error(
        "This is not a react project or the webpack.config file provided under the react script is in a different location"
      )
    );
  }
};

runScripts();
