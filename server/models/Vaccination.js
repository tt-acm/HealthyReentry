const mongoose = require('mongoose');


/**
 * @swagger
 *  components:
 *    schemas:
 *      Vaccination:
 *        type: object
 *        properties:
 *          _id:
 *            type: ObjectId
 *            description: Unique identifier automatically added to the status.
 *          user:
 *            type: User
 *            description: User reference.
 *          manufacturer:
 *            type: String
 *            description: Vaccine Manufacturer
 *          date:
 *            type: Date
 *            description: Date of the vaccination.
 *        example:
 *           user: $ref to User
 *           status: 0
 *           date: Wed Jun 29 2011 11:52:48 GMT-0500 (Central Daylight Time)
 */
var vaccinationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    manufacturer: String,
    date: Date
}, {
    usePushEach: true
});


module.exports = mongoose.model('Vaccination', vaccinationSchema);
