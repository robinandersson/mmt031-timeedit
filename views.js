/*
	VIEWS
---------------------------------
 */

var ControlView = Backbone.View.extend({

	events: {
		"change input[type='date'],input[type='time']" : "setDateTimes",
		"change #booking-start-time, #booking-end-time" : "updateTimeSegments"
	},

	modelBindings: {
		"#booking-location" : "name",
		"#booking-date" : "date",
		"#booking-start-time" : "startTime",
		"#booking-end-time" : "endTime"
	},

	updateTimeSegments: function(evt) {
		var selected_time = this.getTimeslot();

		/*

		// Remove earlier timesegments and add new ones.
		$('.time-segment').remove();
		$('<div class="time-segment" />').appendTo('.time-display').css({
			width: (selected_time.end - selected_time.start) * pixels_per_five_minutes +'%',
			left: pixels_per_five_minutes * selected_time.start + '%'
		});
		*/
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

			_.each(this.modelBindings, function(attribute, selector) {
				view.$(selector).on("input", function(evt){
					var data = view.$(evt.target).val();
					view.filter.attributes[attribute] = data;
					view.filter.trigger("change", data);
				});
			});
		}
	},

	getTimeslot: function() {
		return {
			startTime: $("#booking-start-time").val(),
			endTime: $("#booking-end-time").val()
		};
	},

	setDateTimes: function(evt) {
		var prop = this.modelBindings["#"+evt.currentTarget.id];
		App.GLOBAL_BOOKING.set(prop, $(evt.currentTarget).val());
	},
	

	refresh: function() {
		// Always include date info in filter
		var dates = {
			date: $("#booking-date").val(),
			startTime: $("#booking-start-time").val(),
			endTime: $("#booking-end-time").val()
		};

		var filter = _.extend(this.filter.attributes, dates);

		this.rooms.refresh(filter);
	}
});
