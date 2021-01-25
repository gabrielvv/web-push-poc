self.addEventListener('push', function (event) {
    const payload = event.data ? event.data.json() : 'no payload';
    setTimeout(() => {
        event.waitUntil(
            self.registration.showNotification('ServiceWorker Cookbook', {
                body: payload.delay,
            })
        );
    }, payload.delay)

});

