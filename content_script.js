console.log("MapSwitch Content Script starts!");

var s = document.createElement("script");
// TODO: add "inject.js" to web_accessible_resources in manifest.json
s.src = chrome.runtime.getURL("inject.js");
s.onload = function () {
  this.remove();
};
(document.head || document.documentElement).appendChild(s);


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.requestXYZ) {
    // Message Path: inject.js => content_script.js => popup.js
    document.addEventListener("dispatchXYZ", function (e) {
    var geo = e.detail;
    console.log("Listener received dispatchXYZ: ", geo);
    sendResponse({ geo: geo });
    });
    
    // Message Path: content_script.js => inject.js
    document.dispatchEvent(new CustomEvent("requestXYZ", { detail: true }));
  }
});
