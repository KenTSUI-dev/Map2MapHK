var url = window.location.href;

try {
    document.addEventListener("requestXYZ", function (msg) {
        if (url.includes("ozp.tpb.gov.hk")) {
            var data = {
                o1: myMap.extent.getCenter().x,
                o2: myMap.extent.getCenter().y,
                o3: myMap.getLevel() / 9.0, //Standardize z from 0 to 1 linearly
                crs: "EPSG:2326"
            };
        } else if (url.includes("map.gov.hk")) {
            var data = {
                o1: GeoInfoMap.Viewer.MapView().center.x,
                o2: GeoInfoMap.Viewer.MapView().center.y,
                o3: (GeoInfoMap.Viewer.MapView().zoom - 11) / (20 - 11), //Standardize z from 0 to 1 linearly
                crs: "EPSG:2326"
            };
        } else if (url.includes("gish.amo.gov.hk/internet/index.html")) {
            var data = {
                o1: map.extent.getCenter().x,
                o2: map.extent.getCenter().y,
                o3: map.getLevel() / 10.0, //Standardize z from 0 to 1 linearly
                crs: "EPSG:2326"
            };
        } else if(url.includes("treeregister.greening.gov.hk/map/treeIndex.aspx")) {
            var data = {
                o1: map.center.lng(),
                o2: map.center.lat(),
                o3: (map.zoom -11)/ (20-11),
                crs: "EPSG:4326"
            };
        } else if(url.includes("cedmap.epd.gov.hk")){
            var data = {
                o1: OdenMap.olMap.getView().getCenter()[0],
                o2: OdenMap.olMap.getView().getCenter()[1],
                o3: (OdenMap.olMap.getView().getZoom()-3.3 )/8, //Standardize z from 0 to 1 linearly
                crs: "EPSG:2326"
            }
        } else {
            return;
        }
        // Message Path: inject.js => content_script.js
        document.dispatchEvent(
            new CustomEvent("dispatchXYZ", { detail: data })
        );
    });
} catch (err) {
    console.log(err);
}

try {
    if (url.includes("gish.amo.gov.hk/internet/index.html")) {
        const urlParams = new URLSearchParams(window.location.search);
        const x = parseFloat(urlParams.get("m2mX"));
        const y = parseFloat(urlParams.get("m2mY"));
        const z = parseFloat(urlParams.get("m2mZ"));

        function waitForMap() {
            console.info("setextent");
            try {
                //Stop reloading the last bookmarked location.
                window.localStorage.clear();
                //Pan to the location according to the URL parameters.
                let ext = map.extent;
                ext.update(
                    x - 1000,
                    y - 1000,
                    x + 1000,
                    y + 1000,
                    map.spatialReference
                );
                map.setExtent(ext);
                map.setLevel(z);
            } catch (e) {
                setTimeout(waitForMap, 250);
            }
        }

        if (!isNaN(x) & !isNaN(y) & !isNaN(z)) {
            waitForMap();
        }
    } else if(url.includes("treeregister.greening.gov.hk/map/treeIndex.aspx")) {
        const urlParams = new URLSearchParams(window.location.search);
        const x = parseFloat(urlParams.get("m2mX"));
        const y = parseFloat(urlParams.get("m2mY"));
        const z = parseFloat(urlParams.get("m2mZ"));

        function moveToLocation(){
            try {
                const center = new google.maps.LatLng(x, y);
                map.panTo(center);
                map.setZoom(z);
            } catch (e) {
                setTimeout(moveToLocation, 250);
            }
          }

        if (!isNaN(x) & !isNaN(y) & !isNaN(z)) {
            moveToLocation();
        }
    }
} catch (e) {
    console.info(e);
}