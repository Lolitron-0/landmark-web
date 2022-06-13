const markerPoints = []



const map = new mapgl.Map('container', {
    center: [55.31878, 25.23584],
    zoom: 13,
    key: '4babad42-5fba-49ea-8022-b4b5d42514d7',
    style: 'c080bb6a-8134-4993-93a1-5b4d8c36a59b'
});

map.on('click', function(e) {
    markerPoints.push([e.lngLat[0], e.lngLat[1]])
    const newMarker = new mapgl.Marker(map, {
        coordinates: [e.lngLat[0], e.lngLat[1]],
        icon: "media/marker.png",
        hoverIcon: "media/marker_hover.png",
    })

    newMarker.on('click', function(e) {
        newMarker.destroy()
    });
})


const destinationInput = document.getElementById("destination")

destinationInput.addEventListener('input', function(e) {
    let request = new XMLHttpRequest();
    request.open('GET', "https://catalog.api.2gis.com/3.0/suggests?q=" + destinationInput.value + "&suggest_type=route_endpoint&key=4babad42-5fba-49ea-8022-b4b5d42514d7")
    request.onload = function() {
        console.log("");
    }
    request.send()
})



//=======================================================

var getting_string = "https://api.opentripmap.com/0.1/ru/places/radius?radius=5000&{COORDS}&rate=3&format=geojson&limit=2&apikey=5ae2e3f221c38a28845f05b69276174a1cdb303095e66db6574e28b6";

var start_lon = map.getCenter()[0];
var start_lat = map.getCenter()[1];
var new_help = "lon=" + start_lon + "&lat=" + start_lat;
getting_string = getting_string.replace("{COORDS}", new_help)
var request = new XMLHttpRequest();
request.open('GET', getting_string);
request.onload = function() {
    console.log("");
};
request.send();




const directions = new mapgl.Directions(map, {
    directionsApiKey: '4babad42-5fba-49ea-8022-b4b5d42514d7',
});

document.getElementById("findRouteBtn").onclick = function(e) {
    directions.pedestrianRoute({
        points: markerPoints
    });
}