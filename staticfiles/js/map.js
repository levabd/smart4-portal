function generateRandomColor(number) {
    return '#' + md5(number.toString()).substr(0, 6);
}

function initMap() {

    // Styles a map in night mode.
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 51.509865, lng: -0.118092},
        zoom: 10,
        styles: [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"color":"#000000"},{"lightness":13}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#144b53"},{"lightness":14},{"weight":1.4}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#08304b"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#0c4152"},{"lightness":5}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#0b434f"},{"lightness":25}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#0b3d51"},{"lightness":16}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"}]},{"featureType":"transit","elementType":"all","stylers":[{"color":"#146474"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#021019"}]}]
    });

    var infowindow = new google.maps.InfoWindow();

    // Construct the full polygon.
    var allclusterPoly = new google.maps.Polygon({
        paths: gbrOuterBounds,
        strokeOpacity: 0,
        strokeWeight: 0,
        fillOpacity: 0
    });

    google.maps.event.addListener(allclusterPoly, "mouseover", function (event) {
        infowindow.close();
    });

    allclusterPoly.setMap(map);

    var clusterColor = "#fff";

    waterData.clusters.forEach(function(cluster) {
        clusterColor = generateRandomColor(cluster.properties.id);

        var polygonCoords = [];

        cluster.geometry.coordinates[0].forEach(function(polygon) {
            var simplePolygonCoords = [];
            polygon.forEach(function (coordinates) {
                simplePolygonCoords.push({lat: coordinates[1], lng: coordinates[0]});
            });

            var simplePoly = new google.maps.Polygon({
                paths: simplePolygonCoords
            });

            if(google.maps.geometry.spherical.computeArea(simplePoly.getPath()) > 5000000) {
                simplePolygonCoords.forEach(function (entry) {
                    polygonCoords.push(entry);
                });
            }
        });

        // Construct the polygon.
        var clusterPoly = new google.maps.Polygon({
            paths: polygonCoords,
            strokeColor: clusterColor,
            strokeOpacity: 0.15,
            strokeWeight: 1,
            fillColor: clusterColor,
            fillOpacity: 0.55
        });

        var borought = cluster.properties.id === 73 ? 'Metropolitan Borough' +
        ' of Westminster' : '[Borough Name]';

        var contentString =
            '<div id="content">' +
                '<h3>' + borought + '</h3>' +
                '<div id="bodyContent">' +
                    '<table>' +
                        '<tr>' +
                            '<td><b>4.4 Overall Rating</b></td>' +
                            '<td>' +
                                '<i class="fa fa-star"></i>' +
                                '<i class="fa fa-star"></i><i class="fa fa-star"></i>' +
                                '<i class="fa fa-star"></i><i class="fa fa-star-half-o"></i>' +
                            '</td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td><b>4.1</b> Water Efficiency</td>' +
                            '<td><b>4.2</b> Water Quality</td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td><b>3.9</b> Leaks</td>' +
                            '<td><b>4.1</b> Waste Water</td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td><b>3.0</b> Carbon Emissions</td>' +
                            '<td><b>3.5</b> Resiliency</td>' +
                        '</tr>' +
                    '</table>' +
                    '<h4>Click to more...</h4>' +
                '</div>' +
            '</div>';


        google.maps.event.addListener(clusterPoly, "mouseover", function (event) {
            if (this.strokeOpacity != 0.9) {
                infowindow.setPosition(event.latLng);
                infowindow.setContent(contentString);
                infowindow.open(map);
                this.setOptions(
                    {
                        strokeOpacity: 0.9,
                        fillOpacity: 0.9
                    });
            }
        });

        google.maps.event.addListener(clusterPoly, "mouseout", function (event) {
            if (this.strokeOpacity == 0.9) {
                this.setOptions(
                    {
                        strokeOpacity: 0.15,
                        fillOpacity: 0.55
                    });
            }
        });

        google.maps.event.addListener(clusterPoly, 'click', function () {
            $(".dashboard-container").fadeIn();
        });

        clusterPoly.setMap(map);
    });
}


