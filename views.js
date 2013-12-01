/*
	VIEWS
---------------------------------
 */

var RoomView = Backbone.View.extend({
	tagName: "li",

	events: {
		"click .create-booking" : "createBooking"
	},

	initialize: function() {
		this.template = _.template($("#room-template").html());

		// Listen to model events

		this.listenTo(this.model, "change", this.render);
		this.listenTo(this.model, "destroy", this.remove);
	},

	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},

	createBooking: function(evt) {
		App.GLOBAL_BOOKING.set({room: this.model});

		if(App.GLOBAL_BOOKING.isValid()) {
			console.log("Creating booking");
			App.createUserBooking(this.model.bookings, App.GLOBAL_BOOKING);
		}
		// Cleanup
		App.GLOBAL_BOOKING = App.Utils.createBooking();

		// Re-render item view
		this.render();
	},

	clear: function(evt) {
		evt.preventDefault();
		this.model.destroy();
	}
});

var UserBookingsView = Backbone.View.extend({
	collection: UserBookings,
	
	initialize: function() {
		this.setElement($("#user-bookings"));

		this.listenTo(this.collection, "reset", this.addAll);
		this.listenTo(this.collection, "add", this.addOne);

		this.collection.fetch();
	},

	addAll: function() {
		// Clear list before adding item views
		this.$el.html("");
		this.collection.each(this.addOne, this);
	},

	addOne: function(booking) {
		var view = new BookingView({model: booking});
		this.$el.append(view.render().el);
	}
});

var BookingView = Backbone.View.extend({
	tagName: "li",

	events: {
		"click .destroy": "removeBooking"
	},

	initialize: function() {
		this.listenTo(this.model, "destroy", this.remove);
	},

	removeBooking: function(evt) {
		evt.preventDefault();
		if(confirm("Vill du verkligen avboka '"+this.model.get("room").name+"'?")) {
			this.model.destroy();
		}
	},

	render: function() {
		this.template = _.template($("#booking-template").html());

		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},


});

var RoomsView = Backbone.View.extend({

	collection: new App.Collections.RoomCollection,

	initialize: function() {
		this.setElement($("#rooms"));

		// Listen to collection events

		this.listenTo(this.collection, "reset", this.addAll);
		this.listenTo(this.collection, "add", this.addOne);
		
		//FIXME: workaround
		this.collection.model = App.Models.Room;
		
		this.collection.seedOrFetch();
	},

	refresh: function(filter) {
		var results = this.collection.where(filter);
		this.collection.reset(results);
	},

	addOne: function(room) {
		var view = new RoomView({model: room});
		this.$el.append(view.render().el);
	},

	addAll: function() {
		// Clear list before adding item views
		this.$el.html("");
		this.collection.each(this.addOne, this);
	}
});

var ControlView = Backbone.View.extend({

	events: {
		"change input" : "refresh",
		"change input[type='date'],input[type='time']" : "setDateTimes"
	},

	modelBindings: {
		"input[type='search']" : "name",
		"#booking-date" : "date",
		"#booking-start-time" : "startTime",
		"#booking-end-time" : "endTime"
	},

	initialize: function() {
		this.setElement($("#controls"));

		this.controls = this.$("input");
		this.rooms = new RoomsView;
		this.filter = {};

		this.updateInputs("now");
		/*
		if(this.rooms.collection != null) {
			var view = this;
			$.each(this.modelBindings, function(selector, attribute) {
				view.$(selector).on("change", function(evt){
					var data = view.$(evt.target).val();
					view.filter[attribute] = data;
				});
			});
		}
		*/
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

	refresh: function(evt) {
		//this.rooms.refresh(this.filter);
		
	}
});