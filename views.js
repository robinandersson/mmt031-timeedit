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

		this.updateInputs("now");

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

	updateInputs: function(hash) {
		/*
			{
				date: "2013-11-11",
				start: "11:00",
				end: "12:00"
			}
		 */
		var dateObject = {};
		
		// Copy GLOBAL_BOOKING's date attributes to date input fields
		if(typeof hash === "string" && hash === "now") {
			$.each(['date', 'startTime', 'endTime'], function(i, prop) {
				dateObject[prop] = App.GLOBAL_BOOKING.get(prop);
			});
		}

		this.$el.find("#booking-date").val(dateObject.date);
		this.$el.find("#booking-start-time").val(dateObject.startTime);
		this.$el.find("#booking-end-time").val(dateObject.endTime);
	},

	refresh: function() {
		this.rooms.refresh(this.filter.attributes);
	}
});
