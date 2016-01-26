$(function() {
    function AppViewModel() {
        var self = this;

        self.createdMealshares = ko.observableArray(createdMealshares);
        self.hostingMealshares = ko.observableArray(hostingMealshares);
        self.attendingMealshares = ko.observableArray(attendingMealshares);
        self.allMealshares = ko.observableArray(allMealshares);

        self.otherMealshares = ko.observableArray(otherMealshares);

        self.displayOthers = ko.observable(true);
        self.displayCreated = ko.observable(false);
        self.displayHosting = ko.observable(false);
        self.displayAttending = ko.observable(false);

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
                url: '/mealshare/attend/' + data._id,
                type: 'PUT',
                success: function(ms) {
                    self.attendingMealshares.push(ms);
                    self.otherMealshares.splice(self.otherMealshares.indexOf(ms), 1);

                },
                data: null,
                contentType: "application/json; charset=utf-8"
            });
        }

        self.unattend = function(data) {

            $.ajax({
                url: '/mealshare/unattend/' + data._id,
                type: 'PUT',
                success: function(ms) {
                    self.attendingMealshares.splice(self.attendingMealshares.indexOf(ms), 1);
                    self.otherMealshares.push(ms);
                },
                data: null,
                contentType: "application/json; charset=utf-8"
            });
        }
    }

    ko.applyBindings(new AppViewModel());
});
 
