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

    $(".resultDiv").html('');
    $(".resultImage").html('<div class="col-md-12 m-0 p-0"><img src="" id="resultImage" /></div>');

    var fileInput = document.getElementById("imgFile");

    var files = fileInput.files;

    var file = f ? f :files[0];

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
    xhr.open('POST', '/api/detect', true);
    var formData = new FormData();
    formData.append("file", file, file.name ? file.name : 'image');
    xhr.send(formData);
}




function loadResult(data) {
    var str = `
    <div class="col-md-6">
        <h5><u>`+data.faces+` Face's</u> Found!</h5>
        <div class="progress progressbar">
            <div class="progress-bar bg-success" role="progressbar" style="width: `+Math.round(data.quality)+`%" aria-valuenow="`+Math.round(data.quality)+`" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
    </div>
    <div class="col-md-1">
        <small>Quality</small>
       <h3>`+data.quality.toFixed(3)+`%</h3>
    </div>
   
    `
    $(".processingImage").html('');
    $(".resultDiv").html(str);

    var resultdata = data.boxes;

    for (var i = 0; i < resultdata.length; i++) {

        var cordinates = resultdata[i];

        $(".resultImage").append('<div class="overlay overlay_' + i + '"></div>')

        $(".overlay_" + i).css({
            'top': cordinates.y + 'px',
            'left': cordinates.x + 'px',
            'height': (cordinates.ey - cordinates.y) + 'px',
            'width': (cordinates.ex - cordinates.x) + 'px',
            'border': '2px dashed red',
            'position': 'absolute'

        })

    }
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
    var files = dt.files
    uploadFile(files[0])
}

function liveCapture() {


    var liveContainer = $('#liveContainer');


    // Get the userCam object from the cameraContainer data
    var dataURI = liveContainer.data('userCam').getStill();


    fetch(dataURI)
        .then(res => res.blob())
        .then(blob => {


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