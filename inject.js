var url = window.location.href;

try {
  document.addEventListener("requestXYZ", function (msg) {
    if (url.includes("ozp.tpb.gov.hk")) {
      var data = {
        o1: myMap.extent.getCenter().x,
        o2: myMap.extent.getCenter().y,
        o3: myMap.getLevel()/9.0, //Standardize z from 0 to 1 linearly
      };
    } else if (url.includes("map.gov.hk")) {
      var data = {
        o1: GeoInfoMap.Viewer.MapView().center.x,
        o2: GeoInfoMap.Viewer.MapView().center.y,
        o3: (GeoInfoMap.Viewer.MapView().zoom - 11)/(20 - 11), //Standardize z from 0 to 1 linearly
      };
    } else {
      return;
    }
    // Message Path: inject.js => content_script.js
    document.dispatchEvent(new CustomEvent("dispatchXYZ", { detail: data }));
  });
} catch (err) {
  console.log(err)
}


  