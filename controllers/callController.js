// controllers/callController.js
const fs = require("fs");
const csv = require("csv-parser");
const client = require("twilio")(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

exports.makeCalls = (req, res) => {
    const numbers = [];

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
            numbers.push(number);
        })
        .on("end", () => {
            numbers.forEach((number) => {
                client.calls
                    .create({
                        url: "https://9c36-2409-40c1-6000-c0b9-dcf0-f733-140c-fedb.ngrok-free.app/api/calls/play-message",
                        to: number,
                        from: process.env.TWILIO_PHONE_NUMBER, 
                    })
                    .then((call) => console.log(`Call initiated to ${number} (SID: ${call.sid})`))
                    .catch((err) => console.error(`Error calling ${number}: ${err.message}`));
            });
            res.send({ message: "Calls are being made..." });
        });
};

exports.playMessage = (req, res) => {
    res.set("Content-Type", "text/xml");
    res.send(`
        <Response>
            <Say>Hey! This is a reminder to stay awesome and reach your goals. Take care!</Say>
            <Hangup/>
        </Response>
    `);
};
