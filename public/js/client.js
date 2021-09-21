function sendHttpRequest(method, url, data){
    const promise = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.response = 'JSON';
        
        xhr.onload = () => {
            resolve(xhr.response);  
        };
        
        xhr.send(JSON.stringify(data));
    });
    return promise;
}


function sendFiskalyRequest(requestObj, endpoint){
    return new Promise((resolve, reject) => {
        sendHttpRequest('POST', endpoint, requestObj)
        .then(responseData => {
            resolve(responseData);
        })
        .catch(err => {
            reject(err);
        });
    })
}

/*
document.getElementById('initializeTSS').addEventListener('click', function(){
    let apiKey = document.getElementById('apiKey').value;
    let apiSecret = document.getElementById('apiSecret').value;
    let initializeTSSObj ={
        apiKey: apiKey,
        apiSecret: apiSecret
    };
    sendFiskalyRequest(initializeTSSObj, '/setup/auth')
    .then(response => {

    })
    .catch(err => {
        console.log(err);
    })

})
*/
/*
let txID = uuidv4();
console.log("txID: ", txID);

let transactionObj ={
    tx_id: txID
};


sendFiskalyRequest(transactionObj, '/transactions/start').then(startTransResponse => {
    let startTransData = JSON.parse(startTransResponse);
    console.log("FISKALY START TRANS RESPONSE: ", startTransData);
    let state = startTransData.response.state;
    let tssID = startTransData.response.tss_id;
    let clientID = startTransData.response.client_id;
    let sale = 'FINISH';

    if(state == "ACTIVE" && sale == "FINISH"){
        console.log("STATE: ", state);
        console.log("TSS ID: ", tssID);
        console.log("TX ID: ", txID);

        let finishTransObj ={
            tx_id: txID,
            tss_id: tssID,
            client_id: clientID
        }

        sendFiskalyRequest(finishTransObj, '/transactions/finish').then(finishTransResponse => {
            console.log("FISKALY FINISH TRANS RESPONSE: ", JSON.parse(finishTransResponse));

        })
        .catch(err => {
            console.log(err);
        })

    }else if (state == "ACTIVE" && sale == "CANCEL"){
        console.log("STATE: ", state);
        console.log("TSS ID: ", tssID);
        console.log("TX ID: ", txID);

        let cancelTransObj ={
            tx_id: txID,
            tss_id: tssID,
            client_id: clientID
        }

        sendFiskalyRequest(cancelTransObj, '/transactions/cancel').then(cancelTransResponse => {
            console.log("FISKALY CANCEL TRANS RESPONSE: ", JSON.parse(cancelTransResponse));
        })
        .catch(err => {
            console.log(err);
        })


    }
    

})
.catch(err => {
    console.log(err);
})

*/
function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}