$(document).ready(function() {
    console.log( "ready!" );
});

function showFinalResult(response, dropin){
    console.log("show final result: " + response.resultCode);

    if(response.resultCode === "Authorised"){
        // Show a success message
        dropin.setStatus('success', { message: 'Payment was successful!' });
    }
    else if(response.resultCode === "Error"){
        // Show an error message
        dropin.setStatus('error', { message: 'Something went wrong.'});

    }
    else if(response.resultCode === "Refused"){
        // Set a loading state
        dropin.setStatus('refused', { message: 'Something went wrong.'}); // set back to the initial state 
    }
}

$(document).on("click",'.btn',function(){
    $.ajax({
        type: "POST",
        dataType: "json",
        url: "/paymentMethods",
        // On a successful call, clear the #results section
        success: function(response) {
        //   console.log(response);
          const configuration = {
            paymentMethodsResponse: response, // The `/paymentMethods` response from the server.
            clientKey: response.client_key, // Web Drop-in versions before 3.10.1 use originKey instead of clientKey.
            locale: "en-US",
            environment: "test",
            onSubmit: (state, dropin) => {
                // console.log("On submit step");
                // Global configuration for onSubmit
                // Your function calling your server to make the `/payments` request
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    url: "/payments",
                    data: state.data
                }).then(response => {
                    // console.log("make payment res: " + response);
                    if (response.action) {
                      // Drop-in handles the action object from the /payments response
                      dropin.handleAction(response.action);
                    } else {
                      // Your function to show the final result to the shopper
                      showFinalResult(response, dropin);
                    }
                  })
                  .catch(error => {
                    throw Error(error);
                  });
              },
            onAdditionalDetails: (state, dropin) => {
              // Your function calling your server to make a `/payments/details` request
              makeDetailsCall(state.data)
                .then(response => {
                  if (response.action) {
                    // Drop-in handles the action object from the /payments response
                    dropin.handleAction(response.action);
                  } else {
                    // Your function to show the final result to the shopper
                    showFinalResult(response, dropin);
                  }
                })
                .catch(error => {
                  throw Error(error);
                });
            },
            paymentMethodsConfiguration: {
              card: { // Example optional configuration for Cards
                hasHolderName: true,
                holderNameRequired: true,
                enableStoreDetails: true,
                billingAddressRequired: true, //make dynamic
                hideCVC: false, // Change this to true to hide the CVC field for stored cards
                name: 'Credit or debit card',
                onSubmit: (state, dropin) => {
                    console.log("On submit step");
                    // Global configuration for onSubmit
                    // Your function calling your server to make the `/payments` request
                    $.ajax({
                        type: "POST",
                        dataType: "json",
                        url: "/payments",
                        data: state.data
                    }).then(response => {
                        console.log("make payment res: " + response);
                        if (response.action) {
                          // Drop-in handles the action object from the /payments response
                          dropin.handleAction(response.action);
                        } else {
                          // Your function to show the final result to the shopper
                          showFinalResult(response, dropin);
                        }
                      })
                      .catch(error => {
                        throw Error(error);
                      });
                  }, // onSubmit configuration for card payments. Overrides the global configuration.
              }
            }
            };
            console.log(configuration);
            const check = new AdyenCheckout(configuration);
 
            const dropin = check
                .create('dropin', {
                // Starting from version 4.0.0, Drop-in configuration only accepts props related to itself and cannot contain generic configuration like the onSubmit event.
                    openFirstPaymentMethod:false
                })
               .mount('#dropin-container');
                    }
      });
});