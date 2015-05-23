$(function () {
    // initialize material animations
    $.material.init();

    $('#contact-form').validate({
        // Specify the validation rules
        rules: {
            name: 'required',
            subject: 'required',
            email: {
                required: true,
                email: true
            },
            message: 'required'
        },
        // Specify the validation error messages
        messages: {
            name: 'What is your name?',
            subject: 'What is your request?',
            email: 'Please enter a valid email address',
            message: 'Don\'t forget a message!'
        },
        submitHandler: function (form) {
            form.submit();
        }
    });

    $('#sendbutton').click(function () {
        var form = $('#contact-form');
        if (form.valid()) {
            form.submit();
        }
    });

});