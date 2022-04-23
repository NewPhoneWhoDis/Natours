export const displayMap = locations => {
    mapboxgl.accessToken = 'pk.eyJ1IjoidXNlcjAxMDEiLCJhIjoiY2wyYjFhOGQ2MGIwaTNjc2M2NXNzcmFwcSJ9.T8qyaiWBpcuxJfRLsmlahg';

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/user0101/cl2b1vtsl00pd14mqya2o6gb9',
        scrollZoom: false
    });

    // Figure out position of the map based on tours
    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(loc => {
        // Creates a marker
        const el = document.createElement('div');
        el.className = 'marker';

        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        })
            .setLngLat(loc.coordinates)
            .addTo(map);

        new mapboxgl.Popup({
            offset: 30
        })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
            .addTo(map);

        // Extends the map bounds in order to include the current location
        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });
};
