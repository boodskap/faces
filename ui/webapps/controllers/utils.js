

function showNotification(msg, type, time) {

    if (!time) time = 2500;

    // create the notification
    var notification = new NotificationFx({
        message: msg,
        layout: 'growl',
        effect: 'jelly',
        type: type, // notice, warning, error or success
        ttl: time
    });

    // show the notification
    notification.show();
}

//Notifications
function errorMsg(msg) {

    // swal("Error", msg, "error");


        // $(".errorFeedBack").html("<i class='fa fa-exclamation-triangle'></i> "+msg);
        $("#snackbar").html("<i class='fa fa-exclamation-triangle'></i> " + msg);
        var width = $(".errorFeedBack").outerWidth();
        var totalWidth = $(document).width();
        var position = (parseInt(totalWidth) - parseInt(width)) / 2;
        $(".errorFeedBack").css({
            'left': position - 10
        });

        var $window = $(window),
            $stickyEl = $('.feedBack');

        var windowTop = $window.scrollTop();
        $(".errorFeedBack").css('top', 105);

        $(".errorFeedBack").show().delay(2500).fadeOut();

        snackBar();
        // $.growl.error({title:"<i class='fa fa-exclamation-triangle'></i> Error", message: msg });
}


function snackBar() {
    $("#snackbar").addClass('show');
    setTimeout(function () {
        $("#snackbar").removeClass('show');
    }, 2000);
}

function errorMsgBorder(msg, id) {

    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "2000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    };

    toastr.error(msg);

    $("#" + id).css("border", "1px solid red");

    setTimeout(function () {
        $("#" + id).css("border", "1px solid #ccc");

    }, 2000);

}

function successMsg(feedText) {

    swal("Success", feedText, "success");

   /* // $(".feedBack").html('<i class="fa fa-check"></i>  '+feedText);
    $("#snackbar").html('<i class="fa fa-check"></i>  ' + feedText);
    positionFeedback();

    var $window = $(window),
        $stickyEl = $('.feedBack');

    var windowTop = $window.scrollTop();
    $(".feedBack").css('top', 100);


    $window.scroll(function () {
        var windowTop = $window.scrollTop();
        if (windowTop > 35) {
            //$(".feedBack").css('top', 0);
        } else {
            //$(".feedBack").css('top', 60);
        }
    });
    $(".feedBack").show().delay(1900).fadeOut();

    snackBar();*/
}

function feedback(feedText) {

    // $(".feedBack").html(feedText);
    $("#snackbar").html(feedText);
    positionFeedback();

    var $window = $(window),
        $stickyEl = $('.feedBack');

    var windowTop = $window.scrollTop();
    $(".feedBack").css('top', 100);


    $window.scroll(function () {
        var windowTop = $window.scrollTop();
        if (windowTop > 35) {
            //$(".feedBack").css('top', 0);
        } else {
            //$(".feedBack").css('top', 60);
        }
    });
    $(".feedBack").show().delay(1900).fadeOut();

    snackBar();
}



function avoidSpaces(obj) {
    $(obj).val($(obj).val().replace(/\s/g, ""));
}


function openNav() {
    if ($("#mySidenav").hasClass('barwidth')) {
        $(".barmenu").html('<i class="icon-bars"></i>')
        $("#mySidenav").removeClass('barwidth')
    } else {
        $(".barmenu").html('<i class="icon-close2"></i>')
        $("#mySidenav").addClass('barwidth')
    }


}

function blockSpecialChar(e) {
    var value = e.key;
    var regex = /^[0-9a-zA-Z\_]+$/;
    return regex.test(value);
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function qs(key) {
    key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
    var match = location.search.match(new RegExp("[?&]" + key + "=([^&]+)(&|$)"));
    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
}

$(document).ready(function () {
    $('.container-fluid').click(function (e) {
        if ($("#mySidenav").hasClass('barwidth')) {
            $(".barmenu").html('<i class="icon-bars"></i>')
            $("#mySidenav").removeClass('barwidth')
        }
    });
    $('.container').click(function (e) {
        if ($("#mySidenav").hasClass('barwidth')) {
            $(".barmenu").html('<i class="icon-bars"></i>')
            $("#mySidenav").removeClass('barwidth')
        }
    });

});

function mobileOrWeb() {
    var isiPad = /ipad/i.test(navigator.userAgent.toLowerCase());
    if (isiPad) {
        return false;
    }
    var isiPhone = /iphone/i.test(navigator.userAgent.toLowerCase());
    if (isiPhone) {
        return false;
    }
    var isiDevice = /ipad|iphone|ipod/i.test(navigator.userAgent.toLowerCase());

    if (isiDevice) {
        return false;
    }
    var isAndroid = /android/i.test(navigator.userAgent.toLowerCase());

    if (isAndroid) {
        return false;
    }
    var isBlackBerry = /blackberry/i.test(navigator.userAgent.toLowerCase());

    if (isBlackBerry) {
        return false;
    }
    var isWebOS = /webos/i.test(navigator.userAgent.toLowerCase());

    if (isWebOS) {
        return false;
    }
    var isWindowsPhone = /windows phone/i.test(navigator.userAgent.toLowerCase());

    if (isWindowsPhone) {
        return false;
    }

    return true;
}

function returnData(data) {
    return data ? data : '-'
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getTimeDiff( from, to ) {
    var datetime = new Date( from ).getTime();
    var now = new Date(to).getTime();

    if( isNaN(datetime) )
    {
        return "";
    }


    if (datetime < now) {
        var milisec_diff = now - datetime;
    }else{
        var milisec_diff = datetime - now;
    }

    var days = Math.floor(milisec_diff / 1000 / 60 / (60 * 24));

    var date_diff = new Date( milisec_diff );

    return (days ? days + " Days " : '') + (date_diff.getHours() ? date_diff.getHours() + " Hours " : '') +
        (date_diff.getMinutes() ? date_diff.getMinutes() + " Minutes " : '') + (date_diff.getSeconds() ? date_diff.getSeconds() + " Seconds" : '-');
}

function secondsToTime(s){
    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;

    return (hrs ? hrs +' Hrs':'') + (mins ? mins+ ' Mins' : '') + (secs ? secs + ' Sec' : '') ;
}

function faceConfidence(val) {

    if(val >= 90){
        return '<span class="m--font-success">BEST</span>'
    }
    else if(val >= 80 && val <=90){
        return '<span class="m--font-info">GOOD</span>'
    }
    else if(val >= 40 && val <=80){
        return '<span class="m--font-warning">BAD</span>'
    }else{
        return '<span class="m--font-danger">WORST</span>'
    }

}


$(document).ready(function () {

    $(".currentYear").html(moment().format('YYYY'));

});

function logout() {
    Cookies.remove('user_details');
    document.location='/login';

}
