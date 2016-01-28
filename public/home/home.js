$(function() {
    function AppViewModel() {
        var self = this;
        self.mealshares = ko.observableArray(mealshares).extend({notify: 'always'});

        self.displayOthers = ko.observable(true);
        self.displayCreated = ko.observable(false);
        self.displayHosting = ko.observable(false);
        self.displayAttending = ko.observable(false);

        self.delete = function(data) {
            $.ajax({
                url: '/mealshare/delete/' + data.id,
                type: 'DELETE',
                success: function(ms) {
                },
                data: null,
                contentType: "application/json; charset=utf-8"
            });
        }

        self.attend = function(data) {
            $.ajax({
                url: '/mealshare/attend/' + data.id,
                type: 'PUT',
                success: function(ms) {
                    data.isGuest = true;
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
                    data.isGuest = false;
                },
                data: null,
                contentType: "application/json; charset=utf-8"
            });
        }
    }

    ko.applyBindings(new AppViewModel());
});
