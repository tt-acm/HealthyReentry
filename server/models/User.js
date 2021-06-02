const mongoose = require('mongoose');
const variables = require("../util/variables");

/**
 * @swagger
 *  components:
 *    schemas:
 *      User:
 *        type: object
 *        required:
 *          - name
 *          - email
 *        properties:
 *          _id:
 *            type: ObjectId
 *            description: Unique identifier automatically added to the user.
 *          name:
 *            type: String
 *            default: ""
 *            description: Name of the user.
 *          email:
 *            type: String
 *            default: ""
 *            description: Email of the user, needs to be unique.
 *          location:
 *            type: String
 *            description: Location name as string.
 *          permissions:
 *            type: Object
 *            description: An object representing the true/false permission values for keys.
 *                         By default contains a permission set for 'admin' set to false.
 *          dateOfConsent:
 *            type: Date
 *            description: The consent date when a user signs the disclosure and consent form.
 *        example:
 *           name: Peter Parker
 *           email: pp_is_stuck@web.com
 *           location: New York
 *           dateOfConsent: "2020-05-13T19:52:51.297Z"
 *           permissions: { "admin": true, "read": true, "write": false }
 */
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    // index: true,
    default: ""
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    default: ""
  },
  picture: {
    type: String
  },
  location: {
    type: String,
    required: true,
    default: "N/A"
  },
  dateOfConsent: Date,
  permissions: {
    admin: {
      type: Boolean,
      default: false
    }
  },
  fullyVaccinated: {
    type: Boolean,
    default: false
  }
}, {timestamps: true});

UserSchema.pre("save", function (next) {
    var user = this;
    // set admin
    if(variables.ADMIN_USERS.includes(user.email.toLowerCase())) user.permissions.admin= true;
    next();

});


module.exports = mongoose.model('User', UserSchema);
