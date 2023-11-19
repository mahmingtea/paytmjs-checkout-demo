import { useRef, useState } from "react";
import { CheckoutProvider, Checkout } from "paytm-blink-checkout-react"; //npm install paytm-blink-checkout-react
import axios from "axios";
function App() {
  const postData = useRef({ name: "", mobile: "", email: "", amount: 100 });
  const [config, setConfig] = useState();
  const appendConfig = (config) => {
    const newConfig = { ...config };
    newConfig.handler = {
      notifyMerchant: notifyMerchantHandler,
      transactionStatus: transactionStatusHandler,
    };
    return newConfig;
  };
  const notifyMerchantHandler = (eventType, data) => {
    console.log("eventName => ", eventType);
    console.log("data => ", data);
    if (eventType === "APP_CLOSED") {
      //event for paytm checkout close
    }
  };
  const transactionStatusHandler = (paymentStatus) => {
    console.log(paymentStatus);
    if (paymentStatus.STATUS === "TXN_SUCCESS") {
      //transaction success event
      console.log("Transaction success");
    } else if (paymentStatus.STATUS === "TXN_PENDING") {
      //transaction pending event
      console.log("Transaction pending");
    } else if (paymentStatus.STATUS === "TXN_FAILURE") {
      //transaction fail event
      console.log("Transaction failed");
    }
    //remove paytm checkout after payment
    document.getElementById("paytm-checkoutjs").remove();
  };
  return (
    <>
      <div
        style={{
          display: "flex",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div>
          <h3>PaytmJS Checkout Demo</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              axios
                .post("http://localhost:3000", postData.current)
                .then(function (response) {
                  setConfig(appendConfig(response.data));
                })
                .catch(function (error) {
                  console.log(error);
                });
            }}
          >
            <input
              required
              placeholder="Name"
              onChange={(e) =>
                (postData.current = {
                  ...postData.current,
                  name: e.target.value,
                })
              }
            />
            <br />
            <input
              required
              placeholder="Mobile"
              type="number"
              onChange={(e) =>
                (postData.current = {
                  ...postData.current,
                  mobile: e.target.value,
                })
              }
            />
            <br />
            <input
              required
              placeholder="email"
              type="email"
              onChange={(e) =>
                (postData.current = {
                  ...postData.current,
                  email: e.target.value,
                })
              }
            />
            <br />
            Amount: Rs.
            <select
              onChange={(e) =>
                (postData.current = {
                  ...postData.current,
                  amount: e.target.value,
                })
              }
            >
              <option value={100}>100</option>
              <option value={500}>500</option>
              <option value={1000}>1000</option>
            </select>
            <br />
            <button type="submit">Submit</button>
          </form>
          {config && (
            <CheckoutProvider
              config={config}
              openInPopup={true}
              env="STAGE" //for production use PROD
            >
              <Checkout />
            </CheckoutProvider>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
