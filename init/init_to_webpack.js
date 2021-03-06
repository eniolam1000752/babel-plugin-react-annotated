const fs = require("fs");

const webPackConfigPath = "mock_webpack.config.js";
const transfromPath = "react-annotation"; //@babel/custom-babel-plugin/react-annotation
const replacementConfig = `
            //added by react-annotated init generator during post install
            /* this loader enables the use of annatations for react states removing the need for setState
            * on dev
            */
            {
              test: /\.(jsx)$/,
              include: paths.appSrc,
              exclude:/node_modules/,
              loader: require.resolve("babel-loader"),
              options: {
                // @remove-on-eject-begin
                babelrc: false,
                configFile: false,
                plugins: [[${transfromPath}, {}], ["@babel/plugin-proposal-class-properties"]],
                presets: [["@babel/preset-react"]],
               
                // cacheDirectory: true,
                // cacheCompression: false,
                // compact: isEnvProduction,
              }
            },{
              test: /\.(tsx)$/,
              include: paths.appSrc,
              exclude:/node_modules/,
              loader: require.resolve("babel-loader"),
              options: {
                // @remove-on-eject-begin
                babelrc: false,
                configFile: false,
                plugins: [[${transfromPath}, {}], ["@babel/plugin-proposal-class-properties"]],
                presets: [require.resolve('babel-preset-react-app')],
               
                // cacheDirectory: true,
                // cacheCompression: false,
                // compact: isEnvProduction,
              }
            },`;

const runScript = () => {
  try {
    const data = fs.readFileSync(webPackConfigPath).toString();
    if (data.indexOf(replacementConfig) === -1) {
      fs.writeFileSync(
        webPackConfigPath,
        data.replace(/oneOf:\s*\[/g, "oneOf: [" + replacementConfig)
      );
    }
  } catch (exp) {
    console.log(
      new Error(
        "This is not a react project or the webpack.config file provided under the react script is in a different path"
      )
    );
  }
};

runScript();
