const express = require("express");
const bodyParser = require("body-parser");
const QRCode = require("qrcode");
const fetch = require("node-fetch");
require('dotenv').config();

const app = express();
const channelAccessToken = process.env.CHANNEL_ACCESS_TOKEN;
const channelSecret = process.env.CHANNEL_SECRET;
let surveyAnswers = {};

app.use(bodyParser.json());

app.post("/webhook", (req, res) => {
    console.log("Received a request:", JSON.stringify(req.body, null, 2));

    // Extract necessary data from the request
    const { events } = req.body;

    // Process each event
    events.forEach(event => {
        // Handle only message events with text
        if (event.type === "message" && event.message.type === "text") {
            handleTextMessage(event);
        } else if (event.type === "postback") {
            handlePostbackEvent(event);
        }
    });

    // Respond to the webhook request
    res.sendStatus(200);
});

async function handleTextMessage(event) {
    const { replyToken, message, source } = event;

    // Extract text message content
    const { text } = message;
    const userId = source.userId;

    // Check if the text message is requesting a QR code
    if (text.toLowerCase() === "qr") {
        generateQR(replyToken);
    } else if (text.toLowerCase() === "promotion") {
        sendPromotionCarousel(replyToken);
    } else if (text.toLowerCase() === "survey") {
        surveyAnswers[userId] = [];
        sendSurveyCarousel(replyToken);  // Initialize survey answers for the user
       
    }
}

async function sendSurveyCarousel(replyToken) {
    const carousel = {
        type: "carousel",
        contents: [
            {
                type: "bubble",
                hero: {
                    type: "image",
                    url: "https://service-api.auto1.co.th/media/4025/web-bro5-6-%E0%B8%8B-%E0%B8%AD%E0%B8%A1-02.jpg",
                    size: "full",
                    aspectRatio: "20:13",
                    aspectMode: "cover",
                },
                body: {
                    type: "box",
                    layout: "vertical",
                    contents: [
                        {
                            type: "text",
                            text: "ขอบคุณที่ใช้บริการ",
                            weight: "bold",
                            size: "xl",
                        },
                        {
                            type: "text",
                            text: "รบกวนประเมินความพึงพอใจ เพื่อให้เราพัฒนาการบริการให้ดีขึ้นค่ะ",
                            wrap: true,
                            margin: "md",
                        },
                    ],
                },
                action: {
                    type: "uri",
                    label: "View Details",
                    uri: "https://uat-stk.thaiwatsadu.com/survey/",
                },
            },
            // Add more bubble objects for additional promotions
        ],
    };

    const flexMessage = {
        type: "flex",
        altText: "Promotion Carousel",
        contents: carousel
    };

    sendFlex(replyToken, flexMessage);
}

// async function sendSurveyCarousel(replyToken, userId, questionIndex) {
//     const questions = [
//         "ประการณ์ที่ได้รับการบริการในวันนี้?",
//         "การบริการในระหว่างที่รอ?",
//         "บรรยากาศภายในอาคาร?",
//         "พนักงานคอยให้ความช่วยเหลือ?",
//         "การเสร็จตามเวลาที่แจ้งไว้?",
//     ];

//     if (questionIndex >= questions.length) {
//         // Survey is complete
//         pushSurveyAnswers(userId, surveyAnswers[userId]);
//         delete surveyAnswers[userId];  // Clear the answers after pushing
//         sendReplyMessage(replyToken, "Thank you for completing the survey!");
//         return;
//     }

//     const question = questions[questionIndex];

//     const bubble = {
//         type: "bubble",
//         body: {
//             type: "box",
//             layout: "vertical",
//             contents: [
//                 {
//                     type: "text",
//                     text: `Q${questionIndex + 1}: ${question}`,
//                     weight: "bold",
//                     size: "xl",
//                 },
//                 {
//                     type: "box",
//                     layout: "horizontal",
//                     contents: [
//                         {
//                             type: "button",
//                             action: {
//                                 type: "postback",
//                                 label: "1",
//                                 data: `userId=${userId}&questionIndex=${questionIndex}&answer=1`,
//                             },
//                             style: "primary",
//                             margin: "none",
//                             height: "sm",
//                             flex: 1,
//                             offsetTop: "10px",
                            
//                         },
//                         {
//                             type: "button",
//                             action: {
//                                 type: "postback",
//                                 label: "2",
//                                 data: `userId=${userId}&questionIndex=${questionIndex}&answer=2`,
//                             },
//                             style: "primary",
//                             margin: "none",
//                             height: "sm",
//                             flex: 1,
//                             offsetTop: "10px",
//                         },
//                         {
//                             type: "button",
//                             action: {
//                                 type: "postback",
//                                 label: "3",
//                                 data: `userId=${userId}&questionIndex=${questionIndex}&answer=3`,
//                             },
//                             style: "primary",
//                             margin: "none",
//                             height: "sm",
//                             flex: 1,
//                             offsetTop: "10px",
//                         },
//                         {
//                             type: "button",
//                             action: {
//                                 type: "postback",
//                                 label: "4",
//                                 data: `userId=${userId}&questionIndex=${questionIndex}&answer=4`,
//                             },
//                             style: "primary",
//                             margin: "none",
//                             height: "sm",
//                             flex: 1,
//                             offsetTop: "10px",
//                         },
//                         {
//                             type: "button",
//                             action: {
//                                 type: "postback",
//                                 label: "5",
//                                 data: `userId=${userId}&questionIndex=${questionIndex}&answer=5`,
//                             },
//                             style: "primary",
//                             margin: "none",
//                             height: "sm",
//                             flex: 1,
//                             offsetTop: "10px",
//                         },
//                     ],
//                 },
//             ],
//         },
//     };

//     const carousel = {
//         type: "carousel",
//         contents: [bubble],
//     };

//     const flexMessage = {
//         type: "flex",
//         altText: "Survey",
//         contents: carousel,
//     };

//     sendFlex(replyToken, flexMessage);
// }


  


// async function handlePostbackEvent(event) {
//     const { replyToken, postback } = event;
//     const data = new URLSearchParams(postback.data);

//     const userId = data.get("userId");
//     const questionIndex = parseInt(data.get("questionIndex"));
//     const answer = data.get("answer");

//     // Collect the answer
//     if (!surveyAnswers[userId]) {
//         surveyAnswers[userId] = [];
//     }
//     surveyAnswers[userId][questionIndex] = answer;

//     // Send the next question or finish the survey
//     sendSurveyCarousel(replyToken, userId, questionIndex + 1);
// }

// async function pushSurveyAnswers(userId, answers) {
//     const surveyData = {
//         userId: userId,
//         answers: answers
//     };

//     const serverEndpoint = "https://yourserver.com/api/survey";  // Replace with your actual server endpoint
//     const headers = {
//         "Content-Type": "application/json",
//     };

//     try {
//         const response = await fetch(serverEndpoint, {
//             method: "POST",
//             headers: headers,
//             body: JSON.stringify(surveyData),
//         });
//         if (!response.ok) {
//             console.error("Failed to push survey answers:", response.statusText);
//         }
//     } catch (error) {
//         console.error("Error pushing survey answers:", error);
//     }
// }

async function generateQR(replyToken) {
    const qrData = 'Your QR Code Data'; // Replace with your actual QR code data
    try {
        const url = await generateQRCodeUrl(qrData);
        console.log('Generated QR code URL:', url);
        sendFlexMessage(replyToken, url);
    } catch (err) {
        console.error('Failed to generate QR code:', err.message);
        sendReplyMessage(replyToken, 'Failed to generate QR code.');
    }
}

async function generateQRCodeUrl(qrData) {
    return new Promise((resolve, reject) => {
        QRCode.toDataURL(qrData, (err, url) => {
            if (err) {
                reject(err);
            } else {
                resolve(url);
            }
        });
    });
}

async function sendPromotionCarousel(replyToken) {
    const carousel = {
        type: "carousel",
        contents: [
            {
                type: "bubble",
                hero: {
                    type: "image",
                    url: "https://service-api.auto1.co.th/media/4025/web-bro5-6-%E0%B8%8B-%E0%B8%AD%E0%B8%A1-02.jpg",
                    size: "full",
                    aspectRatio: "20:13",
                    aspectMode: "cover",
                },
                body: {
                    type: "box",
                    layout: "vertical",
                    contents: [
                        {
                            type: "text",
                            text: "Promotion 1",
                            weight: "bold",
                            size: "xl",
                        },
                        {
                            type: "text",
                            text: "Description of Promotion 1",
                            wrap: true,
                            margin: "md",
                        },
                    ],
                },
                action: {
                    type: "uri",
                    label: "View Details",
                    uri: "https://uat-stk.thaiwatsadu.com/survey/",
                },
            },
            // Add more bubble objects for additional promotions
        ],
    };

    const flexMessage = {
        type: "flex",
        altText: "Promotion Carousel",
        contents: carousel
    };

    sendFlex(replyToken, flexMessage);
}

async function sendFlexMessage(replyToken, imageUrl) {
    const flexMessage = {
        type: "flex",
        altText: "QR Code",
        contents: {
            type: "bubble",
            body: {
                type: "box",
                layout: "vertical",
                contents: [
                    {
                        type: "image",
                        url: imageUrl,
                        size: "full",
                        aspectMode: "cover",
                    },
                ],
            },
        },
    };

    sendFlex(replyToken, flexMessage);
}

async function sendFlex(replyToken, flexMessage) {
    const lineReplyEndpoint = "https://api.line.me/v2/bot/message/reply";
    const headers = {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${channelAccessToken}`,
    };

    const body = {
        replyToken: replyToken,
        messages: [flexMessage],
    };

    // Send POST request to LINE Messaging API to reply with the Flex Message
    try {
        console.log(channelAccessToken);
        const response = await fetch(lineReplyEndpoint, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Failed to send Flex Message:", response.statusText, errorText);
        }
    } catch (error) {
        console.error("Error sending Flex Message:", error);
    }
}

async function sendReplyMessage(replyToken, text) {
    const message = {
        type: "text",
        text: text,
    };
    replyToUser(replyToken, message);
}

async function replyToUser(replyToken, message) {
    const lineReplyEndpoint = "https://api.line.me/v2/bot/message/reply";
    const headers = {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${channelAccessToken}`,
    };
    const body = {
        replyToken: replyToken,
        messages: [message],
    };

    // Send POST request to LINE Messaging API to reply to the user
    try {
        console.log(channelAccessToken);
        const response = await fetch(lineReplyEndpoint, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            console.error("Failed to send reply:", response.statusText);
        }
    } catch (error) {
        console.error("Error sending reply:", error);
    }
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
