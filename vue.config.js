require('dotenv').config();
const fs = require('fs');

const PORT = process.env.PORT || 8080;

module.exports = {
  devServer: {
    host: 'localhost', 
    progress: false,
    proxy: {
      "/api/": {
        target: `https://localhost:${PORT}/`,
        logLevel: "debug"
      }
    },
    http2: true,
    https: {
      key: fs.readFileSync('./testingCertificates/ttlocalcert.key'),
      cert: fs.readFileSync('./testingCertificates/ttlocalcert.crt'),
      ca: fs.readFileSync('./testingCertificates/ttlocalcert.crt')
    }
  },
  lintOnSave: false,
  runtimeCompiler: true,
};
