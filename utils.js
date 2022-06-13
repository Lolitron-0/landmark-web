//creates and returns new marker
function createMarker(lon, lat, deletable = false) {
    const newMarker = new mapgl.Marker(map, {
        coordinates: [lon, lat],
        icon: "media/marker.png",
        hoverIcon: "media/marker_hover.png",
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

    let requestString = "https://api.opentripmap.com/0.1/ru/places/radius?radius={RADIUS}&{COORDS}&{KIND}&rate=3&format=json&limit=10&apikey=5ae2e3f221c38a28845f05b69276174a1cdb303095e66db6574e28b6";
    let foundSights = []
    requestString = requestString
        .replace("{COORDS}", "lon=" + start[0] + "&lat=" + start[1])
        .replace("{KIND}", destin.slice(0, -1))
        .replace("{RADIUS}", Math.round(distanceBetweenInMeters(start, finish)))
    var request = new XMLHttpRequest();
    request.open('GET', requestString);
    request.onload = function() {
        destroySightMarkers()
        JSON.parse(request.response).forEach(element => {
            console.log("object");
            createMarker(element.point.lon, element.point.lat)
            if (element.point.lat > start[1]) {
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
        directions.pedestrianRoute({
            points: routePoints
        });

        return routePoints
    };
    request.send();


}


//=========================================================================

//проверка попадания в полуокружность
//start - текущая позиция 
//point - точка достопримечательности
function checkPoint(start, point) {
    return point[1] > start[1] && distanceBetweenInMeters(start, point) <= 500 * 500
}

function distanceBetweenInMeters(point1, point2) {
    return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2)) * 111.3 * 1000
}