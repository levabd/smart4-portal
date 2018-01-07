/**
 * Created by Levabd on 18-Nov-16.
 */
//$("#leak-submit").on('click', function() {

//});

var map;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 51.509865, lng: -0.118092},
        zoom: 11,
        styles: [{"stylers": [{"hue": "#2c3e50"}, {"saturation": 250}]}, {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [{"lightness": 50}, {"visibility": "simplified"}]
        }, {
            "featureType": "road",
            "elementType": "labels",
            "stylers": [{"visibility": "off"}]
        }]
    });

    var leakCounter = 0;

    waterData.clusters.forEach(function (cluster) {
        cluster.geometry.coordinates[0].forEach(function (polygon) {
            if (leakCounter < 500) {
                var leakCircle = new google.maps.Circle({
                    strokeColor: 'white',
                    strokeOpacity: 0.8,
                    strokeWeight: .5,
                    fillColor: Math.floor(Math.random() * 2) ? 'red' : 'green',
                    fillOpacity: .2,
                    map: map,
                    center: {
                        lat: polygon[0][1],
                        lng: polygon[0][0]
                    },
                    radius: 300 + cluster.properties.id
                });

                leakCounter++;
            }
        });
    });
}
