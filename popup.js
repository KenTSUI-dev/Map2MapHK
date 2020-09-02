$(function () {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
    var url = tabs[0].url;
    let windowId = tabs[0].windowId;
    let index = tabs[0].index;

    console.log(url);
    if (url.includes("google.com/maps")) {
      from_map = "googlemap";
    } else if (url.includes("ozp.tpb.gov.hk")) {
      from_map = "ozp";
    } else if (url.includes("map.gov.hk")) {
      from_map = "geoinfomap";
    } else if (url.includes("earth.google.com/web")) {
      from_map = "googleearth";
    } else {
      document.querySelector(".not-support").style.display = "flex";
      return;
    }
    for (var to_map of Object.keys(mapinfo)) {
      if (to_map == from_map) {
        continue;
      }
      var div = document.createElement("div");
      div.setAttribute("class", "menu-item menu-area menu-find");
      div.setAttribute("id", to_map);
      var div2 = document.createElement("div");
      div2.setAttribute("class", "flex-1");
      div2.textContent = mapinfo[to_map].name;

      var openSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
      _use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      openSvg.setAttribute("class", "icon icon-open")
      _use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#iconOpen');
      openSvg.appendChild(_use);

      document.body.appendChild(div);
      div.appendChild(openSvg);
      div.appendChild(div2);

      $(`#${to_map}`).click(
        { from_map: from_map, to_map: to_map },
        async function (e) {
          from_map = e.data.from_map;
          to_map = e.data.to_map;
          var geo = await mapinfo[from_map].xyz();
          var xy = proj4("EPSG:2326", mapinfo[to_map].url_crs, [
            geo.o1,
            geo.o2,
          ]);
          if (mapinfo[to_map].is_zoom) {
            var z = Math.round(
              geo.o3 * (mapinfo[to_map].o31 - mapinfo[to_map].o30) +
                mapinfo[to_map].o30
            );
            z > mapinfo[to_map].o31 && (z = mapinfo[to_map].o31);
            z < mapinfo[to_map].o30 && (z = mapinfo[to_map].o30);
          } else {
            var z =
              geo.o3 *
                (Math.log10(mapinfo[to_map].o31) -
                  Math.log10(mapinfo[to_map].o30)) +
              Math.log10(mapinfo[to_map].o30);

            z = Math.round(10 ** z);
            z > mapinfo[to_map].o30 && (z = mapinfo[to_map].o30);
            z < mapinfo[to_map].o31 && (z = mapinfo[to_map].o31);
          }

          var newURL = mapinfo[to_map].url.format(xy[0], xy[1], z);
          // console.log(geo)
          chrome.tabs.create({
             url: newURL,
             windowId: windowId,
             index : index+1,
            });
        }
      );
    }
  });


  $("#info").click( ()=> {
    chrome.runtime.openOptionsPage();
  });

  $("#info2").click( ()=> {
    chrome.runtime.openOptionsPage();
  });

});

function GetGoogleMapXYZ() {
  return new Promise((resolve, reject) => {
    try {
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (
        tabs
      ) {
        let url = tabs[0].url;
        // use `url` here inside the callback because it's asynchronous!
        var params = url.split("@")[1].split("/")[0].split(",");
        var geo = { lat: parseFloat(params[0]), long: parseFloat(params[1]) };
        var xy = proj4("EPSG:4326", "EPSG:2326", [geo.long, geo.lat]);
        geo.o1 = xy[0];
        geo.o2 = xy[1];
        for (var ele of params.slice(2)) {
          geo[ele.slice(-1)] = parseFloat(ele.slice(0, -1));
        }

        //Standardize z from 0 to 1 linearly
        if (geo["z"]) {
          geo["o3"] =
            (geo["z"] - mapinfo.googlemap.z0) /
            (mapinfo.googlemap.z1 - mapinfo.googlemap.z0);
        } else if (geo["m"]) {
          geo["o3"] =
            1 -
            (Math.log10(geo["m"]) - Math.log10(mapinfo.googlemap.m0)) /
              (Math.log10(mapinfo.googlemap.m1) -
                Math.log10(mapinfo.googlemap.m0));
        } else if (geo["a"]) {
          geo["o3"] =
            1 -
            (Math.log10(geo["a"]) - Math.log10(mapinfo.googlemap.a0)) /
              (Math.log10(mapinfo.googlemap.a1) -
                Math.log10(mapinfo.googlemap.a0));
        }

        resolve(geo);
      });
    } catch (e) {
      reject(e);
    }
  });
}

function GetGoogleEarthXYZ() {
  return new Promise((resolve, reject) => {
    try {
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (
        tabs
      ) {
        let url = tabs[0].url;
        // use `url` here inside the callback because it's asynchronous!
        var params = url.split("@")[1].split("/")[0].split(",");
        var geo = { lat: parseFloat(params[0]), long: parseFloat(params[1]) };
        var xy = proj4("EPSG:4326", "EPSG:2326", [geo.long, geo.lat]);
        geo.o1 = xy[0];
        geo.o2 = xy[1];
        for (var ele of params.slice(2)) {
          geo[ele.slice(-1)] = parseFloat(ele.slice(0, -1));
        }

        //Standardize z from 0 to 1 linearly
        if (geo["d"]) {
          geo["o3"] =
            (Math.log10(geo["d"]) - Math.log10(mapinfo.googleearth.d0)) /
            (Math.log10(mapinfo.googleearth.d1) -
              Math.log10(mapinfo.googleearth.d0));
        }

        resolve(geo);
      });
    } catch (e) {
      reject(e);
    }
  });
}

function GetXYZ() {
  // Message Path: popup.js => content_script.js
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (
      tabs
    ) {
      chrome.tabs.sendMessage(tabs[0].id, { requestXYZ: true }, function (
        response
      ) {
        console.log(tabs[0].title);
        resolve(response.geo);
      });
    });
  });
}

String.prototype.format = function () {
  var formatted = this;
  for (var arg in arguments) {
    formatted = formatted.split("{" + arg + "}").join(arguments[arg]);
  }
  return formatted;
};

proj4.defs(
  "EPSG:2326",
  "+proj=tmerc +lat_0=22.31213333333334 +lon_0=114.1785555555556 +k=1 +x_0=836694.05 +y_0=819069.8 +ellps=intl +towgs84=-162.619,-276.959,-161.764,0.067753,-2.24365,-1.15883,-1.09425 +units=m +no_defs"
);

var mapinfo = {
  googlemap: {
    name: "Google Map",
    url_crs: "EPSG:4326", // CRS used in the url which may not be the same as the map's.
    o30: 11, // zoom out most while HK is still occupying most of the screen
    o31: 20, // zoom in most, while tally with the zoom-most level of other map
    url: "https://www.google.com/maps/@{1},{0},{2}z",
    is_zoom: true,
    xyz: GetGoogleMapXYZ,
    z0: 11, // zoom out most while HK is still occupying most of the screen
    z1: 20, // zoom in most, while tally with the zoom-most level of other map
    m0: 123,
    m1: 62700,
    a0: 192,
    a1: 99695,
  },
  ozp: {
    name: "Outline Zoning Plan",
    url_crs: "EPSG:2326",
    o30: 0,
    o31: 9,
    url:
      "https://www2.ozp.tpb.gov.hk/gos/?x={0}&y={1}&z={2}&b=basemap_0&l=7-1-0-0.7%2C18-1-1-0.0%2C14-1-0-0.7%2C19-1-0-0.7%2C20-1-0-0.7",
    is_zoom: true,
    xyz: GetXYZ,
    z0: 0,
    z1: 9,
  },
  geoinfomap: {
    name: "GeoInfo Map",
    url_crs: "EPSG:4326",
    o30: 288895,
    o31: 564,
    xyz: GetXYZ,
    url: "https://www.map.gov.hk/gm/geo:{1},{0}?z={2}",
    is_zoom: false,
    z0: 11,
    z1: 20,
    s0: 288895,
    s1: 564,
  },
  googleearth: {
    name: "Google Earth",
    url_crs: "EPSG:4326",
    o30: 3163840,
    o31: 10000,
    xyz: GetGoogleEarthXYZ,
    url: "https://earth.google.com/web/@{1},{0},20a,{2}d,1y,0h,0t,0r",
    is_zoom: false,
    d0: 3163840,
    d1: 10000,
  },
};
