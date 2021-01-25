require('dotenv').config();

exports.handler = async function (event, context) {
    return {
        statusCode: 200,
        body: process.env.VAPID_PUBLIC_KEY
    };
}
