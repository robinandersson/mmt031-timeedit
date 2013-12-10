/*
	The room schedule visualization
*/


App.Views.Schedule = Backbone.View.extend({

	initialize: function() {
		this.subViews = [];
		console.log("init subview: ", this.el);
	},

	render: function() {
		_(this.subViews).each(function(view) {
			view.render();
		});
	}
});