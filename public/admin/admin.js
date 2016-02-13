$(function() {
	$('a').click(function(e) {
		e.preventDefault();
		console.log($(this).attr('href'));
        $.ajax({
            url: '/admin/mealshare/get/' + $(this).attr('href'),
            type: 'GET',
            success: function(ms) {
            	console.log(ms);
            	$('#ms-name').text(ms.name);
            	$('#ms-creator').text(ms.creator.name);
                $('#ms-spots-left').text("empty spots: " + ms.spots_left);
                $('#ms-capacity').text("capacity: " + ms.max_guests);
                $('#ms-price').text("$ " + ms.price);
            	if (ms.guests.length > 0) {
            		populatePeopleList($('#ms-guests'), ms.guests);
            	} else {
            		$('#ms-guests').html('<li>No guests</li>');
            	}
                // window.location.reload();
            },
            data: null,
            contentType: "application/json; charset=utf-8"
        });
	});

	function populatePeopleList(list, people) {
	    var peopleItems = [];
	    for (var i = 0; i < people.length; i++) {
	    	var person = people[i];
	        peopleItems.push('<li><span>Name: ' + person.name + '</span><br><span>Email: ' + person.email + '</span></li>');
	    }  
	    list.html(peopleItems.join(''));
	}
});