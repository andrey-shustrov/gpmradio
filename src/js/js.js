$(function(){

    // меню
    $('.header__menu_button').on('click', function(){
        const sender = $(this);
        const box = sender.closest('.header__top');

        if(box.is('.open'))
            box.removeClass('open');
        else 
            box.addClass('open');
    });

    // popup
    $('.popup_but').on('click', function(){
        const body = $('body');

        if(body.is('.popup_open'))
            body.removeClass('popup_open');
        else 
            body.addClass('popup_open');
    });

    // input file
    $('.file').on('change', function(){
        $('.file_name').text($(this).get(0).files[0].name);
        $('.file ~ label').text(''); //fix focus
    });

    // form
    var idForm = $('#form');
    idForm.validate({
        messages: {
            name: false, sity: false, phone: false,
            email: false, name2: false, name3: false,
            photo: "Прикрепите фото",
            text: false
        },
        submitHandler: function() {
            idForm.closest('.popup__box')
                    .find('h2')
                        .addClass('form_submit')
                            .text('Ваша заявка отправлена.');

            idForm.remove();
        }
    });

    // inputmask
    $('input[name="phone"]').inputmask({
        "mask": "+9 (999) 999-99-99"
    });

});