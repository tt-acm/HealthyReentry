// application variables
const variables = {};

variables.ADMIN_USERS= process.env.VUE_APP_ADMINS.split(',');

variables.INCUBATION_PERIDOD= 14;

module.exports = variables;
