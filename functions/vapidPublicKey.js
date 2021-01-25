require('dotenv').config();

exports.handler = async function (event, context) {
    return {
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        statusCode: 200,
        body: process.env.VAPID_PUBLIC_KEY
    };
}
