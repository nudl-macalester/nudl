$(function() {
    function AppViewModel() {
        var self = this;

        self.createdMealshares = ko.observableArray(createdMealshares);
        self.hostingMealshares = ko.observableArray(hostingMealshares);
        self.attendingMealshares = ko.observableArray(attendingMealshares);
        self.allMealshares = ko.observableArray(allMealshares);

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

        self.attend = function(data) {

            $.ajax({
                url: '/mealshare/attend/' + data._id,
                type: 'PUT',
                success: function(ms) {
                    self.attendingMealshares.push(ms);
                },
                data: null,
                contentType: "application/json; charset=utf-8"
            });
        }
    }

    ko.applyBindings(new AppViewModel());
});
 
