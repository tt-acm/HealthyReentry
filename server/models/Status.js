const mongoose = require('mongoose');


/**
 * @swagger
 *  components:
 *    schemas:
 *      Status:
 *        type: object
 *        properties:
 *          _id:
 *            type: ObjectId
 *            description: Unique identifier automatically added to the status.
 *          user:
 *            type: User
 *            description: User reference.
 *          status:
 *            type: Number
 *            description: Status reported by the user.
 *                         [0-> All Ok(green); 1-> At risk(orange); 2-> Confirmed(red); 3-> Recovered(blue)]
 *          date:
 *            type: Date
 *            description: Date of the status reported.
 *        example:
 *           user: $ref to User
 *           status: 0
 *           date: Wed Jun 29 2011 11:52:48 GMT-0500 (Central Daylight Time)
 */
var statusSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: Number,
    date: Date
}, {
    usePushEach: true
});

statusSchema.index({
    user: 1
}, {
    unique: false
});

/**
 * Pre-save hook:
 * it sets the date current, and the user

 *
 * @function save
 * @memberof Encounter
 * @instance
 *
 * @param {function} callback
 *
 * @example

status.save(function(err,savedEncounter){
    req.body User added into the user
    it sets the date if not provided
});

 */
statusSchema.pre("save", function(next, user) {
    var status = this;

    status.date = new Date();

    next();
});


module.exports = mongoose.model('Status', statusSchema);
