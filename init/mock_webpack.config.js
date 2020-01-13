let data = require("@babel/preset-react");

const config = {
  oneOf: [
            //added by init generator during post install
            /* this loader enables the use of annatations for react states removing the need for setState
            * on dev
            */
            {
              test: /.(jsx|tsx)$/,
              include: paths.appSrc,
              exclude:/node_modules/,
              loader: require.resolve("babel-loader"),
              options: {
                // @remove-on-eject-begin
                babelrc: false,
                configFile: false,
                plugins: [["@babel/custom-babel-plugin/react-annotation", {}], ["@babel/plugin-proposal-class-properties"]],
                presets: [["@babel/preset-react"]],
               
                // cacheDirectory: true,
                // cacheCompression: false,
                // compact: isEnvProduction,
              }
            },{ test: /zssd[A-Z]/, includes: "../", excludes: "node-modules" }, {}]
};
