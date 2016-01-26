$(function() {
    function AppViewModel() {
        var self = this;
        self.mealshares = ko.observableArray(mealshares);

        self.displayOthers = ko.observable(true);
        self.displayCreated = ko.observable(false);
        self.displayHosting = ko.observable(false);
        self.displayAttending = ko.observable(false);

        var viewingMealshares = true;
        self.viewingMealshares = ko.observable(viewingMealshares);

        self.create = function(data) {

            $.ajax({
                url:'/mealshare/new',
                type: 'POST',
                success: function(ms) {
                    self.createdMealshares.push(ms);
                    self.allMealshares.push(ms);
                },
                data: $('#new_mealshare_form').serialize()
            });
        }

        self.delete = function(data) {
            console.log("delete clicked");
        }

        self.attend = function(data) {

            $.ajax({
                url: '/mealshare/attend/' + data.id,
                type: 'PUT',
                success: function(ms) {
                    console.log("test");
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

        self.viewMealshares = function() {
            viewingMealshares = ko.observable(true);
        }

        self.viewHostingForm = function() {
            viewingMealshares = ko.observable(false);
        }
    }

    ko.applyBindings(new AppViewModel());
});
 
