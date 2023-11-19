const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const port = 3000;
app.use(cors());
app.use(bodyParser.json());

app.post("/", (req, res) => {
  const mid = ""; //Enter your MID here
  const mkey = ""; //Enter your Merchant Key here
  const hostname = "securegw-stage.paytm.in"; //use securegw.paytm.in for production
  const website = "WEBSTAGING"; //use DEFAULT for production

  const randomNumber = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000; //Generate Random number for customer id and order id
  const orderId = "ORDER_" + randomNumber;
  const custId = "CUSTID_" + randomNumber;

  const amount = req.body.amount; //amount send from frontend
  const mobile = req.body.mobile; //mobile number send from frontend
  const email = req.body.email; //email send from frontend
  const firstName = req.body.name; //name send from frontend

  const https = require("https");
  const PaytmChecksum = require("paytmchecksum");

  var paytmParams = {};

  paytmParams.body = {
    requestType: "Payment",
    mid: mid,
    websiteName: website,
    orderId: orderId,
    callbackUrl: "",
    industryType: "Retail",
    txnAmount: {
      value: amount,
      currency: "INR",
    },
    userInfo: {
      custId: custId,
      mobile: mobile,
      email: email,
      firstName: firstName,
    },
  };
  PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), mkey).then(
    function (checksum) {
      paytmParams.head = {
        channelId: "WEB",
        signature: checksum,
      };

      var post_data = JSON.stringify(paytmParams);
      var options = {
        hostname: hostname,
        port: 443,
        path: `/theia/api/v1/initiateTransaction?mid=${mid}&orderId=${orderId}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": post_data.length,
        },
      };
      var response = "";
      var post_req = https.request(options, function (post_res) {
        post_res.on("data", function (chunk) {
          response += chunk;
        });

        post_res.on("end", function () {
          const data = JSON.parse(response);
          const token = data.body.txnToken;
          const config = {
            root: "",
            flow: "DEFAULT",
            data: {
              orderId: orderId,
              token: token,
              tokenType: "TXN_TOKEN",
              amount: amount,
            },
            merchant: {
              mid: mid,
              name: "MERCHANT NAME", //Your Merchant name on paytm checkout
              logo: `/react.svg`, //logo from frontend public folder
              redirect: false,
              callbackUrl: "",
            },
            payMode: {
              filter: {
                exclude: ["BALANCE"], //You can exclude payment mode here BALANCE = paytm wallet. More info at paytm documentation. Will only work at production
              },
            },
          };
          res.send(config); //sending this config to frontend
        });
      });
      post_req.write(post_data);
      post_req.end();
    }
  );
});

app.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
