const apiKeys = {
    main: '4babad42-5fba-49ea-8022-b4b5d42514d7',
    directory: 'runmaq4411'
}

const map = new mapgl.Map('container', {
    center: [55.31878, 25.23584],
    zoom: 13,
    key: apiKeys.main,
    style: 'c080bb6a-8134-4993-93a1-5b4d8c36a59b'
});
const ruler = new mapgl.Ruler(map, { enable: true });
let markerList = []

const destinationInput = document.getElementById("destination")

const controlContent = `
<div class="buttonRoot" id="find-me">
    <button class="button">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
        >
            <path
                fill="currentColor"
                d="M17.89 26.27l-2.7-9.46-9.46-2.7 18.92-6.76zm-5.62-12.38l4.54 1.3 1.3 4.54 3.24-9.08z"
            />
        </svg>
    </button>
</div>
`;

const control = new mapgl.Control(map, controlContent, {
    position: 'topRight',
});
let userMarker;
let finishMarker;

const statusT = document.querySelector('#status');
const buttonIds = ['interesting_places', "architecture", "natural", "industrial_facilities", "religion", "natural", "cultural", "historic"]
let destin = ""
    //=======================================================


window.onload = function() {
    map.on('click', function(e) {
        if (finishMarker) finishMarker.destroy()
        finishMarker = createMarker(e.lngLat[0], e.lngLat[1])
    })

    destinationInput.addEventListener('input', function(e) {
        let request = new XMLHttpRequest();
        request.open('GET', "https://catalog.api.2gis.com/3.0/suggests?q=" + destinationInput.value + "&suggest_type=route_endpoint&key=" + apiKeys.directory)
        request.onload = function() {}
        request.send()
    })

    control
        .getContainer()
        .querySelector('#find-me')
        .addEventListener('click', geoFindMe);

    geoFindMe()

    buttonIds.forEach(id => {
        document.getElementById(id).onclick = (e) => {
            if (document.activeElement.checked)
                destin += id + ",";
            else
                destin = destin.replace(id + ",", "")
        }
    })

    const controlsHtml = `<button id="reset" class="image-button">Reset points</button> `;
    new mapgl.Control(map, controlsHtml, {
        position: 'topRight',
    });

    const resetButton = document.getElementById('reset');
    resetButton.addEventListener('click', function() {
        ruler.destroy();
        ruler.enable();
    });
}




const directions = new mapgl.Directions(map, {
    directionsApiKey: '4babad42-5fba-49ea-8022-b4b5d42514d7',
});

document.getElementById("findRouteBtn").onclick = function(e) {
    if (userMarker && finishMarker) {
        findRoutePoints(userMarker.options.coordinates, finishMarker.getCoordinates())
    } else if (!userMarker) {
        showToast("Местоположение не определено")
    } else {
        showToast("Выберите пункт назначения")
    }

}