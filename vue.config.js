require('dotenv').config();

const PORT = process.env.PORT || 8080;

module.exports = {
  devServer: {
    progress: false,
    proxy: {
      "/api/": {
        target: `http://localhost:${PORT}/`,
        logLevel: "debug"
      }
    }
  },
  lintOnSave: false,
  runtimeCompiler: true,
};
