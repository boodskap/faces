$(document).ready(function () {
    var liveContainer = $('#liveContainer');

    liveContainer.userCam({
        start: function (event, video) {
            $(".fileDrag").removeClass('col-md-12').addClass('col-md-8');
            $(".webCam").css('display','block')
        },
        error: function (message) {
            $(".fileDrag").addClass('col-md-12');
            $(".webCam").css('display','none')
        }
    });

});



function uploadFile(f) {

    $(".processingImage").html('<i class="fa fa-spinner fa-spin"></i> processing image. please wait...')
    rData = {};
    $(".resultDiv").html('');
    $(".resultImage").html('<div class="col-md-9 m-0 p-0">' +
        '<div class="imgBlock" style="max-height: 500px;overflow: auto;padding:0px;position: relative;"><img src="" id="resultImage" /></div></div>' +
        '<div class="col-md-3"><div class="row cropImage" style="max-height:500px;overflow: auto "></div> </div>');

    var fileInput = document.getElementById("imgFile");

    var files = fileInput.files;

    var file = f ? f :files[0];

    file = camBlob ? camBlob : files[0]

    readURL(file);
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {

            if (xhr.status === 200){
                var result = JSON.parse(xhr.response);

                loadResult(result);

            } else {
                $(".processingImage").html('');
                errorMsg('Error in image upload!');
            }
        }else{
            $(".processingImage").html('');
            errorMsg('Error in image upload!');
        }
    };

    var queryParam = '?';

    if($("#paddingx").val()){
        queryParam += 'px='+$("#paddingx").val();
    }
    if($("#paddingy").val()){
        queryParam += '&py='+$("#paddingy").val();
    }
    if($("#paddingw").val()){
        queryParam += '&pw='+$("#paddingw").val();
    }
    if($("#paddingh").val()){
        queryParam += '&ph='+$("#paddingh").val();
    }

    xhr.open('POST', '/api/cropdetect'+queryParam, true);
    var formData = new FormData();
    formData.append("file", file, file.name ? file.name : 'image');
    xhr.send(formData);
}




function loadResult(data) {

    rData=data;

    // Quality between 65 - 70 is moderate
    // Quality between 71-75 is good
    // Quality between 76-80 is very good
    // Quality between 81 - 90 is perfect
    // 91+ is excellent

    var quality = data.quality;

    if(quality >= 65 && quality <71){
        quality = '<a href="javascript:void(0)" class="m-link m-link--state m-link--warning">Moderate</a>'
    }else if(quality >= 71 && quality < 76){
        quality = '<a href="javascript:void(0)" class="m-link m-link--state m-link--info">Good</a>'
    }else if(quality >= 76 && quality < 81){
        quality = '<a href="javascript:void(0)" class="m-link m-link--state m-link--success">Very Good</a>'
    }else if(quality >= 81 && quality < 91){
        quality = '<a href="javascript:void(0)" class="m-link m-link--state m-link--success">Perfect</a>'
    }else if(quality >= 91){
        quality = '<a href="javascript:void(0)" class="m-link m-link--state m-link--success">Excellent</a>'
    }else{
        quality = '<a href="javascript:void(0)" class="m-link m-link--state m-link--danger">Bad</a>'
    }

    var str = `
    <div class="col-md-6">
        <h5><u>`+data.faces+` Face's</u> Found!</h5>
        <div class="progress progressbar">
            <div class="progress-bar bg-success" role="progressbar" style="width: `+Math.round(data.quality)+`%" aria-valuenow="`+Math.round(data.quality)+`" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
    </div>
    <div class="col-md-4">
        <small>Quality</small>
       <h3>`+quality+` <small style="font-weight: 600">(`+data.quality.toFixed(3)+`%)</small></h3>
    </div>
    <div class="col-md-2">
        <small>Result JSON</small><br>
       <a href="javascript:void(0)" onclick="openDataModal()">view data</a>
    </div>
    `
    $(".processingImage").html('');
    $(".resultDiv").html(str);

    var resultdata = data.boxes;
    var regions = data.regions;

    $(".cropImage").html('')

    for (var i = 0; i < regions.length; i++) {

        $(".cropImage").append("<div class='col-md-6 text-center mt-2'><img class='card-img img-thumbnail' src='data:image/png;base64, "+regions[i]+"' style='width:75px;height:75px' /></div>")
    }
    for (var i = 0; i < resultdata.length; i++) {

        var cordinates = resultdata[i];
        var img = "<img class='card-img img-thumbnail' src='data:image/png;base64, "+regions[i]+"' width='150' />"
        var popover = 'data-container="body" data-toggle="m-popover" data-html="true" data-placement="right" data-content="'+img+'" data-original-title="" title=""'
        $(".resultImage .imgBlock").append('<div class="overlay overlay_' + i + '" '+popover+'></div>')

        $(".overlay_" + i).css({
            'top': cordinates.y + 'px',
            'left': cordinates.x + 'px',
            'height': (cordinates.ey - cordinates.y) + 'px',
            'width': (cordinates.ex - cordinates.x) + 'px',
            'border': '2px dashed red',
            'position': 'absolute'

        })

        $('[data-toggle="m-popover"]').each(function() {
            initPopoverImg($(this));
        });

    }
}

var initPopoverImg = function(el) {
    var skin = el.data('skin') ? 'm-popover--skin-' + el.data('skin') : '';
    var triggerValue = el.data('trigger') ? el.data('trigger') : 'hover';

    el.popover({
        trigger: triggerValue,
        template: '\
            <div class="m-popover ' + skin + ' popover" role="tooltip">\
                <div class="arrow"></div>\
                <h3 class="popover-header"></h3>\
                <div class="popover-body"></div>\
            </div>'
    });
}

var rData = {};
function openDataModal(){
    $("#resultJson").html(JSON.stringify(rData,null,2))
    $("#resultModal").modal('show')
}


// ************************ Drag and drop ***************** //
let dropArea = document.getElementById("drop-area")

// Prevent default drag behaviors
;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false)
    document.body.addEventListener(eventName, preventDefaults, false)
})

// Highlight drop area when item is dragged over it
;['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false)
})

;['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false)
})

// Handle dropped files
dropArea.addEventListener('drop', handleDrop, false)

function preventDefaults (e) {
    e.preventDefault()
    e.stopPropagation()
}

function highlight(e) {
    dropArea.classList.add('highlight')
}

function unhighlight(e) {
    dropArea.classList.remove('highlight')
}

function handleDrop(e) {
    var dt = e.dataTransfer
    var files = dt.files;
    camBlob = null;
    uploadFile(files[0])
}
var camBlob = null;
function liveCapture() {
    camBlob = null;

    var liveContainer = $('#liveContainer');


    // Get the userCam object from the cameraContainer data
    var dataURI = liveContainer.data('userCam').getStill();


    fetch(dataURI)
        .then(res => res.blob())
        .then(blob => {
            camBlob = blob;

           uploadFile(blob)
        })

}

function readURL(file) {
    var img = $("#resultImage");
    var reader = new FileReader();
    reader.onloadend = function() {
        img.attr('src',reader.result);
    }
    reader.readAsDataURL(file);
}