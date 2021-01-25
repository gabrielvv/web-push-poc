/* Import faunaDB sdk */
const faunadb = require('faunadb');
const webpush = require('web-push');
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

    webpush.setVapidDetails(
        process.env.WEBPUSH_SUBJECT,
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );

    console.log('Function `send` invoked')

    const client = new faunadb.Client({
        secret: process.env.FAUNADB_SERVER_SECRET
    })
    const response = await client.query(q.Paginate(q.Documents(q.Collection(process.env.FAUNADB_COLLECTION))))
    const subscriptionRefs = response.data;

    console.log('Subscription refs', subscriptionRefs);
    console.log(`${subscriptionRefs.length} subscriptions found`);
    const getAllSubscriptionDataQuery = subscriptionRefs.map((ref) => {
        return q.Get(ref);
    });

    const ret = await client.query(getAllSubscriptionDataQuery);
    const subscriptionList = ret.map(obj => ({
        ref: obj.ref,
        data: obj.data
    }));
    console.log(subscriptionList)

    const errors = [];
    for (let i = 0; i < subscriptionList.length; i++) {
        const subscription = subscriptionList[i];
        const subscriptionData = subscription.data;
        try {
            await webpush.sendNotification(subscriptionData, `notification ${i}`)
            console.log('Push Application Server - Notification sent to ' + subscriptionData.endpoint);
        } catch (err) {
            errors.push(err.message);
            console.log(err.statusCode, err.message);
            console.log('ERROR in sending Notification, endpoint removed ' + subscriptionData.endpoint);
            await client.query(q.Delete(
                q.Ref(subscription.ref)
            ));
        }
    }

    return {
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        statusCode: errors.length ? 400 : 200,
        body: errors.length ? JSON.stringify(errors) : "",
    };
}
