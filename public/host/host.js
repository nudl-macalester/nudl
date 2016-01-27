$(function() {
	$( "#datepicker" ).datepicker();

	$('#new_mealshare_form').submit(function(e) {
		e.preventDefault();
		console.log("asdf");
        $.ajax({
            url:'/mealshare/new',
            type: 'POST',
            success: function(ms) {
            	console.log(ms);
            },
            data: $('#new_mealshare_form').serialize()
        });
	});
});
