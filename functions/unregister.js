/* Import faunaDB sdk */
const faunadb = require('faunadb')
const q = faunadb.query

// FIXME
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

    /* configure faunaDB Client with our secret */
    const client = new faunadb.Client({
        secret: process.env.FAUNADB_SERVER_SECRET
    })
    const data = JSON.parse(event.body)
    console.log(`Function 'unregister' invoked. delete id: ${data.endpoint}`)
    return client.query(q.Delete(
        q.Ref(q.Collection(process.env.FAUNADB_COLLECTION), data.endpoint)
    ))
        .then((response) => {
            console.log('success', response)
            return {
                headers: {
                    "Access-Control-Allow-Origin": "*"
                },
                statusCode: 200,
                body: JSON.stringify(response)
            }
        }).catch((error) => {
            console.log('error', error)
            return {
                headers: {
                    "Access-Control-Allow-Origin": "*"
                },
                statusCode: 400,
                body: JSON.stringify(error)
            }
        })
}