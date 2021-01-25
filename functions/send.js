/* Import faunaDB sdk */
const faunadb = require('faunadb');
const webpush = require('web-push');
const q = faunadb.query;

require('dotenv').config();

exports.handler = async (event, context) => {
    webpush.setVapidDetails({
        subject: process.env.WEBPUSH_SUBJECT,
        publicKey: process.env.VAPID_PUBLIC_KEY,
        privateKey: process.env.VAPID_PRIVATE_KEY
    })

    console.log('Function `send` invoked')
    /* configure faunaDB Client with our secret */
    const client = new faunadb.Client({
        secret: process.env.FAUNADB_SERVER_SECRET
    })
    return client.query(q.Paginate(q.Documents(q.Collection(process.env.FAUNADB_COLLECTION))))
        .then(response => {
            const subscriptionRefs = response.data
            console.log('Subscription refs', subscriptionRefs)
            console.log(`${subscriptionRefs.length} subscriptions found`)
            const getAllSubscriptionDataQuery = subscriptionRefs.map((ref) => {
                return q.Get(ref)
            })
            // then query the refs
            return client.query(getAllSubscriptionDataQuery).then((ret) => {
                const subscriptionList = ret.map(obj => obj.data);
                return Promise.all(subscriptionList.map(subscription => {
                    return webpush.sendNotification(subscription, 'notification');
                }));
            })
        }).catch((error) => {
            console.log('error', error)
            return {
                statusCode: 400,
                body: JSON.stringify(error)
            }
        })
};