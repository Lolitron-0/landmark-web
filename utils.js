//creates and returns new marker
function createMarker(lon, lat, deletable = false, label = "") {
    const newMarker = new mapgl.Marker(map, {
        coordinates: [lon, lat],
        icon: "media/marker.png",
        hoverIcon: "media/marker_hover.png",
        label: {
            text: label,
        },
    })
    markerList.push(newMarker)

    if (deletable) {
        newMarker.on('click', function(e) {
            newMarker.destroy()
            markerList.splice(markerList.indexOf(newMarker), 1)
        });
    }
    return newMarker
}

function destroySightMarkers() {
    markerList.forEach(marker => {
        if (marker != finishMarker) marker.destroy()
    });
    markerList = []
}

function showToast(text, time = 5000) {
    statusT.textContent = text
    statusT.style.opacity = 1
    statusT.animate({
            transform: ['translateY(-150px )', 'translateY(0)'],
        },
        1000)
    setTimeout(() => {
        statusT.animate({
            transform: 'translateY(-150px )',
        }, 1000)
        setTimeout(() => { statusT.style.opacity = 0 }, 1000)
    }, 1000 + time);
}

function geoFindMe() {
    if (!navigator.geolocation) {
        showToast('Геолокация не поддерживается вашим браузером')
    } else {
        navigator.geolocation.getCurrentPosition((pos) => {
            map.setCenter([pos.coords.longitude, pos.coords.latitude]);

            if (userMarker) {
                userMarker.destroy();
            }

            userMarker = new mapgl.CircleMarker(map, {
                coordinates: [pos.coords.longitude, pos.coords.latitude],
                radius: 14,
                color: '#0088ff',
                strokeWidth: 4,
                strokeColor: '#ffffff',
                stroke2Width: 6,
                stroke2Color: '#0088ff55',
            });

        }, () => {
            showToast('Не удалось определить местоположение');
        });
    }
}

function findRoutePoints(start, finish) {
    let routePoints = [start]
    let radius = distanceBetweenPointsInMeters(start, finish)
        //let requestString = "https://api.opentripmap.com/0.1/ru/places/radius?radius={RADIUS}&{COORDS}&{KIND}&rate=3&format=json&limit=200&apikey=5ae2e3f221c38a28845f05b69276174a1cdb303095e66db6574e28b6";
        //requestString = requestString
        //    .replace("{COORDS}", "lon=" + start[0] + "&lat=" + start[1])
        //    .replace("{KIND}", destin.slice(0, -1))
        //    //.replace("{RADIUS}", Math.round(radius))
        //    .replace("{RADIUS}", 500)
    let requestString = "https://api.opentripmap.com/0.1/ru/places/bbox?{RECT}&{KIND}&rate=3&format=json&apikey=5ae2e3f221c38a28845f05b69276174a1cdb303095e66db6574e28b6";
    requestString = requestString
        .replace("{KIND}", destin.slice(0, -1))
        .replace("{RECT}", "lon_min=" + Math.min(start[0], finish[0]) + "&lon_max=" + Math.max(start[0], finish[0]) + "&lat_min=" + Math.min(start[1], finish[1]) + "&lat_max=" + Math.max(start[1], finish[1]))
    var request = new XMLHttpRequest();
    request.open('GET', requestString);
    request.onload = function() {
        destroySightMarkers()
        JSON.parse(request.response).forEach(element => {
            console.log("object");
            createMarker(element.point.lon, element.point.lat, false, Math.round(distanceSegPointInMeters([element.point.lon, element.point.lat], start, finish)))
            if (distanceSegPointInMeters([element.point.lon, element.point.lat], start, finish) <= 600) {
                routePoints.push([element.point.lon, element.point.lat])
            }
        });

        console.log(routePoints);
        //let currentPoint = [start[0], start[1]]
        //while (distanceBetweenInMeters(currentPoint, finish) > 500) {
        //    for (let i = 0; i < foundSights.length; i++) {
        //        const sight = foundSights[i];
        //
        //        if (checkPoint(currentPoint, sight)) {
        //            routePoints.push(sight)
        //            createMarker(sight[0], sight[1])
        //            currentPoint = [sight[0], sight[1]]
        //            break
        //        }
        //    }
        //}
        routePoints.push(finish)
        routePoints.sort((a, b) => { return distanceBetweenPointsInMeters(start, a) - distanceBetweenPointsInMeters(start, b) })
        directions.pedestrianRoute({
            points: routePoints,

            style: {
                routeLineWidth: [
                    'interpolate', ['linear'],
                    ['zoom'],
                    10,
                    30,
                    14,
                    3,
                ],
                substrateLineWidth: [
                    'interpolate', ['linear'],
                    ['zoom'],
                    10,
                    30,
                    14,
                    10,
                ]
            }
        }, );
        /*const polyline = new mapgl.Polyline(map, {
            coordinates: [
                start,
                finish
            ],
            width: 10,
            color: '#00b7ff',
        });*/

        return routePoints
    };
    request.send();


}


//=========================================================================

//проверка попадания в полуокружность
//start - текущая позиция 
//point - точка достопримечательности
/*function checkPoint(start, finish, point) {
    return distanceSegPointInMeters(point, start, finish)
}*/

function checkPoint(start, finish, point) {
    return distanceBetweenPointsInMeters(start, finish)
}

function distanceBetweenPointsInMeters(point1, point2) {
    return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2)) * 111.111 * 1000
}

function distanceSegPointInMeters(p, pA, pB) {
    let point = [p[0] * 111.111 * 1000, p[1] * 111.111 * 1000]
    let a = [pA[0] * 111.111 * 1000, pA[1] * 111.111 * 1000]
    let b = [pB[0] * 111.111 * 1000, pB[1] * 111.111 * 1000]
    return Math.abs((b[1] - a[1]) * point[0] - (b[0] - a[0]) * point[1] + b[0] * a[1] - a[0] * b[1]) / Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2))
}

const GRAD_TO_RAD = 0.017