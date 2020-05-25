const mongoose = require('mongoose');


/**
 * @swagger
 *  components:
 *    schemas:
 *      Encounter:
 *        type: object
 *        properties:
 *          _id:
 *            type: ObjectId
 *            description: Unique identifier automatically added to the encounter.
 *          date:
 *            type: Date
 *            description: Date of the encounter reported.
 *          users:
 *            type: [User]
 *            description: Shared users with different access permissions.
 *        example:
 *           date: Wed Jun 29 2011 11:52:48 GMT-0500 (Central Daylight Time)
 *           users: Array with $refs to User
 */
var encounterSchema = new mongoose.Schema({
	date: Date,
	users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
},{
	usePushEach: true
});


module.exports = mongoose.model('Encounter', encounterSchema);