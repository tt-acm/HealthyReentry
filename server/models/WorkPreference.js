const mongoose = require('mongoose');


/**
 * @swagger
 *  components:
 *    schemas:
 *      WorkPreference:
 *        type: object
 *        properties:
 *          _id:
 *            type: ObjectId
 *            description: Unique identifier automatically added to the encounter.
 *          createdAt:
 *            type: Date
 *            description: Date of the preference reported, expires 24 hrs.
 *          user:
 *            type: User
 *            description: User who submitted this preference.
 *        example:
 *           office: "Ottawa"
 *           createdAt: "2020-07-14T19:20:01.151Z"
 */
var workPreferenceSchema = new mongoose.Schema({
  office: String,
	createdAt: { type: Date, expires: 86400, default: Date.now },
	user:
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
},{
	usePushEach: true
});


module.exports = mongoose.model('WorkPreference', workPreferenceSchema);
