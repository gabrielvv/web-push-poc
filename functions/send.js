/* Import faunaDB sdk */
const faunadb = require('faunadb');
const webpush = require('web-push');
const q = faunadb.query;

require('dotenv').config();

exports.handler = async (event, context) => {
    webpush.setVapidDetails(
        process.env.WEBPUSH_SUBJECT,
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );

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
                const subscriptionList = ret.map(obj => ({
                    ref: obj.ref,
                    ...obj.data
                }));
                // console.log(subscriptionList)
                return Promise.all(subscriptionList.map(subscription => {
                    return webpush.sendNotification(subscription, 'notification')
                        .then(function() {
                            console.log('Push Application Server - Notification sent to ' + subscription.endpoint);
                        }).catch(function() {
                            console.log('ERROR in sending Notification, endpoint removed ' + subscription.endpoint);
                            return client.query(q.Delete(
                                q.Ref(subscription.ref)
                            ))
                        });
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