const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");




const jsdocOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Healthy Reentry API Docs",
      version: "1.0.0",
    }
  },
  apis: [
    "server/**/*.js"
  ]
};

const swaggerDocs = swaggerJsdoc(jsdocOptions);



const swaggerOptions = { 
  customCss: '.swagger-ui .topbar { display: none }',
  customJs: '/swagger/customization.js'
};



function devModeCheck(req, res, next) {
  if (process.env.NODE_ENV !== "development") {
    return res.redirect('/');
  }
  next();
}




function setup(router) {
  router.use("/docs", devModeCheck, swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerOptions));
}




module.exports = {
  setup
}