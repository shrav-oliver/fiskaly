var express = require('express');
var router = express.Router();
var axios = require('axios');
const { v4: uuidv4 } = require('uuid');

var bearerAuth;
var clientCount;
var clientList;
//uuidv4 function
//PostgresDB authentication setup
const {Pool, Client} = require('pg');

const client = new Client({ 
    user: "doadmin", 
    host: "db-postgresql-tor1-40427-do-user-4811165-0.b.db.ondigitalocean.com", 
    database: "defaultdb", 
    password: "wqyi8ogmoc0gh2nn", 
    port: "25060", 
    ssl: { 
        rejectUnauthorized: false 
    } 
});

function makeDBRequest(queryStr){
    
    return new Promise((resolve, reject) => {
        client.query(queryStr)
        .then(responseData =>{
            resolve(responseData);
            
        })
        .catch(err =>{
            console.log(err);
            reject(err);
        });
    });  
}


router.post('/authenticate', function(req, res, next) {
    let apiKey = req.body.apiKey;
    let apiSecret =  req.body.apiSecret;
    if (apiKey == '' || apiSecret == ''){
        res.render('index',{
            authCredentialsRes: 'API KEY and API Secret cannot be empty',
            api_key: apiKey,
            api_secret: apiSecret,
            status_code: 500,
            tssList: []
        });
    }else{
        let authData = JSON.stringify({
            "api_key": apiKey,
            "api_secret": apiSecret
        });
        
        let authConfig = {
            method: 'post',
            url: 'https://kassensichv-middleware.fiskaly.com/api/v2/auth',
            headers: { 
                'Content-Type': 'application/json'
            },
            data : authData
        };
        // AUTH API CALL
        axios(authConfig)
        .then(function (response) {
            
           // console.log(response.data);
            let accessToken = response.data.access_token;

            bearerAuth = `Bearer ${accessToken}`;

            // DELETE THIS BLOCK AFTER S&T

            let tssListQuery = 'SELECT * FROM fiskalyTSSList';

            client.connect();
            makeDBRequest(tssListQuery)
            .then(dbResponse => {

                let tssList = [];

                if (dbResponse.rowCount == 0){
                    errorMsg += 'API KEY and API SECRET not found with given Client GUID!';
                }
                for (let i = 0; i < dbResponse.rowCount; i++){
                    tssList.push(dbResponse.rows[i]);
                }
                console.log("DB RES: ", dbResponse);
                res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "", disableTSSRes: "", retrieveTSSRes: "", status_code: 200, tssList: tssList, admin_pin: '', tssInfo: ''});

            }).catch(err => {
                res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "LIST TSS FAILED!", createTSSRes: "", disableTSSRes: "", retrieveTSSRes: "",  status_code: 200, tssList: [], admin_pin: '', tssInfo: ''});
            })
            // -----------------------------------
            /*

            let listTSSConfig = {
                method: 'get',
                url: 'https://kassensichv-middleware.fiskaly.com/api/v2/tss',
                headers: { 
                    'Authorization': bearerAuth, 
                    'Content-Type': 'application/json'
                },
                data : JSON.stringify({})
            };
            // LIST TSS API CALL
            axios(listTSSConfig)
            .then(function (response) {
                
                let dataList = response.data.data;
                let tssList = [];
                
                let initializedTSS = {
                    "certificate": "MIIB0zCCAVigAwIBAgIgVHef0WA6O2UVtLD1Gl1/NxOi2kE5yDQyYFI/LqW/+48wCgYIKoZIzj0EAwMwMTEVMBMGA1UEChMMZmlza2FseSBHbWJIMRgwFgYDVQQDEw9maXNrYWx5IFRlc3QgQ0EwHhcNMjEwODMwMTMzMzUwWhcNMjIwODMwMTMzMzUwWjAyMRUwEwYDVQQKEwxmaXNrYWx5IEdtYkgxGTAXBgNVBAMTEGZpc2thbHkgVGVzdCBUU0UwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAAQ4x6NFWa2iDEnIRwOxCNaI1Y7hae06O+bpe3Tco2+PNxhe0/vX3kNhuGIXA9MaI4ll1nO0IpwMnRbCtEU24Leio0EwPzAOBgNVHQ8BAf8EBAMCB4AwDAYDVR0TAQH/BAIwADAfBgNVHSMEGDAWgBSWWUHKZAG6nqV0oaiNlWlm1Ybm1DAKBggqhkjOPQQDAwNpADBmAjEAvDqqMAZaZFNMLAWNchW56hIk/R7m+H5ABR36y4bJtpWQOkbIsfmtAzBDDLA4tYGdAjEA6Rla6BCiVxDt1UfdMrZvchyCiWfHSq6NTrgywpEqH2IC/HbQDO9oJR4sHxhD1sKg",
                    "serial_number": "54779fd1603a3b6515b4b0f51a5d7f3713a2da4139c8343260523f2ea5bffb8f",
                    "public_key": "BDjHo0VZraIMSchHA7EI1ojVjuFp7To75ul7dNyjb483GF7T+9feQ2G4YhcD0xojiWXWc7QinAydFsK0RTbgt6I=",
                    "signature_algorithm": "ecdsa-plain-SHA256",
                    "signature_timestamp_format": "unixTime",
                    "transaction_data_encoding": "UTF-8",
                    "max_number_registered_clients": 199,
                    "max_number_active_transactions": 2000,
                    "supported_update_variants": "SIGNED",
                    "metadata": {},
                    "_id": "a4724605-7fc3-400e-aa26-e5f1f9b10af0",
                    "_type": "TSS",
                    "_env": "TEST",
                    "_version": "2.0.5",
                    "time_creation": 1631533045,
                    "description": "fiskaly sign cloud-TSE (a4724605-7fc3-400e-aa26-e5f1f9b10af0)",
                    "state": "INITIALIZED",
                    "signature_counter": "122",
                    "transaction_counter": "47",
                    "number_registered_clients": 1,
                    "number_active_transactions": 0,
                    "time_uninit": 1631533047,
                    "time_init": 1631533049
                };
                

                for (let i = 0; i < dataList.length; i++){
                    if (dataList[i].state == "INITIALIZED"){
                        tssList.push(dataList[i]);
                    }
                }
                tssList.push(initializedTSS);
                
                


            })
            .catch(function (error) {
                console.log(error);
                res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "LIST TSS FAILED!", createTSSRes: "", disableTSSRes: "", retrieveTSSRes: "",  status_code: 200, tssList: [], admin_pin: '', tssInfo: ''});
            });
            */
            
        })
        .catch(err => {
            res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "AUTHENTICATION FAILED!", createTSSRes: "", disableTSSRes: "", retrieveTSSRes: "", status_code: 500, tssList: [], admin_pin: '', tssInfo: ''});
        });
    }

});

router.post('/removeAccount', function (req, res, next) {

    // PLACE LOGIC HERE FOR REMOVING ACCOUNT FROM POSTGRES DB

    res.render('index', {
        authCredentialsRes: '',
        api_key: '',
        api_secret: '',
        status_code: 500,
        tssList: [], 
        admin_pin: ''
    });
});

router.post('/createTSS', function(req, res, next) {
    
    let apiKey = req.body.apiKey;
    let apiSecret =  req.body.apiSecret;
    let adminPIN = req.body.adminPIN;
    let tssID = uuid();

    console.log("tssID: ", tssID);
    console.log("ADMIN PIN: ", adminPIN);

    let authData = JSON.stringify({
        "api_key": apiKey,
        "api_secret": apiSecret
    });
    
    let authConfig = {
        method: 'post',
        url: 'https://kassensichv-middleware.fiskaly.com/api/v2/auth',
        headers: { 
            'Content-Type': 'application/json'
        },
        data : authData
    };
    // AUTH API CALL
    axios(authConfig)
    .then(function (response) {
        
       // console.log(response.data);
        let accessToken = response.data.access_token;
        bearerAuth = `Bearer ${accessToken}`; 

        let createTSSConfig = {
            method: 'put',
            url: `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tssID}`,
            headers: { 
                'Authorization': bearerAuth, 
                'Content-Type': 'application/json'
            },
            data : JSON.stringify({})
        };
        // CREATE TSS API CALL
        axios(createTSSConfig)
        .then(function (response) {
            console.log("CREATE TSS RESPONSE: ", response.data);
                let certificate = response.data.certificate;
                let serialNum = response.data.serial_number;
                let publicKey = response.data.public_key;
                
                let adminPuk = response.data.admin_puk;
                let state = response.data.state;

                console.log("ADMIN PUK:", adminPuk);
          
                console.log("STATE: ", state);
                if (state == "CREATED"){

                    let uninitTSSData = JSON.stringify({
                        "state": "UNINITIALIZED"
                    });

                    let uninitTSSConfig = {
                        method: 'patch',
                        url: `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tssID}`,
                        headers: { 
                          'Authorization': bearerAuth, 
                          'Content-Type': 'application/json'
                        },
                        data : uninitTSSData
                    };
                    
                    // UPDATE TSS API CALL (UNINITIALIZED)
                    axios(uninitTSSConfig)
                    .then(function (response) {
                        console.log("UNINIT response.data.state: ", response.data.state);
                        if (response.data.state == "UNINITIALIZED") {

                            console.log("UNINITIALIZED TSS RESPONSE:", response.data);
                            console.log("ADMIN PIN: ", adminPIN);
                            console.log("ADMIN PIN type:", typeof(adminPIN));
                            console.log("ADMIN PUK:", adminPuk);
                            console.log("ADMIN PUK type:", typeof(adminPuk));
                            console.log("TSS ID: ", tssID);

                            let unblockAdminPinData = JSON.stringify({
                                "admin_puk": adminPuk,
                                "new_admin_pin": adminPIN
                            });
                            
                            let unblockAdminPinConfig = {
                                method: 'patch',
                                url: `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tssID}/admin`,
                                headers: { 
                                    'Authorization': bearerAuth, 
                                    'Content-Type': 'application/json'
                                },
                                data : unblockAdminPinData
                            };


                            // UNBLOCK ADMIN PIN API CALL
                            axios(unblockAdminPinConfig)
                            .then(function (response) {
                                console.log("UNBLOCK ADMIN PIN EXECUTED");

                                let authAdminData = JSON.stringify({
                                    "admin_pin": adminPIN
                                });
                                
                                let authAdminConfig = {
                                    method: 'post',
                                    url: `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tssID}/admin/auth`,
                                    headers: { 
                                        'Authorization': bearerAuth, 
                                        'Content-Type': 'application/json'
                                    },
                                    data : authAdminData
                                };

                                axios(authAdminConfig)
                                .then(function (response) {
                                    console.log("ADMIN AUTH COMPLETED");

                                    let initializeTSSData = JSON.stringify({
                                        "state": "INITIALIZED"
                                    });
                                    
                                    let initializeTSSConfig = {
                                        method: 'patch',
                                        url: `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tssID}`,
                                        headers: { 
                                            'Authorization': bearerAuth, 
                                            'Content-Type': 'application/json'
                                        },
                                        data : initializeTSSData
                                    };
                                    
                                    axios(initializeTSSConfig)
                                    .then(function (response) {
                                        console.log("INITIALIZED RESPONSE: ", response.data);
                                        if (response.data.state == "INITIALIZED"){

                                            // DELETE THIS BLOCK AFTER S&T
                                            let createTSSQuery = `INSERT INTO fiskalyTSSList(tss_id, tss_pin) VALUES('${tssID}', '${adminPIN}')`;

                                            client.connect();
                                            makeDBRequest(createTSSQuery)
                                            .then(dbResponse => {
                                                console.log("INSERT DB RES: ", dbResponse);
                                                
                                                let tssListQuery = 'SELECT * FROM fiskalyTSSList';
                                                let tssList = [];

                                                makeDBRequest(tssListQuery)
                                                .then(dbResponse => {

                                                    if (dbResponse.rowCount == 0){
                                                        errorMsg += 'API KEY and API SECRET not found with given Client GUID!';
                                                    }
                                                    for (let i = 0; i < dbResponse.rowCount; i++){
                                                        tssList.push(dbResponse.rows[i]);
                                                    }
                                                    console.log("DB RES: ", dbResponse);
                                                    res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "", disableTSSRes: "", retrieveTSSRes: "", status_code: 200, tssList: tssList, admin_pin: '', tssInfo: ''});

                                                }).catch(err => {
                                                    res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "LIST TSS FAILED!", createTSSRes: "", disableTSSRes: "", retrieveTSSRes: "",  status_code: 200, tssList: [], admin_pin: '', tssInfo: ''});
                                                })

                                            }).catch(err => {
                                                res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "LIST TSS FAILED!", createTSSRes: "", disableTSSRes: "", retrieveTSSRes: "",  status_code: 200, tssList: [], admin_pin: '', tssInfo: ''});
                                            })


                                            // ---------------------------
                                            /*
                                            let listTSSConfig = {
                                                method: 'get',
                                                url: 'https://kassensichv-middleware.fiskaly.com/api/v2/tss',
                                                headers: { 
                                                    'Authorization': bearerAuth, 
                                                    'Content-Type': 'application/json'
                                                },
                                                data : JSON.stringify({})
                                            };
                                            // LIST TSS API CALL
                                            axios(listTSSConfig)
                                            .then(function (response) {

                                                let dataList = response.data.data;
                                                let tssList = [];
                                
                                                for (let i = 0; i < dataList.length; i++){
                                                    if (dataList[i].state == "INITIALIZED"){
                                                        tssList.push(dataList[i]);
                                                    }
                                                }

                                                // DELETE THIS PART AFTER S&T
                                                let retrieveConfig = {
                                                    method: 'get',
                                                    url: `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tssID}`,
                                                    headers: { 
                                                        'Authorization': bearerAuth
                                                    }
                                                };
                                                
                                                axios(retrieveConfig)
                                                .then(function (response) {
                                                    console.log("RETRTIEVE DATA: ", response.data);
                                                    tssList.push(response.data);
                                                    let initializedTSS = {
                                                        "certificate": "MIIB0zCCAVigAwIBAgIgVHef0WA6O2UVtLD1Gl1/NxOi2kE5yDQyYFI/LqW/+48wCgYIKoZIzj0EAwMwMTEVMBMGA1UEChMMZmlza2FseSBHbWJIMRgwFgYDVQQDEw9maXNrYWx5IFRlc3QgQ0EwHhcNMjEwODMwMTMzMzUwWhcNMjIwODMwMTMzMzUwWjAyMRUwEwYDVQQKEwxmaXNrYWx5IEdtYkgxGTAXBgNVBAMTEGZpc2thbHkgVGVzdCBUU0UwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAAQ4x6NFWa2iDEnIRwOxCNaI1Y7hae06O+bpe3Tco2+PNxhe0/vX3kNhuGIXA9MaI4ll1nO0IpwMnRbCtEU24Leio0EwPzAOBgNVHQ8BAf8EBAMCB4AwDAYDVR0TAQH/BAIwADAfBgNVHSMEGDAWgBSWWUHKZAG6nqV0oaiNlWlm1Ybm1DAKBggqhkjOPQQDAwNpADBmAjEAvDqqMAZaZFNMLAWNchW56hIk/R7m+H5ABR36y4bJtpWQOkbIsfmtAzBDDLA4tYGdAjEA6Rla6BCiVxDt1UfdMrZvchyCiWfHSq6NTrgywpEqH2IC/HbQDO9oJR4sHxhD1sKg",
                                                        "serial_number": "54779fd1603a3b6515b4b0f51a5d7f3713a2da4139c8343260523f2ea5bffb8f",
                                                        "public_key": "BDjHo0VZraIMSchHA7EI1ojVjuFp7To75ul7dNyjb483GF7T+9feQ2G4YhcD0xojiWXWc7QinAydFsK0RTbgt6I=",
                                                        "signature_algorithm": "ecdsa-plain-SHA256",
                                                        "signature_timestamp_format": "unixTime",
                                                        "transaction_data_encoding": "UTF-8",
                                                        "max_number_registered_clients": 199,
                                                        "max_number_active_transactions": 2000,
                                                        "supported_update_variants": "SIGNED",
                                                        "metadata": {},
                                                        "_id": "a4724605-7fc3-400e-aa26-e5f1f9b10af0",
                                                        "_type": "TSS",
                                                        "_env": "TEST",
                                                        "_version": "2.0.5",
                                                        "time_creation": 1631533045,
                                                        "description": "fiskaly sign cloud-TSE (a4724605-7fc3-400e-aa26-e5f1f9b10af0)",
                                                        "state": "INITIALIZED",
                                                        "signature_counter": "122",
                                                        "transaction_counter": "47",
                                                        "number_registered_clients": 1,
                                                        "number_active_transactions": 0,
                                                        "time_uninit": 1631533047,
                                                        "time_init": 1631533049
                                                    };
                                                    tssList.push(initializedTSS);
                                                    console.log("TSS LIST: ", tssList);
                                                    res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "", disableTSSRes: "", retrieveTSSRes: "", status_code: 200, tssList: tssList, admin_pin: '', tssInfo: ''});
                                                })
                                                .catch(function (error) {
                                                    console.log(error);
                                                    res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "LIST TSS FAILED!", disableTSSRes: "", retrieveTSSRes: "", status_code: 200, tssList: [], admin_pin: '', tssInfo: ''});
                                                });


                                
                                            })
                                            .catch(function (error) {
                                                console.log(error);
                                                res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "LIST TSS FAILED!", disableTSSRes: "", retrieveTSSRes: "", status_code: 200, tssList: [], admin_pin: '', tssInfo: ''});
                                            });
                                            */


                                        }else{
                                            res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "TSS INITIALIZATION API REQUEST SENT BUT TSS STATE IS NOT 'INITIALIZED'!", disableTSSRes: "", retrieveTSSRes: "", status_code: 200, tssList: [], admin_pin: '', tssInfo: ''});
                                        }
                                    })
                                    // TSS INITIALIZATION FAILURE
                                    .catch(function (error) {
                                        console.log("TSS INITIALIZATION REQUEST: ", error);

                                        let listTSSConfig = {
                                            method: 'get',
                                            url: 'https://kassensichv-middleware.fiskaly.com/api/v2/tss',
                                            headers: { 
                                                'Authorization': bearerAuth, 
                                                'Content-Type': 'application/json'
                                            },
                                            data : JSON.stringify({})
                                        };
                                        // LIST TSS API CALL
                                        axios(listTSSConfig)
                                        .then(function (response) {

                                            let dataList = response.data.data;
                                            let tssList = [];
                            
                                            for (let i = 0; i < dataList.length; i++){
                                                if (dataList[i].state == "INITIALIZED"){
                                                    tssList.push(dataList[i]);
                                                }
                                            }

                                            res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "TSS INITIALIZATION API REQUEST FAILED!", disableTSSRes: "", retrieveTSSRes: "", status_code: 200, tssList: tssList, admin_pin: '', tssInfo: ''});
                            
                                        })
                                        .catch(function (error) {
                                            console.log(error);
                                            res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "LIST TSS FAILED!", disableTSSRes: "", retrieveTSSRes: "", status_code: 200, tssList: [], admin_pin: '', tssInfo: ''});
                                        });



                                    });
                                })
                                // AUTH ADMIN FAILURE
                                .catch(function(error) {
                                    console.log("AUTH ADMIN REQUEST: ", error);

                                    let listTSSConfig = {
                                        method: 'get',
                                        url: 'https://kassensichv-middleware.fiskaly.com/api/v2/tss',
                                        headers: { 
                                            'Authorization': bearerAuth, 
                                            'Content-Type': 'application/json'
                                        },
                                        data : JSON.stringify({})
                                    };
                                    // LIST TSS API CALL
                                    axios(listTSSConfig)
                                    .then(function (response) {

                                        let dataList = response.data.data;
                                        let tssList = [];
                        
                                        for (let i = 0; i < dataList.length; i++){
                                            if (dataList[i].state == "INITIALIZED"){
                                                tssList.push(dataList[i]);
                                            }
                                        }

                                        res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "AUTH ADMIN API REQUEST FAILED!", disableTSSRes: "", retrieveTSSRes: "", status_code: 200, tssList: tssList, admin_pin: '', tssInfo: ''});
                                    })
                                    .catch(function (error) {
                                        console.log(error);
                                        res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "LIST TSS FAILED!", disableTSSRes: "", retrieveTSSRes: "", status_code: 200, tssList: [], admin_pin: '', tssInfo: ''});
                                    });
                                    
                                });

                            })
                            // UNBLOCK ADMIN PIN FAILURE
                            .catch(function (error) {
                                console.log("UNBLOCK ADMIN PIN REQUEST: ", error);


                                let listTSSConfig = {
                                    method: 'get',
                                    url: 'https://kassensichv-middleware.fiskaly.com/api/v2/tss',
                                    headers: { 
                                        'Authorization': bearerAuth, 
                                        'Content-Type': 'application/json'
                                    },
                                    data : JSON.stringify({})
                                };
                                // LIST TSS API CALL
                                axios(listTSSConfig)
                                .then(function (response) {

                                    let dataList = response.data.data;
                                    let tssList = [];
                    
                                    for (let i = 0; i < dataList.length; i++){
                                        if (dataList[i].state == "INITIALIZED"){
                                            tssList.push(dataList[i]);
                                        }
                                    }

                                    res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "UNBLOCK ADMIN PIN API REQUEST FAILED!", disableTSSRes: "", retrieveTSSRes: "", status_code: 200, tssList: tssList, admin_pin: '', tssInfo: ''});
                                })
                                .catch(function (error) {
                                    console.log(error);
                                    res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "LIST TSS FAILED!", disableTSSRes: "", retrieveTSSRes: "", status_code: 200, tssList: [], admin_pin: '', tssInfo: ''});
                                });

                            });
                        
                        // TSS STATE FAIL TO BE UNINITIALIZED
                        }else{

                            let listTSSConfig = {
                                method: 'get',
                                url: 'https://kassensichv-middleware.fiskaly.com/api/v2/tss',
                                headers: { 
                                    'Authorization': bearerAuth, 
                                    'Content-Type': 'application/json'
                                },
                                data : JSON.stringify({})
                            };
                            // LIST TSS API CALL
                            axios(listTSSConfig)
                            .then(function (response) {

                                let dataList = response.data.data;
                                let tssList = [];
                
                                for (let i = 0; i < dataList.length; i++){
                                    if (dataList[i].state == "INITIALIZED"){
                                        tssList.push(dataList[i]);
                                    }
                                }
                                res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "TSS UNINITIALIZED API REQUEST SENT BUT TSS STATE IS NOT UNINITIALIZED!", disableTSSRes: "", retrieveTSSRes: "", status_code: 200, tssList: tssList, admin_pin: '', tssInfo: ''});
                            })
                            .catch(function (error) {
                                console.log(error);
                                res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "LIST TSS FAILED!", disableTSSRes: "", retrieveTSSRes: "", status_code: 200, tssList: [], admin_pin: '', tssInfo: ''});
                            }); 
                        }
                    })
                    // TSS UNINTIALIZATION FAILURE
                    .catch(function (error) {

                        let listTSSConfig = {
                            method: 'get',
                            url: 'https://kassensichv-middleware.fiskaly.com/api/v2/tss',
                            headers: { 
                                'Authorization': bearerAuth, 
                                'Content-Type': 'application/json'
                            },
                            data : JSON.stringify({})
                        };
                        // LIST TSS API CALL
                        axios(listTSSConfig)
                        .then(function (response) {

                            let dataList = response.data.data;
                            let tssList = [];
            
                            for (let i = 0; i < dataList.length; i++){
                                if (dataList[i].state == "INITIALIZED"){
                                    tssList.push(dataList[i]);
                                }
                            }
                            res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "UNINITIALIZATION API REQUEST FAILED!", disableTSSRes: "", retrieveTSSRes: "", status_code: 200, tssList: tssList, admin_pin: '', tssInfo: ''});
                        })
                        .catch(function (error) {
                            console.log(error);
                            res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "LIST TSS FAILED!", disableTSSRes: "", retrieveTSSRes: "", status_code: 200, tssList: [], admin_pin: '', tssInfo: ''});
                        }); 

                    });

                // TSS STATE IS NOT "CREATED"
                }else{

                    let listTSSConfig = {
                        method: 'get',
                        url: 'https://kassensichv-middleware.fiskaly.com/api/v2/tss',
                        headers: { 
                            'Authorization': bearerAuth, 
                            'Content-Type': 'application/json'
                        },
                        data : JSON.stringify({})
                    };
                    // LIST TSS API CALL
                    axios(listTSSConfig)
                    .then(function (response) {

                        let dataList = response.data.data;
                        let tssList = [];
        
                        for (let i = 0; i < dataList.length; i++){
                            if (dataList[i].state == "INITIALIZED"){
                                tssList.push(dataList[i]);
                            }
                        }
                        res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "TSS CREATION API REQUEST SENT BUT TSS STATE IS NOT 'CREATED'!", disableTSSRes: "", retrieveTSSRes: "", status_code: 200, tssList: tssList, admin_pin: '', tssInfo: ''});
                    })
                    .catch(function (error) {
                        console.log(error);
                        res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "LIST TSS FAILED!", disableTSSRes: "", retrieveTSSRes: "", status_code: 200, tssList: [], admin_pin: '', tssInfo: ''});
                    });
                }

        })// CREATE TSS API REQUEST FAILURE
        .catch(function (error) {

            let listTSSConfig = {
                method: 'get',
                url: 'https://kassensichv-middleware.fiskaly.com/api/v2/tss',
                headers: { 
                    'Authorization': bearerAuth, 
                    'Content-Type': 'application/json'
                },
                data : JSON.stringify({})
            };
            // LIST TSS API CALL
            axios(listTSSConfig)
            .then(function (response) {

                let dataList = response.data.data;
                let tssList = [];

                for (let i = 0; i < dataList.length; i++){
                    if (dataList[i].state == "INITIALIZED"){
                        tssList.push(dataList[i]);
                    }
                }
                res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "CREATE TSS API REQUEST FAILED!", disableTSSRes: "", retrieveTSSRes: "", status_code: 200, tssList: tssList, admin_pin: '', tssInfo: ''});
            })
            .catch(function (error) {
                console.log(error);
                res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "LIST TSS FAILED!", disableTSSRes: "", retrieveTSSRes: "", status_code: 200, tssList: [], admin_pin: '', tssInfo: ''});
            });

        });
        
    })// CREDENTIALS AUTH FAILURE
    .catch(err => {
        res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "AUTHENTICATION FAILED!", createTSSRes: "", disableTSSRes: "", retrieveTSSRes: "", status_code: 500, tssList: [], admin_pin: '', tssInfo: ''});
    });

});

router.post('/disableTSS', function(req, res, next) {
    let apiKey = req.body.apiKey;
    let apiSecret =  req.body.apiSecret;
    let tssID = req.body.tssIDs;
    let tssPin = req.body.tssPIN;
    console.log("tssPin: ", tssPin);
    console.log("tssPin Type: ", typeof(tssPin));

    console.log("tssID: ", tssID);
    console.log("tssID Type: ", typeof(tssID));

    let authData = JSON.stringify({
        "api_key": apiKey,
        "api_secret": apiSecret
    });
    
    let authConfig = {
        method: 'post',
        url: 'https://kassensichv-middleware.fiskaly.com/api/v2/auth',
        headers: { 
            'Content-Type': 'application/json'
        },
        data : authData
    };
    
    axios(authConfig)
    .then(function (response) {
       // console.log(response.data);
        let accessToken = response.data.access_token;
        bearerAuth = `Bearer ${accessToken}`;

        console.log("bearerAuth: ", bearerAuth);

        let authAdminData = JSON.stringify({
            "admin_pin": tssPin
        });
        
        let authAdminConfig = {
            method: 'post',
            url: `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tssID}/admin/auth`,
            headers: { 
                'Authorization': bearerAuth, 
                'Content-Type': 'application/json'
            },
            data : authAdminData
        };
        
        axios(authAdminConfig)
        .then(function (response) {
            console.log("DISABLE TSS BLOCK");
            let disableTSSData = JSON.stringify({
                "state": "DISABLED"
            });
                
            let disableTSSConfig = {
                method: 'patch',
                url: `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tssID}`,
                headers: { 
                    'Authorization': bearerAuth, 
                    'Content-Type': 'application/json'
                },
                data : disableTSSData
            };
            // DISABLE TSS API REQUEST
            axios(disableTSSConfig)
            .then(function (response) {
                console.log(response.data);
                let state = response.data.state;
                console.log("DISABLE TSS RESPONSE STATE: ", state);

                if (state == 'DISABLED'){

                    // DELETE THIS BLOCK AFTER S&T
                    let createTSSQuery = `DELETE FROM fiskalyTSSList WHERE tss_id='${tssID}'`;

                    client.connect();
                    makeDBRequest(createTSSQuery)
                    .then(dbResponse => {
                        console.log("DELETE DB RES: ", dbResponse);
                        
                        let tssListQuery = 'SELECT * FROM fiskalyTSSList';
                        let tssList = [];

                        makeDBRequest(tssListQuery)
                        .then(dbResponse => {

                            if (dbResponse.rowCount == 0){
                                errorMsg += 'API KEY and API SECRET not found with given Client GUID!';
                            }
                            for (let i = 0; i < dbResponse.rowCount; i++){
                                tssList.push(dbResponse.rows[i]);
                            }
                            console.log("DB RES: ", dbResponse);
                            res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "", disableTSSRes: "TSS HAS BEEN DISABLED!", retrieveTSSRes: "", status_code: 200, tssList: tssList, admin_pin: '', tssInfo: ''});

                        }).catch(err => {
                            res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "", disableTSSRes: "LIST TSS FAILED!", retrieveTSSRes: "",  status_code: 200, tssList: [], admin_pin: '', tssInfo: ''});
                        })

                    }).catch(err => {
                        res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "", disableTSSRes: "LIST TSS FAILED!", retrieveTSSRes: "",  status_code: 200, tssList: [], admin_pin: '', tssInfo: ''});
                    })


                    // ---------------------------

                    /*
                    let listTSSConfig = {
                        method: 'get',
                        url: 'https://kassensichv-middleware.fiskaly.com/api/v2/tss',
                        headers: { 
                            'Authorization': bearerAuth, 
                            'Content-Type': 'application/json'
                        },
                        data : JSON.stringify({})
                    };

                    // LIST TSS API CALL
                    
                    axios(listTSSConfig)
                    .then(function (response) {

                        let dataList = response.data.data;
                        let tssList = [];
        
                        for (let i = 0; i < dataList.length; i++){
                            if (dataList[i].state == "INITIALIZED"){
                                tssList.push(dataList[i]);
                            }
                        }
                        res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "", disableTSSRes: "TSS HAS BEEN DISABLED!", retrieveTSSRes: "", status_code: 200, tssList: tssList, admin_pin: tssPin, tssInfo: ''});

                    })
                    .catch(function (error) {
                        console.log(error);
                        res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "", disableTSSRes: "LIST TSS FAILED!", retrieveTSSRes: "", status_code: 200, tssList: [], admin_pin: '', tssInfo: ''});
                    })
                    */
                }else{
                    res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "", disableTSSRes: "FAIL TO DISABLE TSS!", retrieveTSSRes: "", status_code: 200, tssList: [], admin_pin: '', tssInfo: ''});
                }
            })
            // DISABLE TSS FAILURE
            .catch(function (error) {
                console.log(error);

                let listTSSConfig = {
                    method: 'get',
                    url: 'https://kassensichv-middleware.fiskaly.com/api/v2/tss',
                    headers: { 
                        'Authorization': bearerAuth, 
                        'Content-Type': 'application/json'
                    },
                    data : JSON.stringify({})
                };
                // LIST TSS API CALL
                axios(listTSSConfig)
                .then(function (response) {
        
                    let dataList = response.data.data;
                    let tssList = [];
        
                    for (let i = 0; i < dataList.length; i++){
                        if (dataList[i].state == "INITIALIZED"){
                            tssList.push(dataList[i]);
                        }
                    }
                    res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "", disableTSSRes: "DISABLE TSS API REQUEST FAILED!", retrieveTSSRes: "", status_code: 200, tssList: tssList, admin_pin: tssPin, tssInfo: ''});
        
                })
                .catch(function (error) {
                    console.log(error);
                    res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "", disableTSSRes: "LIST TSS FAILED!", retrieveTSSRes: "", status_code: 200, tssList: [], admin_pin: '', tssInfo: ''});
                });
                
            });
                
        })
        // AUTH ADMIN FAILURE
        .catch(function (error) {
            console.log("AUTH ADMIN ERROR: ", error);

            let listTSSConfig = {
                method: 'get',
                url: 'https://kassensichv-middleware.fiskaly.com/api/v2/tss',
                headers: { 
                    'Authorization': bearerAuth, 
                    'Content-Type': 'application/json'
                },
                data : JSON.stringify({})
            };
            // LIST TSS API CALL
            axios(listTSSConfig)
            .then(function (response) {
    
                let dataList = response.data.data;
                let tssList = [];
    
                for (let i = 0; i < dataList.length; i++){
                    if (dataList[i].state == "INITIALIZED"){
                        tssList.push(dataList[i]);
                    }
                }
                res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "", disableTSSRes: "AUTH ADMIN API REQUEST FAILED!", retrieveTSSRes: "", status_code: 200, tssList: tssList, admin_pin: tssPin, tssInfo: ''});
    
            })
            .catch(function (error) {
                console.log(error);
                res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "", disableTSSRes: "LIST TSS FAILED!", retrieveTSSRes: "", status_code: 200, tssList: [], admin_pin: '', tssInfo: ''});
            });

        });

    })
    // CREDENTIALS AUTH FAILURE
    .catch(err => {
        console.log(err);
        res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "AUTHENTICATION FAILED!", createTSSRes: "", disableTSSRes: "", retrieveTSSRes: "", status_code: 500, tssList: [], admin_pin: '', tssInfo: ''});
    });
    
});



router.post('/retrieveTSS', function (req, res, next) {
    let tssID = req.body.queryTSSID;
    let apiKey = req.body.apiKey;
    let apiSecret = req.body.apiSecret;

    //INSERT LOGIC HERE TO QUERY POSTGRES DB TO RETRIEVE API KEY AND SECRET USING CLIENT GUID
    
    let authData = JSON.stringify({
        "api_key": apiKey,
        "api_secret": apiSecret
    });
    
    
    let authConfig = {
        method: 'post',
        url: 'https://kassensichv-middleware.fiskaly.com/api/v2/auth',
        headers: { 
            'Content-Type': 'application/json'
        },
        data : authData
    };
    
    axios(authConfig)
    .then(function (response) {
        console.log(response.data);
        bearerAuth = `Bearer ${response.data.access_token}`;

        // DELETE THIS AFTER S&T
        let tssListQuery = 'SELECT * FROM fiskalyTSSList';
        let tssList = [];

        makeDBRequest(tssListQuery)
        .then(dbResponse => {

            if (dbResponse.rowCount == 0){
                errorMsg += 'API KEY and API SECRET not found with given Client GUID!';
            }
            for (let i = 0; i < dbResponse.rowCount; i++){
                tssList.push(dbResponse.rows[i]);
            }
            console.log("DB RES: ", dbResponse);

            let retrieveTSSConfig = {
                method: 'get',
                url: `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tssID}`,
                headers: { 
                    'Authorization': bearerAuth
                }
            };
                
            axios(retrieveTSSConfig)
            .then(function (response) {
                console.log("RETRIEVE TSS RESPONSE: ", response.data);
                res.render('index', {api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "", disableTSSRes: "", retrieveTSSRes: "", status_code: 200, tssList: tssList, admin_pin: '', tssInfo: response.data});
            })
            .catch(function (error) {
                console.log(error);
                res.render('index', {api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "", disableTSSRes: "", retrieveTSSRes: "RETRIEVE TSS API REQUEST FAILED!", status_code: 200, tssList: tssList, admin_pin: '', tssInfo: response.data});
            });


        }).catch(err => {
            res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "", disableTSSRes: "", retrieveTSSRes: "RETRIEVE TSS API REQUEST FAILED!",  status_code: 200, tssList: [], admin_pin: '', tssInfo: ''});
        })
        // -----------------------------
        /*
        let listTSSConfig = {
            method: 'get',
            url: 'https://kassensichv-middleware.fiskaly.com/api/v2/tss',
            headers: { 
                'Authorization': bearerAuth, 
                'Content-Type': 'application/json'
            },
            data : JSON.stringify({})
        };
        // LIST TSS API CALL
        axios(listTSSConfig)
        .then(function (response) {
 
            let dataList = response.data.data;
            let tssList = [];

            for (let i = 0; i < dataList.length; i++){
                if (dataList[i].state == "INITIALIZED"){
                    tssList.push(dataList[i]);
                }
            }

            let retrieveTSSConfig = {
                method: 'get',
                url: `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tssID}`,
                headers: { 
                    'Authorization': bearerAuth
                }
            };
                
            axios(retrieveTSSConfig)
            .then(function (response) {
                console.log("RETRIEVE TSS RESPONSE: ", response.data);
                res.render('index', {api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "", disableTSSRes: "", retrieveTSSRes: "", status_code: 200, tssList: tssList, admin_pin: '', tssInfo: response.data});
            })
            .catch(function (error) {
                console.log(error);
                res.render('index', {api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "", disableTSSRes: "", retrieveTSSRes: "RETRIEVE TSS API REQUEST FAILED!", status_code: 200, tssList: tssList, admin_pin: '', tssInfo: response.data});
            });

        })
        .catch(function (error) {
            console.log(error);
            res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "", createTSSRes: "", disableTSSRes: "", retrieveTSSRes: "LIST TSS FAILED!", status_code: 200, tssList: [], admin_pin: '', tssInfo: ''});
        });
        */

    })
    // CREDENTIALS AUTH FAILURE
    .catch(function (error) {
        console.log(error);
        res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "AUTHENTICATION FAILED!", createTSSRes: "", disableTSSRes: "", retrieveTSSRes: "", status_code: 500, tssList: [], admin_pin: '', tssInfo: ''});
    })

});

router.post('/tssClients', function(req, res, next) {
    let apiKey = req.body.apiKey;
    let apiSecret = req.body.apiSecret;
    let tssID = req.body.tssIDs;
    let adminPIN = req.body.tssPIN; 

    // ADD LOGIC HERE TO RETREIVE API KEY AND API SECRET FROM POSTGRES DB AND API CALL TO OBTAIN BEARER TOKEN


    let authData = JSON.stringify({
        "api_key": apiKey,
        "api_secret": apiSecret
    });
    
    let authConfig = {
        method: 'post',
        url: 'https://kassensichv-middleware.fiskaly.com/api/v2/auth',
        headers: { 
            'Content-Type': 'application/json'
        },
        data : authData
    };
    
    axios(authConfig)
    .then(function (response) {
        console.log(response.data);
        bearerAuth = `Bearer ${response.data.access_token}`;

        let listClientsConfig = {
            method: 'get',
            url: `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tssID}/client`,
            headers: { 
                'Authorization': bearerAuth
            }
        };
        
        axios(listClientsConfig)
        .then(function (response) {
            console.log("LIST CLIENTS OF TSS RESPONSE: ", response.data);
            let dataList = response.data.data;
            let clientList = [];
            
            for (let i = 0; i < dataList.length; i++){
                if (dataList[i].state == "REGISTERED"){
                    clientList.push(dataList[i]);
                }
            }
            /*
            clientList.push({
                serial_number: "47786e168a15b887c7df78db7bf6c0ecde972d15e5866b776d25b1f6473b4f47",
                state: "REGISTERED",
                tss_id: "802b3ead-8eb1-4f90-912a-237bf759b4f4",
                metadata: {},
                _id: "cc3fa5dc-b7d5-460f-8afb-5b72fcf8fcd6",
                _type: "CLIENT",
                _env: "TEST",
                _version: "2.0.4",
                time_creation: 1629894466,
                time_update: 0
            });
            */
            
            res.render('clients',{api_key: apiKey, api_secret: apiSecret, clientList: clientList, tss_id: tssID, admin_pin: adminPIN, tssJSON: "", createClientRes: "", deregisterClientRes: "", tssSettingsRes: ""});
        })
        .catch(function (error) {
            console.log(error);
        });
    })
    .catch(function (error) {
        console.log(error);
        res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "AUTHENTICATION FAILED!", createTSSRes: "", disableTSSRes: "", retrieveTSSRes: "", status_code: 500, tssList: [], admin_pin: '', tssInfo: ''});
    });

  
});

router.post('/getTSSTransactions', function (req, res, next) {

    let tssID = req.body.tssID;
    let adminPIN = req.body.adminPIN;
    let apiKey = req.body.apiKey;
    let apiSecret = req.body.apiSecret;

    // ADD LOGIC HERE TO RETREIVE API KEY AND API SECRET FROM POSTGRES DB AND API CALL TO OBTAIN BEARER TOKEN


    let authData = JSON.stringify({
        "api_key": apiKey,
        "api_secret": apiSecret
    });
    
    let authConfig = {
        method: 'post',
        url: 'https://kassensichv-middleware.fiskaly.com/api/v2/auth',
        headers: { 
            'Content-Type': 'application/json'
        },
        data : authData
    };
    
    axios(authConfig)
    .then(function (response) {
        console.log(response.data);
        bearerAuth = `Bearer ${response.data.access_token}`;

        let listClientsConfig = {
            method: 'get',
            url: `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tssID}/client`,
            headers: { 
                'Authorization': bearerAuth
            }
        };
        
        axios(listClientsConfig)
        .then(function (response) {
            console.log("LIST CLIENTS OF TSS RESPONSE: ", response.data);
            let dataList = response.data.data;
            let clientList = [];
            
            for (let i = 0; i < dataList.length; i++){
                if (dataList[i].state == "REGISTERED"){
                    clientList.push(dataList[i]);
                }
            }
            /*
            clientList.push({
                serial_number: "47786e168a15b887c7df78db7bf6c0ecde972d15e5866b776d25b1f6473b4f47",
                state: "REGISTERED",
                tss_id: "802b3ead-8eb1-4f90-912a-237bf759b4f4",
                metadata: {},
                _id: "cc3fa5dc-b7d5-460f-8afb-5b72fcf8fcd6",
                _type: "CLIENT",
                _env: "TEST",
                _version: "2.0.4",
                time_creation: 1629894466,
                time_update: 0
            });
            */

            let listTransTSSConfig = {
                method: 'get',
                url: `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tssID}/tx`,
                headers: { 
                  'Authorization': bearerAuth
                }
            };
            
            axios(listTransTSSConfig)
            .then(function (response) {
                console.log("LIST TRANS TSS RESPONSE: ", response.data);
                //res.render('clients',{clientList: clientList, tss_id: tssID, admin_pin: adminPIN, tssJSON: JSON.stringify(response.data,undefined, 2)});
                res.render('clients',{api_key: apiKey, api_secret: apiSecret, clientList: clientList, tss_id: tssID, admin_pin: adminPIN, tssJSON: response.data, createClientRes: "", deregisterClientRes: "", tssSettingsRes: ""});
            })
            .catch(function (error) {
                console.log(error);
            });

            
            
        })
        .catch(function (error) {
            console.log(error);
        });

    })
    .catch(function (error) {
        console.log(error);
        res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "AUTHENTICATION FAILED!", createTSSRes: "", disableTSSRes: "", retrieveTSSRes: "", status_code: 500, tssList: [], admin_pin: '', tssInfo: ''});
    });


});

router.post('/listExportTSS', function (req, res, next) {

    let tssID = req.body.tssID;
    let adminPIN = req.body.adminPIN;
    let apiKey = req.body.apiKey;
    let apiSecret = req.body.apiSecret;


    // ADD LOGIC HERE TO RETREIVE API KEY AND API SECRET FROM POSTGRES DB AND API CALL TO OBTAIN BEARER TOKEN

    let authData = JSON.stringify({
        "api_key": apiKey,
        "api_secret": apiSecret
    });
    
    let authConfig = {
        method: 'post',
        url: 'https://kassensichv-middleware.fiskaly.com/api/v2/auth',
        headers: { 
            'Content-Type': 'application/json'
        },
        data : authData
    };
    
    axios(authConfig)
    .then(function (response) {
        console.log(response.data);
        bearerAuth = `Bearer ${response.data.access_token}`;

        let listClientsConfig = {
            method: 'get',
            url: `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tssID}/client`,
            headers: { 
                'Authorization': bearerAuth
            }
        };
        
        axios(listClientsConfig)
        .then(function (response) {
            console.log("LIST CLIENTS OF TSS RESPONSE: ", response.data);
            let dataList = response.data.data;
            let clientList = [];
            
            for (let i = 0; i < dataList.length; i++){
                if (dataList[i].state == "REGISTERED"){
                    clientList.push(dataList[i]);
                }
            }

            /*
            clientList.push({
                serial_number: "47786e168a15b887c7df78db7bf6c0ecde972d15e5866b776d25b1f6473b4f47",
                state: "REGISTERED",
                tss_id: "802b3ead-8eb1-4f90-912a-237bf759b4f4",
                metadata: {},
                _id: "cc3fa5dc-b7d5-460f-8afb-5b72fcf8fcd6",
                _type: "CLIENT",
                _env: "TEST",
                _version: "2.0.4",
                time_creation: 1629894466,
                time_update: 0
            });
            */
            let listExportsTSSConfig = {
                method: 'get',
                url: `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tssID}/export`,
                headers: { 
                  'Authorization': bearerAuth
                }
            };
            
            axios(listExportsTSSConfig)
            .then(function (response) {
                console.log("LIST EXPORT TSS RESPONSE: ", response.data);
                //res.render('clients',{clientList: clientList, tss_id: tssID, admin_pin: adminPIN, tssJSON: JSON.stringify(response.data,undefined, 2)});
                res.render('clients',{api_key: apiKey, api_secret: apiSecret, clientList: clientList, tss_id: tssID, admin_pin: adminPIN, tssJSON: response.data, createClientRes: "", deregisterClientRes: "", tssSettingsRes: ""});

            })
            //LIST EXPORT TSS FAILURE
            .catch(function (error) {
                console.log(error);
                res.render('clients',{api_key: apiKey, api_secret: apiSecret, clientList: clientList, tss_id: tssID, admin_pin: adminPIN, tssJSON: "", createClientRes: "", deregisterClientRes: "", tssSettingsRes: "LIST EXPORT OF A TSS API REQUEST FAILED!"});
            });
              

        })
        // LIST CLIENTS FAILURE
        .catch(function(error) {
            console.log(error);
            res.render('clients',{api_key: apiKey, api_secret: apiSecret, clientList: [], tss_id: tssID, admin_pin: adminPIN, tssJSON: "", createClientRes: "", deregisterClientRes: "", tssSettingsRes: "LIST CLIENTS API REQUEST FAILED!"});
        });

    })
    .catch(function(error) {
        console.log(error);
        res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "AUTHENTICATION FAILED!", createTSSRes: "", disableTSSRes: "", retrieveTSSRes: "", status_code: 500, tssList: [], admin_pin: '', tssInfo: ''});
    });

});

router.post('/createClient', function (req, res, next) {

    let apiKey = req.body.apiKey;
    let apiSecret = req.body.apiSecret;
    let tssID = req.body.tssID;
    let adminPIN = req.body.adminPIN;
    
    // ADD LOGIC HERE TO RETREIVE API KEY AND API SECRET FROM POSTGRES DB AND API CALL TO OBTAIN BEARER TOKEN

    let authData = JSON.stringify({
        "api_key": apiKey,
        "api_secret": apiSecret
    });
    
    let authConfig = {
        method: 'post',
        url: 'https://kassensichv-middleware.fiskaly.com/api/v2/auth',
        headers: { 
            'Content-Type': 'application/json'
        },
        data : authData
    };
    
    axios(authConfig)
    .then(function (response) {

        bearerAuth = `Bearer ${response.data.access_token}`;

        let retrieveTSSConfig = {
            method: 'get',
            url: `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tssID}`,
            headers: { 
                'Authorization': bearerAuth
            }
        };
        
        axios(retrieveTSSConfig)
        .then(function (response) {
            console.log("RETRIEVE TSS RESPONSE: ", response.data);

            let serialNum = response.data.serial_number;

            let authAdminData = JSON.stringify({
                "admin_pin": adminPIN
            });
            
            let authAdminConfig = {
                method: 'post',
                url: `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tssID}/admin/auth`,
                headers: { 
                    'Authorization': bearerAuth, 
                    'Content-Type': 'application/json'
                },
                data : authAdminData
            };
            
            axios(authAdminConfig)
            .then(function (response) {
                console.log(response.data);
                console.log("AUTH ADMIN COMPLETED!");
                let clientID = uuid();

                let createClientData = JSON.stringify({
                    "serial_number": serialNum
                });
                
                let createClientConfig = {
                    method: 'put',
                    url: `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tssID}/client/${clientID}`,
                    headers: { 
                        'Authorization': bearerAuth, 
                        'Content-Type': 'application/json'
                    },
                    data : createClientData
                };
                
                axios(createClientConfig)
                .then(function (response) {
                    console.log("CREATE CLIENT RESPONSE: ", response.data);
                    if (response.data.state == "REGISTERED"){
                        
                        let listClientsConfig = {
                            method: 'get',
                            url: `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tssID}/client`,
                            headers: { 
                                'Authorization': bearerAuth
                            }
                        };
                        
                        axios(listClientsConfig)
                        .then(function (response) {
                            console.log("LIST CLIENTS OF TSS RESPONSE: ", response.data);
                            let dataList = response.data.data;
                            let clientList = [];
                            for (let i = 0; i < dataList.length; i++){
                                if (dataList[i].state == "REGISTERED"){
                                    clientList.push(dataList[i]);
                                }
                            }
                            res.render('clients',{api_key: apiKey, api_secret: apiSecret, clientList: clientList, tss_id: tssID, admin_pin: adminPIN, tssJSON: "", createClientRes: "CLIENT CREATED SUCCESSFULLY!", deregisterClientRes: "", tssSettingsRes: ""})
                        })
                        // LIST CLIENT FAILURE
                        .catch(function (error) {
                            console.log(error);
                            res.render('clients',{api_key: apiKey, api_secret: apiSecret, clientList: [], tss_id: tssID, admin_pin: adminPIN, tssJSON: "", createClientRes: "LIST CLIENT API REQUEST FAILED!", deregisterClientRes: "", tssSettingsRes: ""})
                        });

                    }else{
                        res.render('clients',{api_key: apiKey, api_secret: apiSecret, clientList: [], tss_id: tssID, admin_pin: adminPIN, tssJSON: "", createClientRes: "CREATE CLIENT API REQUEST SENT BUT CLIENT STATE IS NOT 'REGISTERED'!", deregisterClientRes: "", tssSettingsRes: ""})
                    }
                })
                // CREATE CLIENT FAILURE
                .catch(function (error) {
                    console.log(error);

                    let listClientsConfig = {
                        method: 'get',
                        url: `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tssID}/client`,
                        headers: { 
                            'Authorization': bearerAuth
                        }
                    };
                    
                    axios(listClientsConfig)
                    .then(function (response) {
                        console.log("LIST CLIENTS OF TSS RESPONSE: ", response.data);
                        let dataList = response.data.data;
                        let clientList = [];
                        for (let i = 0; i < dataList.length; i++){
                            if (dataList[i].state == "REGISTERED"){
                                clientList.push(dataList[i]);
                            }
                        }
                        res.render('clients',{api_key: apiKey, api_secret: apiSecret, clientList: clientList, tss_id: tssID, admin_pin: adminPIN, tssJSON: "", createClientRes: "CREATE CLIENT API REQUEST FAILED!", deregisterClientRes: "", tssSettingsRes: ""})
                    })
                    .catch(function (error) {
                        console.log(error);
                        res.render('clients',{api_key: apiKey, api_secret: apiSecret, clientList: [], tss_id: tssID, admin_pin: adminPIN, tssJSON: "", createClientRes: "LIST CLIENT API REQUEST FAILED!", deregisterClientRes: "", tssSettingsRes: ""})
                    });

                });
                  
    
            })
            // AUTH ADMIN FAILURE
            .catch(function (error) {
                console.log(error);

                let listClientsConfig = {
                    method: 'get',
                    url: `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tssID}/client`,
                    headers: { 
                        'Authorization': bearerAuth
                    }
                };
                
                axios(listClientsConfig)
                .then(function (response) {
                    console.log("LIST CLIENTS OF TSS RESPONSE: ", response.data);
                    let dataList = response.data.data;
                    let clientList = [];
                    for (let i = 0; i < dataList.length; i++){
                        if (dataList[i].state == "REGISTERED"){
                            clientList.push(dataList[i]);
                        }
                    }
                    res.render('clients',{api_key: apiKey, api_secret: apiSecret, clientList: clientList, tss_id: tssID, admin_pin: adminPIN, tssJSON: "", createClientRes: "AUTH ADMIN API REQUEST FAILED!", deregisterClientRes: "", tssSettingsRes: ""})
                })
                .catch(function (error) {
                    console.log(error);
                    res.render('clients',{api_key: apiKey, api_secret: apiSecret, clientList: [], tss_id: tssID, admin_pin: adminPIN, tssJSON: "", createClientRes: "LIST CLIENT API REQUEST FAILED!", deregisterClientRes: "", tssSettingsRes: ""});
                });
            });

        })
        // RETRIEVE TSS FAILURE
        .catch(function (error) {
            console.log(error);

            let listClientsConfig = {
                method: 'get',
                url: `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tssID}/client`,
                headers: { 
                    'Authorization': bearerAuth
                }
            };
            
            axios(listClientsConfig)
            .then(function (response) {
                console.log("LIST CLIENTS OF TSS RESPONSE: ", response.data);
                let dataList = response.data.data;
                let clientList = [];
                for (let i = 0; i < dataList.length; i++){
                    if (dataList[i].state == "REGISTERED"){
                        clientList.push(dataList[i]);
                    }
                }
                res.render('clients',{api_key: apiKey, api_secret: apiSecret, clientList: clientList, tss_id: tssID, admin_pin: adminPIN, tssJSON: "", createClientRes: "TSS RETRIEVAL API REQUEST FAILED!", deregisterClientRes: "", tssSettingsRes: ""});
            })
            .catch(function (error) {
                console.log(error);
                res.render('clients',{api_key: apiKey, api_secret: apiSecret, clientList: [], tss_id: tssID, admin_pin: adminPIN, tssJSON: "", createClientRes: "LIST CLIENT API REQUEST FAILED!", deregisterClientRes: "", tssSettingsRes: ""});
            });


        });

    })
    // CREDENTIALS AUTH FAILURE
    .catch(function (error) {
        console.log("AUTH ERROR: ", error);
        res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "AUTHENTICATION FAILED!", createTSSRes: "", disableTSSRes: "", retrieveTSSRes: "", status_code: 500, tssList: [], admin_pin: '', tssInfo: ''});
    });
})




router.post('/deregisterClient', function(req, res, next) {
    let apiKey = req.body.apiKey;
    let apiSecret = req.body.apiSecret;
    let tssID = req.body.tssID;
    let adminPIN = req.body.adminPIN;
    let clientID = req.body.clientIDs;

    // ADD LOGIC HERE TO RETREIVE API KEY AND API SECRET FROM POSTGRES DB AND API CALL TO OBTAIN BEARER TOKEN

    let authData = JSON.stringify({
        "api_key": apiKey,
        "api_secret": apiSecret
    });
    
    let authConfig = {
        method: 'post',
        url: 'https://kassensichv-middleware.fiskaly.com/api/v2/auth',
        headers: { 
            'Content-Type': 'application/json'
        },
        data : authData
    };
    
    axios(authConfig)
    .then(function (response) {

        bearerAuth = `Bearer ${response.data.access_token}`;

        let authAdminData = JSON.stringify({
            "admin_pin": adminPIN
        });
        
        let authAdminConfig = {
            method: 'post',
            url: `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tssID}/admin/auth`,
            headers: { 
                'Authorization': bearerAuth, 
                'Content-Type': 'application/json'
            },
            data : authAdminData
        };
        
        axios(authAdminConfig)
        .then(function (response) {
            console.log("AUTH ADMIN RESPONSE: ", response.data);


            let deregisterClientData = JSON.stringify({
                "state": "DEREGISTERED"
            });
              
            let deregisterClientConfig = {
                method: 'patch',
                url: `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tssID}/client/${clientID}`,
                headers: { 
                    'Authorization': bearerAuth, 
                    'Content-Type': 'application/json'
                },
                data : deregisterClientData
            };
            
            axios(deregisterClientConfig)
            .then(function (response) {
                console.log("DEREGISTER CLIENT RESPONSE: ", response.data);

                let listClientsConfig = {
                    method: 'get',
                    url: `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tssID}/client`,
                    headers: { 
                        'Authorization': bearerAuth
                    }
                };
                
                axios(listClientsConfig)
                .then(function (response) {
                    console.log("LIST CLIENTS OF TSS RESPONSE: ", response.data);
                    let dataList = response.data.data;
                    let clientList = [];
                    for (let i = 0; i < dataList.length; i++){
                        if (dataList[i].state == "REGISTERED"){
                            clientList.push(dataList[i]);
                        }
                    }
                    res.render('clients',{api_key: apiKey, api_secret: apiSecret, clientList: clientList, tss_id: tssID, admin_pin: adminPIN, tssJSON: "", createClientRes: "", deregisterClientRes: "CLIENT DEREGISTERED SUCCESSFULLY!", tssSettingsRes: ""})
                })
                .catch(function (error) {
                    console.log("ERROR RESPONSE FROM LIST CLIENT: ", error);
                    
                    res.render('clients',{api_key: apiKey, api_secret: apiSecret, clientList: [], tss_id: tssID, admin_pin: adminPIN, tssJSON: "", createClientRes: "", deregisterClientRes: "ERROR RESPONSE FROM LIST CLIENT", tssSettingsRes: ""})
                });

            })
            .catch(function (error) {
                console.log("ERROR RESPONSE FROM DEREGISTER CLIENT: ", error);
                let errorMsg = error.response.data.message;
                let listClientsConfig = {
                    method: 'get',
                    url: `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tssID}/client`,
                    headers: { 
                        'Authorization': bearerAuth
                    }
                };
                
                axios(listClientsConfig)
                .then(function (response) {
                    console.log("LIST CLIENTS OF TSS RESPONSE: ", response.data);
                    let dataList = response.data.data;
                    let clientList = [];
                    for (let i = 0; i < dataList.length; i++){
                        if (dataList[i].state == "REGISTERED"){
                            clientList.push(dataList[i]);
                        }
                    }
                    res.render('clients',{api_key: apiKey, api_secret: apiSecret, clientList: clientList, tss_id: tssID, admin_pin: adminPIN, tssJSON: "", createClientRes: "", deregisterClientRes: "DEREGISTER CLIENT API REQUEST FAILURE: " + errorMsg, tssSettingsRes: ""})
                })
                .catch(function (error) {
                    console.log("ERROR RESPONSE FROM LIST CLIENT: ", error);
                    
                    res.render('clients',{api_key: apiKey, api_secret: apiSecret, clientList: [], tss_id: tssID, admin_pin: adminPIN, tssJSON: "", createClientRes: "", deregisterClientRes: "ERROR RESPONSE FROM LIST CLIENT", tssSettingsRes: ""})
                });
            });
        })
        // AUTH ADMIN FAILURE
        .catch(function (error) {
            console.log("ERROR RESPONSE FROM AUTH ADMIN: ", error);
            let listClientsConfig = {
                method: 'get',
                url: `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tssID}/client`,
                headers: { 
                    'Authorization': bearerAuth
                }
            };
            
            axios(listClientsConfig)
            .then(function (response) {
                console.log("LIST CLIENTS OF TSS RESPONSE: ", response.data);
                let dataList = response.data.data;
                let clientList = [];
                for (let i = 0; i < dataList.length; i++){
                    if (dataList[i].state == "REGISTERED"){
                        clientList.push(dataList[i]);
                    }
                }
                res.render('clients',{api_key: apiKey, api_secret: apiSecret, clientList: clientList, tss_id: tssID, admin_pin: adminPIN, tssJSON: "", createClientRes: "", deregisterClientRes: "AUTH ADMIN API REQUEST FAILED!", tssSettingsRes: ""});
            })
            .catch(function (error) {
                console.log(error);
                res.render('clients',{api_key: apiKey, api_secret: apiSecret, clientList: [], tss_id: tssID, admin_pin: adminPIN, tssJSON: "", createClientRes: "", deregisterClientRes: "LIST CLIENT API REQUEST FAILED!", tssSettingsRes: ""});
            });
        });

    })
    // CREDENTIALS AUTH FAILURE
    .catch(function (error) {
        console.log("AUTH ERROR: ", error);
        res.render('index',{api_key: apiKey, api_secret: apiSecret, authCredentialsRes: "AUTHENTICATION FAILED!", createTSSRes: "", disableTSSRes: "", retrieveTSSRes: "", status_code: 500, tssList: [], admin_pin: '', tssInfo: ''});
    });
});

router.post('/clients', (req,res,next) => {
    var data = JSON.stringify({
      "api_key": "test_4ffvrpykwaae6wkrgvudaibg5_oliverpos",
      "api_secret": "8iWF2PxSRoxBbYkvn40GtRTEE8WIwDHpjpR4xY16SpJ"
    });
    
    var config = {
      method: 'post',
      url: 'https://kassensichv-middleware.fiskaly.com/api/v2/auth',
      headers: { 
        'Content-Type': 'application/json'
      },
      data : data
    };
    
    axios(config)
    .then(function (response) {
      var atn = response.data.access_token;
      //Url to retrieve all clients
      var url2 = 'https://kassensichv-middleware.fiskaly.com/api/v2/client';
      var config1 = {
        method: 'get',
        url: url2,
        headers: { 
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${atn}`
          },
        data: {}
        };
      
      axios(config1)
      .then(function (response) {
        res.render('clientlist', {clients : response.data.data});
      })
      .catch(function (error) {
        console.log(error);
      });   
    
    
      //console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });
});

router.post('/transactions' , (req,res,next) => {
    var txns;
    var data = JSON.stringify({
      "api_key": "test_4ffvrpykwaae6wkrgvudaibg5_oliverpos",
      "api_secret": "8iWF2PxSRoxBbYkvn40GtRTEE8WIwDHpjpR4xY16SpJ"
    });
    
    var config = {
      method: 'post',
      url: 'https://kassensichv-middleware.fiskaly.com/api/v2/auth',
      headers: { 
        'Content-Type': 'application/json'
      },
      data : data
    };
    
    axios(config)
    .then(function (response) {
      var atn = response.data.access_token;
      var url2 = "https://kassensichv-middleware.fiskaly.com/api/v2/tx";
      var config1 = {
        method: 'get',
        url: url2,
        headers: { 
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${atn}`
          },
        data: {}
        };
        axios(config1)
        .then(function (response) {
          txns = response.data.data;
          console.log(txns);
          res.render('transaction', {transactions: txns});
          //res.send(txns);
        })
        .catch(function (error) {
          console.log(error);
        });  
    })
    .catch(function (error) {
      console.log(error);
    });
    
  });
  
  
  router.post('/dataExports', (req, res,next) =>{
    var data = JSON.stringify({
      "api_key": "test_4ffvrpykwaae6wkrgvudaibg5_oliverpos",
      "api_secret": "8iWF2PxSRoxBbYkvn40GtRTEE8WIwDHpjpR4xY16SpJ"
    });
    
    var config = {
      method: 'post',
      url: 'https://kassensichv-middleware.fiskaly.com/api/v2/auth',
      headers: { 
        'Content-Type': 'application/json'
      },
      data : data
    };
    
    axios(config)
    .then(function (response) {
      var atn = response.data.access_token;
      //res.send(atn);
      //Url to retrieve all clients
      var url4 = `https://kassensichv-middleware.fiskaly.com/api/v2/export`;
      var config1 = {
        method: 'get',
        url: url4,
        headers: { 
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${atn}`
          },
        data: {}
        };
      axios(config1)
      .then(function (response) {
        var exportList = response.data.data;
        //console.log(exportList);
        // res.send(exportList);
        res.render('exports', {exports : exportList});
    
    
        //res.render('client', {client : response.data, });
      })
      .catch(function (error) {
        console.log(error);
      });   
      //console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });
  
  });
  
	router.post('/thisclient', (req,res,next) => {
	var data = JSON.stringify({
	  "api_key": "test_4ffvrpykwaae6wkrgvudaibg5_oliverpos",
	  "api_secret": "8iWF2PxSRoxBbYkvn40GtRTEE8WIwDHpjpR4xY16SpJ"
	});

	var config = {
	  method: 'post',
	  url: 'https://kassensichv-middleware.fiskaly.com/api/v2/auth',
	  headers: { 
		'Content-Type': 'application/json'
	  },
	  data : data
	};

	axios(config)
	.then(function (response) {
	  var atn = response.data.access_token;
	  var tssid = req.body.tssid;
	  var clientid = req.body.id;
	  //Url to retrieve all clients
	  var url1 = `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tssid}/client/${clientid}`;
	  var url2 = 'https://kassensichv-middleware.fiskaly.com/api/v2/client';
	  var url3 = `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tssid}/client/${clientid}/tx`;
	  var config1 = {
		method: 'get',
		url: url1,
		headers: { 
			'Content-Type': 'application/json',
			'Authorization' : `Bearer ${atn}`
		  },
		data: {}
		};

	  axios(config1)
	  .then(function (response) {
		var client = response.data;
        console.log(client);
		var config2 = {
		  method: 'get',
		  url: url3,
		  headers: { 
			  'Content-Type': 'application/json',
			  'Authorization' : `Bearer ${atn}`
			},
		  data: {}
		  };
		  axios(config2)
		  .then(function (response) {
           var transactions = response.data.data;
           console.log(transactions);
		   //res.render('client', {client : client, transactions: response.data.data });
           var url4 = `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tssid}/client/${clientid}/metadata`;
           var config3 = {
           method: 'get',
           url: url4,
           headers: { 
               'Content-Type': 'application/json',
               'Authorization' : `Bearer ${atn}`
               },
           data: {}
           };
           axios(config3)
           .then(function (response) {
               console.log(response.data);
               let list1 = Object.entries(response.data);
               //res.render('thisexport', {thisexport: thisExport, metadata: list1});
               res.render('client', {client : client, transactions: transactions, metadata: [
                [ 'client_guid', '' ],
                [ 'outlet_name', 'Avalon' ],
                [ 'register_name', 'test_register' ]
              ] });
       
       
           //res.render('client', {client : response.data, });
           })
           .catch(function (error) {
               console.log(error);
           });   
		  })
		  .catch(function (error) {
			console.log(error);
		  });


		//res.render('client', {client : response.data, });
	  })
	  .catch(function (error) {
		console.log(error);
	  });   


	  //console.log(JSON.stringify(response.data));
	})
	.catch(function (error) {
	    console.log(error);
	});
	});

    router.post('/triggerExport' , (req, res, next) => {
        //create the unique identifier for the export
        var uid =uuidv4();
        console.log(uid);
        //res.send(uid);
        var data = JSON.stringify({
            "api_key": "test_4ffvrpykwaae6wkrgvudaibg5_oliverpos",
            "api_secret": "8iWF2PxSRoxBbYkvn40GtRTEE8WIwDHpjpR4xY16SpJ"
          });
          
          var config = {
            method: 'post',
            url: 'https://kassensichv-middleware.fiskaly.com/api/v2/auth',
            headers: { 
              'Content-Type': 'application/json'
            },
            data : data
          };
          
          axios(config)
          .then(function (response) {
            var atn = response.data.access_token;
            //res.send(atn);
            //Url to retrieve all clients
            var tss_id = "0458b31d-66d6-46a7-8572-2d5dde97dbb6";
            var export_id = uid;
            var url4 = `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tss_id}/export/${export_id}`;
            var config1 = {
              method: 'put',
              url: url4,
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization' : `Bearer ${atn}`
                },
              data: {}
              };
            axios(config1)
            .then(function (response) {
              console.log(response);
              res.redirect(307, '/setup/dataExports');
          
          
              //res.render('client', {client : response.data, });
            })
            .catch(function (error) {
              console.log(error);
            });   
            //console.log(JSON.stringify(response.data));
          })
          .catch(function (error) {
            console.log(error);
          });
    });

    router.post('/thisexport',(req, res, next) => {
        console.log(req.body);
        var tss_id = req.body.tss_id;
        var export_id = req.body.export_id;
        var url = `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tss_id}/export/${export_id}`;
        var data = JSON.stringify({
            "api_key": "test_4ffvrpykwaae6wkrgvudaibg5_oliverpos",
            "api_secret": "8iWF2PxSRoxBbYkvn40GtRTEE8WIwDHpjpR4xY16SpJ"
        });
        var atn;
        var config = {
            method: 'post',
            url: 'https://kassensichv-middleware.fiskaly.com/api/v2/auth',
            headers: { 
            'Content-Type': 'application/json'
            },
            data : data
        };
        var data1 = JSON.stringify({});
        
        axios(config)
        .then(function (response) {
            atn = response.data.access_token;
            var config1 = {
                method: 'get',
                url: url,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization' : `Bearer ${atn}`
                  },
                data: {}   
            };
        
            axios(config1)
            .then((response) => {
                var thisExport = response.data;
                console.log(thisExport);
                //res.render('thisexport', {thisexport: thisExport});
                var url4 = `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tss_id}/export/${export_id}/metadata`;
                var config3 = {
                method: 'get',
                url: url4,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization' : `Bearer ${atn}`
                    },
                data: {}
                };
                axios(config3)
                .then(function (response) {
                    console.log(response.data);
                    let list1 = Object.entries(response.data);
                    res.render('thisexport', {thisexport: thisExport, metadata: list1});
            
            
                //res.render('client', {client : response.data, });
                })
                .catch(function (error) {
                    console.log(error);
                });   
                
            })
            .catch(function (error) {
                console.log(error);
            });
        
        })
        .catch(function (error) {
            console.log(error);
        });
        
        console.log(tss_id);
        console.log(export_id);
        //res.send("yolo bitches");
    });
    router.post('/getTar', (req, res, next) => {
        var tss_id = req.body.tss_id;
        var export_id = req.body.export_id;
        var url = `https://kassensichv-middleware.fiskaly.com/api/v2/tss/${tss_id}/export/${export_id}/file`;


        var axios = require('axios');
        var data = JSON.stringify({
            "api_key": "test_4ffvrpykwaae6wkrgvudaibg5_oliverpos",
            "api_secret": "8iWF2PxSRoxBbYkvn40GtRTEE8WIwDHpjpR4xY16SpJ"
        });
        var atn;
        var config = {
            method: 'post',
            url: 'https://kassensichv-middleware.fiskaly.com/api/v2/auth',
            headers: { 
            'Content-Type': 'application/json'
            },
            data : data
        };
        var data1 = JSON.stringify({});

        axios(config)
        .then(function (response) {
            atn = response.data.access_token;
            var config1 = {
                method: 'get',
                url: url,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization' : `Bearer ${atn}`
                },
                data: {}   
            };

            axios(config1)
            .then((response) => {
                var csv = response.data; // Not including for example.
                //console.log(csv);
            res.setHeader('Content-disposition', 'attachment; filename=testtarfile.csv');
            res.set('Content-Type', 'application/json');
            res.status(200).send(csv);
            })
            .catch(function (error) {
                console.log(error);
            });

        })
        .catch(function (error) {
            console.log(error);
        });

    })

    router.post('/thistransaction', (req, res, next) => {
        res.send("<p> Work In Progress</p>");
    })

    



module.exports = router;