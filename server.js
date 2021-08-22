require('dotenv').config();

const express = require('express');
const app = express();
const port = 3000;
const path = require("path");

const API_KEY = process.env.API_KEY;
const MERCHANT_ACCOUNT = process.env.MERCHANT_ACCOUNT;
const CLIENT_KEY = process.env.CLIENT_KEY;

 
const {Client, Config, CheckoutAPI} = require('@adyen/api-library');

const config = new Config();
// Set your X-API-KEY with the API key from the Customer Area.
config.apiKey = API_KEY;
config.merchantAccount = MERCHANT_ACCOUNT;

const client = new Client({ config });
client.setEnvironment("TEST");
const checkout = new CheckoutAPI(client);

app.use(express.static('client/public'));

// app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', function (req, res) {
  res.send('');
})

app.get('/checkout-lawrence', function (req, res) {
    res.sendFile(path.join(__dirname, 'client/public/checkout.html'));
})

app.post('/paymentMethods', function(request, response){  
    // console.log(request); 
    const paymentsResponse = checkout.paymentMethods({
        merchantAccount: config.merchantAccount,
        countryCode: "US",
        shopperLocale: "en-US",
        amount: { currency: "USD", value: 1000, },
        channel: "Web"
        }).then(res => {    
            res.client_key = CLIENT_KEY;
            response.send(res);
        });
})

app.post('/payments', function(request, response){
    try{
        checkout.payments({
            merchantAccount: MERCHANT_ACCOUNT,
        // STATE_DATA is the paymentMethod field of an object passed from the front end or client app, deserialized from JSON to a data structure.
            paymentMethod: request.body.paymentMethod,
            amount: { currency: "USD", value: 500, },
            reference: "TEST_ORDER",
            returnUrl: "http://localhost:3000/redirectResult"
        }).then(res => {
            response.send(res);
        });
    }catch(exception){
        console.log(exception);
    }
    
})

//TO DO
app.get('/redirectResult', function(req, res){
    console.log(req);
})
 
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })