// controllers/callController.js
const fs = require("fs");
const csv = require("csv-parser");
const client = require("twilio")(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

exports.makeCalls = (req, res) => {
    const customers = [];

    // Read uploaded CSV
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (row) => {
            let number = row.Phone.trim();
            // Ensure the number is in E.164 format
            if (!number.startsWith("+")) {
                if (number.startsWith("0")) {
                    number = "+91" + number.slice(1);
                } else if (number.length === 10) {
                    number = "+91" + number;
                } else {
                    number = "+" + number;
                }
            }

            customers.push({
                phone: number,
                name: row.Name || "customer",
                dueAmount: row.DueAmount || "outstanding amount",
                dueDate: row.DueDate || "the due date"
            });
        })
        .on("end", () => {
            customers.forEach((customer) => {
                // Create URL with query parameters
                const messageUrl = new URL("https://3c73-103-241-224-232.ngrok-free.app/api/calls/play-message");
                messageUrl.searchParams.append("name", encodeURIComponent(customer.name));
                messageUrl.searchParams.append("dueAmount", encodeURIComponent(customer.dueAmount));
                messageUrl.searchParams.append("dueDate", encodeURIComponent(customer.dueDate));

                client.calls
                    .create({
                        url: messageUrl.toString(),
                        to: customer.phone,
                        from: process.env.TWILIO_PHONE_NUMBER,
                    })
                    .then((call) => console.log(`Call initiated to ${customer.phone} (SID: ${call.sid})`))
                    .catch((err) => console.error(`Error calling ${customer.phone}: ${err.message}`));
            });
            res.send({ message: "Calls are being made..." });
        });
};

exports.playMessage = (req, res) => {
    const { name = "customer", dueAmount = "outstanding amount", dueDate = "due date" } = req.query;

    res.set("Content-Type", "text/xml");
    res.send(`
        <Response>
            <Say voice="Polly.Aditi" language="en-IN">Hello ${name}, this is a reminder about your payment of ${dueAmount} rupees that is due on ${dueDate}. Please make the payment as soon as possible. Thank you!
            Namaste ${name}, aapnu ₹${dueAmount} nu bhugtan ${dueDate} sudhi karvanu che.Krupaya samay par chukavsho.Dhanyavaad!
            </Say>
            <Hangup/>
        </Response>
    `);
};

// const fs = require("fs");
// const csv = require("csv-parser");
// const axios = require("axios");
// const path = require("path");

// // Replace with your actual Exotel credentials
// const exotelSid = "consultanubhav2";
// const exotelToken = "e43b2945474a9a31fbc6ef9e9ff9d7427a323f8b8146f89a";
// const exophone = "07948518144"; // e.g., "02212345678"

// exports.makeCalls = (req, res) => {
//     const customers = [];

//     // Read uploaded CSV
//     fs.createReadStream(req.file.path)
//         .pipe(csv())
//         .on("data", (row) => {
//             let number = row.Phone?.trim() || "";

//             // Ensure the number is in E.164 format
//             if (!number.startsWith("+")) {
//                 if (number.startsWith("0")) {
//                     number = "+91" + number.slice(1);
//                 } else if (number.length === 10) {
//                     number = "+91" + number;
//                 } else {
//                     number = "+" + number;
//                 }
//             }

//             customers.push({
//                 phone: number,
//                 name: row.Name || "customer",
//                 dueAmount: row.DueAmount || "outstanding amount",
//                 dueDate: row.DueDate || "the due date"
//             });
//         })
//         .on("end", async () => {
//             for (const customer of customers) {
//                 const messageUrl = new URL("https://3c73-103-241-224-232.ngrok-free.app/api/calls/play-message");
//                 messageUrl.searchParams.append("name", customer.name);
//                 messageUrl.searchParams.append("dueAmount", customer.dueAmount);
//                 messageUrl.searchParams.append("dueDate", customer.dueDate);

//                 const formData = new URLSearchParams({
//                     From: exophone,
//                     To: customer.phone,
//                     CallerId: exophone,
//                     Url: messageUrl.toString(),
//                     TimeLimit: "60",
//                     TimeOut: "30",
//                     CallType: "trans"
//                 });

//                 try {
//                     // const response = await axios.post(
//                     //     `https://${exotelSid}:${exotelToken}@api.exotel.com/v1/Accounts/${exotelSid}/Calls/connect.json`,
//                     //     formData
//                     // );
//                     await axios.post(
//                         `https://api.exotel.com/v1/Accounts/${exotelSid}/Calls/connect.json`,
//                         formData,
//                         {
//                             auth: {
//                                 username: exotelSid,
//                                 password: exotelToken
//                             }
//                         }
//                     );

//                     console.log(`Call initiated to ${customer.phone}`, response.data);
//                 } catch (err) {
//                     console.error(`Error calling ${customer.phone}:`, err.response?.data || err.message);
//                 }
//             }

//             res.send({ message: "Calls are being made via Exotel..." });
//         });
// };

// // This endpoint is hit by Exotel when the call is connected
// exports.playMessage = (req, res) => {
//     const { name = "customer", dueAmount = "outstanding amount", dueDate = "due date" } = req.query;

//     res.set("Content-Type", "text/xml");
//     res.send(`
//         <Response>
//             <Say voice="female" language="en-IN">Hello ${name}, this is a reminder about your payment of ${dueAmount} rupees that is due on ${dueDate}. Please make the payment as soon as possible. Thank you!</Say>
//             <Say voice="female" language="gu-IN">Namaste ${name}, aapna ₹${dueAmount} ni chukavani baki chhe, je ${dueDate} na roj chukaavaani chhe. Krupaya shakya tetli vahli take chukavani karo. Aabhar!</Say>
//             <Hangup/>
//         </Response>
//     `);
// };
