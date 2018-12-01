$('#registrationForm').bootstrapValidator({
    feedbackIcons: {
        valid: 'glyphicon glyphicon-ok',
        invalid: 'glyphicon glyphicon-remove',
        validating: 'glyphicon glyphicon-refresh'
    },
    fields: {
        firstName: {
            validators: {
                notEmpty: {
                    message: 'Please Enter your First Name'
                }
            }
        },
        lastName: {
            validators: {
                notEmpty: {
                    message: 'Please Enter your phone number'
                }
            }
        },
        username: {
            validators: {
                notEmpty: {
                    message: 'Please enter a username'
                }
            }
        },
        emailAddress: {
            validators: {
                notEmpty: {
                    message: 'Please enter your email address'
                },
                emailAddress: {
                    message: 'Please enter a valid email address'
                }
            }
        },
        password: {
            validators: {
                notEmpty: {
                    message: 'Enter enter a password'
                }
            }
        },
        confirmPassword: {
            validators: {
                notEmpty: {
                    message: 'Pleasae enter a confirmation of your password'
                },
                identical: {
                    field: 'password',
                    message: 'Passwords do not match'
                }
            }
         },
        }
});