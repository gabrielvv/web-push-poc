// Register a Service Worker.
navigator.serviceWorker.register('service-worker.js');

const baseUrl = 'https://clever-bohr-4d8306.netlify.app/.netlify/functions'

navigator.serviceWorker.ready
    .then(function (registration) {
        return registration.pushManager.getSubscription()
            .then(async function (subscription) {
                // Get the server's public key
                const response = await fetch(`${baseUrl}/vapidPublicKey`);
                const vapidPublicKey = await response.text();

                const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

                if (!subscription) {
                    subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: convertedVapidKey
                    })

                    await fetch(`${baseUrl}/register`, {
                        method: 'post',
                        headers: {
                            'Content-type': 'application/json'
                        },
                        body: JSON.stringify({
                            subscription: subscription
                        }),
                    });
                }

                document.getElementById('doIt').onclick = function () {
                    fetch(`${baseUrl}/send`, {
                        method: 'post',
                        headers: {
                            'Content-type': 'application/json'
                        },
                        body: {},
                    });
                };
            });
});