let queryParam = new URLSearchParams(window.location.search).get("domain");

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

function getNotes(){
    return new Promise( (resolve, reject) => {
        chrome.storage.local.get("SavedNotes")
        .then((notesRes) => {
            resolve({
                allNotes : notesRes.SavedNotes
            });
        })
        .catch((error) => {
            console.log("error1");
        });
    });
}
async function createNotes(){
    await getNotes()
    .then((response1) => {
        // console.log(response1.allNotes);
        document.getElementById("accordion").innerHTML = "";
        let i = 1;
        for(let key in response1.allNotes){
            let terms = key.split(".");
            let domaintoId = "";
            for(let t in terms){
                domaintoId =  domaintoId.concat(terms[t]);
            }
            $("#accordion").append(`
                <div id="domain_${domaintoId}" class="accordion_item">
                    <div class="accordion_head">
                        <h2>${key}</h2>
                        <span>Saved Notes: ${response1.allNotes[key].length}</span>
                    </div>
                    <div id="notes_list_${domaintoId}" class="accordion_content" style="display:none">
                    </div>
                </div>
            `);
            for(let k in response1.allNotes[key]){
                $(`#notes_list_${domaintoId}`).append(`
                    <div id="note_${key + '_' + k}" class="notes">
                        <img src="${response1.allNotes[key][k].imgsrc}" alt="">
                        <h3><a target="_blank" href="${response1.allNotes[key][k].url}">${response1.allNotes[key][k].title}</a></h3>
                        <textarea name="" id="" cols="30" rows="5" disabled>${response1.allNotes[key][k].note}</textarea>
                    </div>
                `);
            }
            i++;
        }
        if(i === 1){
            $("#noNotes").show();
        }
        else{
            $("#noNotes").hide();
        }
    })
    .catch((error1) => {
        console.log(error1);
    });
}
createNotes();

$(document).ready( ()=> {
    if(queryParam !== undefined && queryParam !== null){
        document.getElementById(`domain_${queryParam}`).scrollIntoView({
            behavior: 'smooth'
        });
    }
    $("#tab1").click(function(){
        $("#tab2").addClass("inactive");
        $("#tab1").removeClass("inactive");
        $("#tabcontent2").hide();
        $("#tabcontent1").show();
        createNotes();
    });
    $("#tab2").click(function(){
        $("#tab1").addClass("inactive");
        $("#tab2").removeClass("inactive");
        $("#tabcontent1").hide();
        $("#tabcontent2").show();
    });

    $("#addNotesNow").click(function(){
        let added_title = $("#onenote_title").val();
        let added_url = $("#onenote_url").val();
        let added_note = $("#onenote_note").val();
        let domain = extractDomain(added_url);
        let currentTime = new Date().getTime();
        if(added_title === undefined || added_title === null || typeof added_title !== "string" || added_title.length === 0){
            document.getElementById("invalid_alerts").innerHTML = `* Please add a Title`;
        }
        else if(added_title.trim().length < 5){
            document.getElementById("invalid_alerts").innerHTML = `* Title should be of minimum 5 characters`;
        }
        else if(added_url === undefined || added_url === null || typeof added_url !== "string" || added_url.length === 0){
            document.getElementById("invalid_alerts").innerHTML = `* Please add a URL`;
        }
        else if(domain === undefined || domain === null || domain === "empty"){
            document.getElementById("invalid_alerts").innerHTML = `* Please add a complete URL`;
        }
        else if(added_note === undefined || added_note === null || added_note.length === 0 || added_title.trim().length === 0){
            document.getElementById("invalid_alerts").innerHTML = `* Please add a Note to be saved`;
        }
        else{
            chrome.storage.local.get("SavedNotes")
            .then( (savedNotes) => {
                if(savedNotes !== undefined && savedNotes.SavedNotes !== undefined){
                    if(savedNotes.SavedNotes[domain] !== undefined){
                        savedNotes.SavedNotes[domain].push({
                            time : currentTime,
                            imgscr : "",
                            title : added_title,
                            domain : domain,
                            url : added_url,
                            note : added_note
                        });
                        chrome.storage.local.set({
                            SavedNotes : savedNotes.SavedNotes
                        });
                    }
                    else{
                        savedNotes.SavedNotes[domain] = [];
                        savedNotes.SavedNotes[domain].push({
                            time : currentTime,
                            imgscr : "",
                            title : added_title,
                            domain : domain,
                            url : added_url,
                            note : added_note
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
                        imgscr : "",
                        title : added_title,
                        domain : domain,
                        url : added_url,
                        note : added_note
                    });

                    chrome.storage.local.set({
                        SavedNotes : tmpObj
                    });
                }
                document.getElementById("invalid_alerts").innerHTML = `Note has been successfully Saved`;
                $("#onenote_title").val("");
                $("#onenote_url").val("");
                $("#onenote_note").val("");
            })
            .catch( (errorNotes) => {
                console.log("ERROR");
            });
        }
    });

    $(document).on("click", ".accordion_head", function (e){
        let _id = $(this).parent().attr("id");
        let op_id = _id.split("_")[1];
        let contentList = document.getElementsByClassName("accordion_content");
        for(let i = 0; i< contentList.length; i++){
          if(contentList[i].id === `notes_list_${op_id}`){
            $(`#${contentList[i].id}`).slideToggle();
          }
          else{
            $(`#${contentList[i].id}`).slideUp();
          }
        }
      });
});