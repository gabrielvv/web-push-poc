/* Import faunaDB sdk */
const faunadb = require('faunadb');
const q = faunadb.query;

require('dotenv').config();

exports.handler = async (event, context) => {
    if (event.httpMethod === 'OPTIONS') {
        return {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Allow": "OPTIONS, POST",
                "Access-Control-Allow-Headers": "content-type",
            },
            statusCode: 200,
        };
    }

    const client = new faunadb.Client({
        secret: process.env.FAUNADB_SERVER_SECRET
    })
    const data = JSON.parse(event.body)
    console.log('Function `register` invoked', data)
    const subscriptionItem = {
        data,
    }

    try {
        try {
            const {data: subscriptionWithEndpoint} = await client.query(q.Get(
                q.Match(
                    q.Index("subscription_by_endpoint"),
                    data.endpoint,
                )
            ));
            if (subscriptionWithEndpoint) {
                console.log('already registered')
                return {
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                    },
                    statusCode: 200,
                }
            }
        } catch (err) {
            console.error(err.message)
        }
        const response = await client.query(q.Create(q.Collection(process.env.FAUNADB_COLLECTION), subscriptionItem))
        console.log('success', response)
        return {
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            statusCode: 200,
            body: JSON.stringify(response)
        }
    } catch(error) {
        console.log('error', error)
        return {
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            statusCode: 400,
            body: JSON.stringify(error)
        }
    }
};