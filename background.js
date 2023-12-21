//***********************************************************************
// Grey out the extensions's icon if the tab is in not-supported websites
//***********************************************************************
chrome.tabs.onUpdated.addListener(function (tabId, change, tab) {
    let url = tab.url;
    if (url == undefined) {
        return;
    } else if (
        /google[\w\.]+\/maps/.test(url) ||
        // url.includes("ozp.tpb.gov.hk") ||
        url.includes("map.gov.hk") ||
        url.includes("earth.google.com/web") ||
        url.includes("gish.amo.gov.hk/internet/index.html")||
        url.includes("treeregister.greening.gov.hk/map/treeIndex.aspx") ||
    ) {
        // chrome.browserAction.setPopup({tabId: tabId, popup: '../html/popup.html'});
        chrome.browserAction.setIcon({
            path: "../images/logo128.png",
            tabId: tabId,
        });
        // console.log('matched');
    } else {
        // chrome.browserAction.setPopup({tabId: tabId, popup: ''});
        chrome.browserAction.setIcon({
            path: "../images/logo128-disabled.png",
            tabId: tabId,
        });
        // console.log('not matching');
    }
});
