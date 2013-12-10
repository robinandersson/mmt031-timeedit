/*
	The room schedule visualization
*/

App.Views.TimeslotView = Backbone.View.extend({

	initialize: function() {
		console.log("Init timeslot view model (booking): ", this.model);
	},

	render: function() {
		// Rendering code based on model.startTime and model.endTime goes here ...
	}
});

App.Views.Schedule = Backbone.View.extend({

	initialize: function(args) {
		this.bookings = args.model;
		this.subViews = [];
		
		this.createTimeslotViews(this.bookings.models);
	},

	/*
		Assign several subviews and render them
	 */
	createTimeslotViews: function(models) {
		_.each(models, function (booking) {
			this.subViews.push( new App.Views.TimeslotView({model: booking}) );
		}, this);
	},

	render: function() {
		_(this.subViews).each(function(view) {
			view.render();
		});
	}
});
