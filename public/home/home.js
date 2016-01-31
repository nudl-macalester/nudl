$(function() {
    function AppViewModel() {
        var self = this;
        self.mealshares = ko.observableArray(mealshares);

        self.displayAll = ko.observable(true);
        self.displayCreated = ko.observable(false);
        self.displayHosting = ko.observable(false);
        self.displayAttending = ko.observable(false);

        self.displayThis = function(isGuest, isCreator) {
            console.log(self.displayAll());
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
