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
        console.log(response1.allNotes);
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
                        <i class="fa-solid fa-circle-arrow-down"></i>
                    </div>
                    <div id="notes_list_${i}" class="accordion_content">
                    </div>
                </div>
            `);
            for(let k in response1.allNotes[key]){
                $(`#notes_list_${i}`).append(`
                    <div id="note_${key + '_' + k}" class="notes">
                        <img src="${response1.allNotes[key][k].imgsrc}" alt="">
                        <h3><a target="_blank" href="${response1.allNotes[key][k].url}">${response1.allNotes[key][k].title}</a></h3>
                        <textarea name="" id="" cols="30" rows="5" disabled>${response1.allNotes[key][k].note}</textarea>
                    </div>
                `);
            }
            i++;
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
        // console.log("Check 1", added_title);
        // console.log("Check 2", added_url);
        // console.log("Check 3", added_note);
        let domain = extractDomain(added_url);
    });
});