const graphlib = require('@dagrejs/graphlib');

const Encounter = require('../models/Encounter');
const Status = require('../models/Status');
const User = require('../models/User');

const variables = require("../util/variables");

// populate users array
const getAllUsers = function() {
    return new Promise(function (resolve, reject) {

        let include = {
            "_id": 1,
            "email": 1,
            "name": 1
        }

        User.find({}, include).exec(async function(err, allUsers) {

            let users = [];

            for (let u of allUsers) {
                let nu = u.toObject();
                const st = await Status.find({
                        "user": nu._id
                    })
                    .sort({
                        date: -1
                    })
                    .limit(1);
                nu.status = st[0];
                users.push(nu)
            }

            return resolve(users);


        });


    });

}

function getAllEncounters(incubationPeriod) {

    return new Promise(function (resolve, reject) {
        var checkDate = new Date();
        var pastDate = checkDate.getDate() - incubationPeriod;
        checkDate.setDate(pastDate);

        let include = { // returns only email, profile name, and _id
            "_id": 1,
            "email": 1,
            "name": 1
        }

        Encounter.find({
                "date": {
                    "$gte": checkDate
                }
            }).populate("users", include)
            .exec(function (err, encounters) {
                resolve(encounters);
            });


    });

}

function buildEncounterGraph(users, encounters) {
    return new Promise(function (resolve, reject) {
        // Instantiate graph data structure
        var g = new graphlib.Graph({
            directed: false, // Undirected graph
            compound: true, // TODO: Verify if this should be T/F
            multigraph: false // Multiple encounters stored as edge "value"
        });

        var countUsers = 0;
        var countEnc = 0;
        // Load Vertices (users)
        users.forEach(function (user) {
            g.setNode(user.email, user);
            countUsers += 1;
            isDone();
        });

        // Load Edges (encounters)

        encounters.forEach(function (enc) {

            // Number of Encounters
            var numEncounters = 0;
            if (enc.users[0] != undefined && enc.users[1] != undefined) {
                if (g.hasEdge(enc.users[0].email, enc.users[1].email)) {
                    numEncounters = g.edge(enc.users[0].email, enc.users[1].email);
                }

                g.setEdge(enc.users[0].email, enc.users[1].email, numEncounters + 1);

            }

            countEnc += 1;
            isDone();

        });


        function isDone() {
            if (encounters.length === countEnc && users.length === countUsers) {
                resolve(g);
            }
        }

    });


}

function findEncounterTree(user, incubationPeriod) {//incubation period 2 days if status reported Orange vs 14 days for Red.
    // TODO : Add another date input for the date of last reported date.
    // Function to find up to n'th degree encounters of user

    return new Promise(function (resolve, reject) {
        const n = 3;
        getAllUsers()
        .then(function (users) {
            getAllEncounters(incubationPeriod)
            .then(function (encounters) {
                buildEncounterGraph(users, encounters)
                .then(function (g) {

                    var r = graphlib.alg.dijkstra(g, user, null, function (v) {
                        return g.nodeEdges(v);
                    })
                    //var r = graphlib.alg.dijkstra(g, user);
                    var data = [];
                    var count = 0;
                    for (var u in r) {
                        let nd = g.node(u);
                        if (r[u].distance == 1) {
                            data.push({
                                "name": nd.name.replace(',', ''),
                                "email": u,
                                "number_of_encounters": g.edge(user, u),
                                "degree-of-separation": 1,
                                "status": (nd.status) ? nd.status.status : -1, // mark -1 if person hasn't ever reported any status
                                "statusLastUpdated": (nd.status) ? nd.status.date : "N/A"
                            });
                        } else if (r[u].distance > 1 && r[u].distance < Infinity) {
                            data.push({
                                "name": nd.name.replace(',', ''),
                                "email": u,
                                "number_of_encounters": 0,
                                "degree-of-separation": r[u].distance,
                                "status": (nd.status) ? nd.status.status : -1, // mark -1 if person hasn't ever reported any status
                                "statusLastUpdated": (nd.status) ? nd.status.date : "N/A"
                            });
                        }
                        isDone();
                    };

                    function isDone() {
                        count += 1;
                        if (Object.keys(r).length === count) {

                            // console.log("resolving graph data JSON", data);
                            data.sort(function(a, b){return a["degree-of-separation"] - b["degree-of-separation"]});
                            resolve(data);
                        }
                    }

                });


            });


        })
        .catch((err) => {
            console.log(err);
        });


    });

}


module.exports = findEncounterTree;
