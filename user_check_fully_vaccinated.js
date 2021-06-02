const checkFullyVaccinated = require('./server/lib/check_fully_vaccinated');
var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGO_URL;
var fullyVaccinatedCount = 0;

MongoClient.connect(url, {
    useUnifiedTopology: true
}).then(function (client_db) {
    let db = client_db.db();

    let include = {
        "_id": 1,
        // "dateOfConsent": 1,
        "name": 1,
        "location": 1
    }

    let userCollection = db.collection('users');
    let vaccinationCollection = db.collection('vaccinations');


    let includeUser = {
        "_id": 1,
        "email": 1,
        "name": 1
    }
    // Search all users in this office
    userCollection.updateMany(
        {},
        { $set: { "fullyVaccinated": false } },
        function (err, docs) {
            if (err) {
                console.log(err)
            }
            else {
                console.log("All existing vaccination status has been set to false");

                userCollection
                    .find({}, includeUser)
                    .toArray(function (err, users) {
                        if (err) return;

                        let promises = [];

                        // Loop through all users and see what vaccination do they have
                        users.forEach(u => {
                            let curP = vaccinationCollection.find({
                                "user": u._id
                            })
                            .sort({
                                date: -1
                            }).toArray();

                            promises.push(curP);
                        })

                        Promise.all(promises).then((usersWithVacs) => {
                            const updateUserPromises = [];

                            usersWithVacs.forEach(function(vaccine, index) {
                                // users[index].fullyVaccinated = true;
                                if (!vaccine || vaccine.length == 0) return;

                                const uniqueManufacturer = [];

                                vaccine.forEach(v => {
                                    if (!uniqueManufacturer.includes(v.manufacturer)) uniqueManufacturer.push(v.manufacturer);
                                })

                                if (uniqueManufacturer.length != 1) {
                                    // has to take only one kind of vaccines
                                    console.log("this user has more than one type of vaccine: ", users[index].email);
                                    return;
                                }

                                const countCheck = checkUserVaccinationCount(vaccine, uniqueManufacturer[0]);

                                if (countCheck == false) return;

                                const lastDate = vaccine[0].date;
                                if (!lastDate) return;

                                const today = new Date();
                                const diffDate = (today - lastDate) / (1000 * 60 * 60 * 24);

                                if (diffDate < 14) {
                                    // console.log("Still within the 14 day incubation: ", users[index].email);
                                    return;
                                }


                                const thisUpdate =  userCollection.updateOne({_id: users[index]._id}, { $set:{fullyVaccinated: true}});
                                fullyVaccinatedCount += 1;

                                updateUserPromises.push(thisUpdate);
                            });

                            Promise.all(updateUserPromises).then((result) => {
                                console.log("Vaccination Check Completed, closing db...");
                                console.log("Total Fully Vaccinated --- ", fullyVaccinatedCount);   
                                client_db.close();
                            })

                            
                            //   resolve(users)


                        });
                    });
            }
        });

})
// checkFullyVaccinated();
const checkUserVaccinationCount = function (vaccines, manufacturer) {
    // console.log("checking vaccination doses", vaccines);

    if (manufacturer == "JohnsonJohnson" && vaccines.length == 1) return true;
    else if (manufacturer == "Moderna" && vaccines.length == 2) return true;
    else if (manufacturer == "AstraZeneca" && vaccines.length == 2) return true;
    else if (manufacturer == "Pfizer" && vaccines.length == 2) return true;
    else if (manufacturer == "COVAXIN" && vaccines.length == 2) return true;
    else if (manufacturer == "CanSinoBIO" && vaccines.length == 1) return true;
    else if (manufacturer == "Covishield" && vaccines.length == 2) return true;
    else if (manufacturer == "CVnCoV" && vaccines.length == 2) return true;
    else if (manufacturer == "Novavax" && vaccines.length == 2) return true;
    else if (manufacturer == "Sinopharm" && vaccines.length == 2) return true;
    else if (manufacturer == "Sinovac" && vaccines.length == 2) return true;
    else if (manufacturer == "Sputnik" && vaccines.length == 2) return true;
    else return false;


}