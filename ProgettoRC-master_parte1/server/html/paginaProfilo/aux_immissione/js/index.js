//Global date object
var date = function() {
    this.obj = new Date();
    return {
        d: this.obj.getDate() > 9 ? this.obj.getDate() : "" + this.obj.getDate(),
        m: this.obj.getMonth() + 1 > 9 ? this.obj.getMonth() + 1 : "" + this.obj.getMonth() + 1,
        y: this.obj.getFullYear()
    };
}();

//Input Init
(function inputInit(){
    var $td = ".text-data";
    
    //Mask Assignments
    $($td + "--phone").mask("(999) 999-9999",{placeholder:"X"});
    $($td + "--date").mask("99/99/9999",{placeholder:"X"});
    $($td + "--ssn").mask("999-99-9999",{placeholder:"X"});
    $($td + "--height").mask("99 feet, 99 inches",{placeholder:"X"});
    $($td + "--weight").mask("999 pounds",{placeholder:"X"});
    
    //Add prefill class to input to set default value to system date
    $($td + "--date.prefill").val(date.m + "/" + date.d + "/" + date.y);
    
    //Token input init
    var maxTokenLength = 15;
    $($td + "--token").tagsInput({
        'width':'100%',
        'height':'auto',
        'defaultText':'Add ICD-10 code',
        'maxChars' : maxTokenLength,
        'removeWithBackspace' : false
    });
    $(".tagsinput input").attr('maxlength', maxTokenLength);
    $(".tagsinput").on('focus', 'input', function(){
        $(this).parent().parent().addClass('focus');
    })
    $(".tagsinput").on('blur', 'input', function(){
        $(this).parent().parent().removeClass('focus');
    })
    
    //Steps progress init
    $(".stepsprogress").on('click','.btn',function(){
        $(".stepsprogress .btn").removeClass("current");
        $(this).addClass("current");
    });
       
})();