$(function() {

    function AppViewModel() {
        var self = this;
        self.mealshares = ko.observableArray(mealshares);

        self.displayAll = ko.observable(true);
        self.displayCreated = ko.observable(false);
        self.displayHosting = ko.observable(false);
        self.displayAttending = ko.observable(false);

        self.displayThis = function(isGuest, isCreator) {
            return self.displayAll() || (isCreator && self.displayCreated()) || (isGuest && self.displayAttending());
        }

        self.delete = function(data) {
            $.ajax({
                url: '/mealshare/delete/' + data.id,
                type: 'DELETE',
                success: function(ms) {
                    window.location.reload();
                },
                data: null,
                contentType: "application/json; charset=utf-8"
            });
        }

        self.edit = function(data) {
            $('#name-input').val(data.name);
            $('#capacity-input').val(data.maxCapacity);
            $('#capacity-input').attr("min", data.guests.length);
            $('#max-guests-label').text("Number of guests: (Minimum current number of guests: " + data.guests.length + ")");
            $('#price-input').val(data.price);
            $('#description-input').val(data.description);
            $('#edit-date-input').val(dateFormat(data.time, 'mm/dd'));
            $('#edit-time-input').val(dateFormat(data.time, 'HH:MM'));

            $('#edit-save-button').click(function() {
                $.ajax({
                    url:'/mealshare/edit/' + data.id,
                    type: 'PUT',
                    success: function(ms) {
                        window.location.reload();
                    },
                    error: function(msg) {
                        alert("Something's wrong, check the date/time formats and that there's room for all guests");
                    },
                    data: $('#edit_mealshare_form').serialize()
                });
            });

            $('#edit-modal').modal();
        }

        self.attend = function(data) {

            $.ajax({
                url: '/mealshare/attend/' + data.id,
                type: 'PUT',
                success: function(ms) {
                    window.location.reload();
                    // data.isGuest = true;
                    // self.mealshares.splice(data.index, 1);
                    // self.mealshares.splice(ms.index, 0, ms);
                },
                data: null,
                contentType: "application/json; charset=utf-8"
            });
        }

        self.unattend = function(data) {

            $.ajax({
                url: '/mealshare/unattend/' + data.id,
                type: 'PUT',
                success: function(ms) {
                    window.location.reload();
                    // self.mealshares.splice(data.index, 1);
                    // self.mealshares.splice(ms.index, 0, ms);
                },
                data: null,
                contentType: "application/json; charset=utf-8"
            });
        }
    }

    ko.applyBindings(new AppViewModel());
});
