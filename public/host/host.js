$(function() {
	function AppViewModel() {
        var self = this;
        self.mealshares = ko.observableArray(mealshares);
    }
    ko.applyBindings(new AppViewModel());

	// $( "#datepicker" ).datepicker();
	$(".datepicker").pickadate({
		format: 'dddd, d mmmm',
		formatSubmit: 'ddd mmm dd yyyy',
		hiddenName: true,
		min: true
	});

	$(".timepicker").pickatime({
		formatSubmit: 'H:i:00',
		hiddenName: true,
		interval: 15,
		min: [12, 00]
	});

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
