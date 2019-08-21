var userObj = Cookies.get('user_details');

$(document).ready(function () {

    if(userObj){
        userObj = JSON.parse(userObj);
        document.location = '/dashboard';
    }
    $(".currentYear").html(moment().format('YYYY'));
    $(".leftContent").css('height',$(window).height());
    $(".right-content").css('height',$(window).height());


});



function login(){

    var emailId = $.trim($("#username").val());
    var password = $.trim($("#password").val());

    if(emailId == ""){
        errorMsgBorder('Username cannot be empty','username');
        return false;
    }

    if(password == ""){
        errorMsgBorder('Password cannot be empty','password');
        return false;
    }

    $("#submitButton").attr('disabled','disabled');

    if(emailId === 'admin' && password === 'admin'){

        Cookies.set('user_details', {'firstName':'Admin','lastName':''});
        document.location = '/dashboard';

    }else{
        $("#submitButton").removeAttr('disabled');

        errorMsg('Error in Authentication');
    }

}

function register(){

    var firstname = $.trim($("#firstname").val());
    var lastname = $.trim($("#lastname").val());
    var email = $.trim($("#email").val());
    var password = $("#password").val();
    var confirmpassword = $("#confirmpassword").val();

    if(firstname == ""){
        errorMsgBorder('First Name cannot be empty','firstname');
        return false;
    }

    if(lastname === ""){
        errorMsgBorder('Last Name cannot be empty','lastname');
        return false;
    }

    if(email) {
        if (email === "") {
            errorMsgBorder('Email ID cannot be empty', 'email');
            return false;
        }else{
            var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            var eFlag = regex.test(email);

            if(!eFlag){
                errorMsgBorder('Invalid Email ID', 'email');
                return false;
            }

        }
    }

    if(password === ""){
        errorMsgBorder('Password cannot be empty','password');
        return false;
    }

    if(password !== confirmpassword){
        errorMsgBorder('Password & Confirm Password should be same','password');
        return false;
    }

    $("#submitButton").attr('disabled','disabled');
    loading('Please wait');

    var data = {
        email: email.toLowerCase(),
        password: password,
        firstName: firstname,
        lastName: lastname,
        roles:['user']
    };


    registerCall(data,function (status, data) {
        closeLoading();
        $("#submitButton").removeAttr('disabled');
        if(status){
            $('#registerForm')[0].reset();
            successMsg('Account Successfully created. Please check your email to activate your account!')

            if(Cookies.get('domain')){
                var domainKey = Cookies.get('domain');
                document.location='/'+domainKey;
            }else{
                document.location='/login';
            }
        }else{
            console.log(data)
            if(data.message === 'USER_EXISTS'){
                errorMsg('User already exists!')
            }else{
                errorMsg('Something went wrong!')
            }

        }
    })
}

function resetPasswordModal(){
    $("#forgotModal").modal('show');
}

function forgetPassword() {
    var emailId = $.trim($("#emailId").val());

    if(emailId == ""){
        errorMsgBorder('Email ID cannot be empty','emailId');
        return false;
    }

    $("#passwordButton").attr('disabled','disabled');


    resetPasswordCall(emailId.toLowerCase(),function (status, data) {
        $("#passwordButton").removeAttr('disabled');
        $("#forgotModal").modal('hide');
        successMsg('Password reset successfully. Please check your Registered Email!');
    });
}