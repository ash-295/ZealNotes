let currentDomain;
let currentDomainCount = 0;

function getAllData(){
    return new Promise((resolve, reject) => {
        chrome.tabs.query({}, function(tabs){
            let imgscr, title, domain;
            for(let i =0; i<tabs.length; i++){
                if(tabs[i].active){
                    imgscr = tabs[i].favIconUrl;
                    title = tabs[i].title;
                    domain = extractDomain(tabs[i].url);
                    resolve({
                        imgscr : imgscr,
                        title : title,
                        domain : domain
                    });
                }
            }
            resolve({
                imgscr : null,
                title : null,
                domain : null
            });
        });
    });
}
async function setAllData(){
    await getAllData()
    .then((urlResponse) => {
        if(urlResponse.imgscr !== null && urlResponse.imgscr !== undefined){
            document.getElementById("active_page_img").setAttribute("src", urlResponse.imgscr);
        }
        else{
            document.getElementById("active_page_img").setAttribute("src", "../assets/earth-asia-solid.svg");
        }
        if(urlResponse.title !== null && urlResponse.title !== undefined){
            document.getElementById("active_page_title").innerHTML = urlResponse.title;
        }
        else{
            document.getElementById("active_page_title").innerHTML = "The Active Page";
        }
        let count = 0;
        chrome.storage.local.get("SavedNotes")
        .then((res) => {
            for(let key in res.SavedNotes){
                if(key == urlResponse.domain){
                    count = res.SavedNotes[key].length;
                }
            }
            currentDomain = urlResponse.domain;
            currentDomainCount = count;
            if(count > 0){
                $("#no_saved_notes").hide();
                $("#saved_notes").show();
                if(count == 1){
                    document.getElementById("notes_count").innerHTML = `${count} Note`
                }
                else{
                    document.getElementById("notes_count").innerHTML = `${count} Notes`
                }
            }
            else{
                $("#saved_notes").hide();
                $("#no_saved_notes").show();
            }
        })
        .catch((err) => {
            console.log(err);
        });
    })
    .catch((err) => {
        console.log("errrorrr");
    });
}
setAllData();

function extractDomain(url) {
    var re = /:\/\/(www\.)?(.+?)\//;
    try {
        return url.match(re)[2];
    } 
    catch (errN1) {
        console.log("errN1: ", errN1);
        return "empty";
    }
}
chrome.tabs.query({}, function(tabs){
    console.log(tabs);
});

// chrome.storage.local.get("SavedNotes")
// .then((res) => {
//     console.log("Check", res);
// })
// .catch((err) => {
//     console.log(err);
// });

// chrome.storage.local.set({
//     SavedNotes : {}
// });

$(document).ready( () => {
    $("#addnotes").click( () => {
        let notes = $("#typed_notes").val();
        if(typeof notes === "string" && notes.length > 0){
            chrome.tabs.query({}, function(tabs){
                let currentTime = new Date().getTime();
                let imgscr, title, url, domain;
                for(let i =0; i<tabs.length; i++){
                    if(tabs[i].active){
                        imgscr = tabs[i].favIconUrl;
                        title = tabs[i].title;
                        url = tabs[i].url;
                        domain = extractDomain(tabs[i].url);
                        break;
                    }
                }
                chrome.storage.local.get("SavedNotes")
                .then( (savedNotes) => {
                    if(savedNotes !== undefined && savedNotes.SavedNotes !== undefined){
                        console.log("Found", savedNotes.SavedNotes[domain]);
                        if(savedNotes.SavedNotes[domain] !== undefined){
                            savedNotes.SavedNotes[domain].push({
                                time : currentTime,
                                imgscr : imgscr,
                                title : title,
                                domain : domain,
                                url : url,
                                note : notes
                            });
                            chrome.storage.local.set({
                                SavedNotes : savedNotes.SavedNotes
                            });
                        }
                        else{
                            savedNotes.SavedNotes[domain] = [];
                            savedNotes.SavedNotes[domain].push({
                                time : currentTime,
                                imgscr : imgscr,
                                title : title,
                                domain : domain,
                                url : url,
                                note : notes
                            });
                            chrome.storage.local.set({
                                SavedNotes : savedNotes.SavedNotes
                            });
                        }
                    }
                    else{
                        let tmpObj = {};
                        
                        tmpObj[domain] = [];
                        tmpObj[domain].push({
                            time : currentTime,
                            imgscr : imgscr,
                            title : title,
                            domain : domain,
                            url : url,
                            note : notes
                        });

                        chrome.storage.local.set({
                            SavedNotes : tmpObj
                        });
                    }
                    $("#typed_notes").val("");
                    document.querySelector(".info_alerts").innerHTML = "Note Successfully Saved";
                    $(".info_alerts").show();
                    setAllData();
                })
                .catch( (errorNotes) => {
                    console.log("ERROR");
                });
            });
        }
        else{
            $(".info_alerts").show();
        }
    });
    $("#dashboardLogo").click( () => {
        chrome.tabs.create({
            url: chrome.runtime.getURL("/html/dashboard.html"),
        });
    });
    $("#viewNotes").click( () => {
        let terms = currentDomain.split(".");
        let domaintoId = "";
        for(let t in terms){
            domaintoId =  domaintoId.concat(terms[t]);
        }
        chrome.tabs.create({
            url: chrome.runtime.getURL(`/html/dashboard.html?domain=${domaintoId}`),
        });
    });
});