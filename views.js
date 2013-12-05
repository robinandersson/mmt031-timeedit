/*
	VIEWS
---------------------------------
 */

var ControlView = Backbone.View.extend({

	events: {
		"change input[type='date'],input[type='time']" : "setDateTimes"
	},

	modelBindings: {
		"#booking-location" : "name",
		"#booking-date" : "date",
		"#booking-start-time" : "startTime",
		"#booking-end-time" : "endTime"
	},

	initialize: function() {
		this.setElement($("#controls"));

		this.controls = this.$("input");
		this.rooms = new RoomsView;

		this.filter = {
			attributes: {}
		};
		_.extend(this.filter, Backbone.Events);

		this.listenTo(this.filter, "change", this.refresh);
		this.listenTo(UserBookings, "add", this.refresh);

		if(this.rooms.collection != null) {
			var view = this;

			// Always include date info in filter
			this.filter.attributes = {
				date: $("#booking-date").val(),
				startTime: $("#booking-start-time").val(),
				endTime: $("#booking-end-time").val()
			}

			_.each(this.modelBindings, function(attribute, selector) {
				view.$(selector).on("input", function(evt){
					var data = view.$(evt.target).val();
					view.filter.attributes[attribute] = data;
					view.filter.trigger("change", data);
				});
			});
		}
	},

	setDateTimes: function(evt) {
		var prop = this.modelBindings["#"+evt.currentTarget.id];
		App.GLOBAL_BOOKING.set(prop, $(evt.currentTarget).val());
	},
	

	refresh: function() {
		this.rooms.refresh(this.filter.attributes);
	}
});
