mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/satellite-streets-v11', // style URL
    center: [campgroundLong, campgroundLat], // starting position [lng, lat]
    zoom: 9 // starting zoom
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());
// Create a default Marker and add it to the map.
new mapboxgl.Marker()
    .setLngLat([campgroundLong, campgroundLat])
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h5>${campgroundTitle}</h5><p>${campgroundLocation}</p>`
            )
    )
    .addTo(map);