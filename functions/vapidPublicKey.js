require('dotenv').config();

exports.handler = async function (event, context) {
    if (event.httpMethod === 'OPTIONS') {
        return {
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            statusCode: 200,
        };
    }

    return {
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        statusCode: 200,
        body: process.env.VAPID_PUBLIC_KEY
    };
}
