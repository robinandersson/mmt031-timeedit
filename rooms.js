/*
	ROOMS
--------------------------------
 */

App.Collections.RoomCollection = BaseCollection.extend({
	// Here, the local seed file
	url: "/rooms.json",
	model: App.Models.Room,
	localStorage: new Backbone.LocalStorage("Rooms"),
	comparator: "name",
	
	conditions: {
		matchName: function(filter, model) {
			return model.get("name").search(new RegExp(filter.name, "i")) >= 0;
		},

		isAvailable: function(filter, model) {
			var startDate = Utils.dateFromTime(filter.date, filter.startTime);
			var endDate = Utils.dateFromTime(filter.date, filter.endTime);

			return !model.isBookedDuringTimespan(startDate, endDate);
		}
	},

	/*
		Custom search function that returns the rooms
		that matches `filter` (name, availability, etc).

		Put search conditions as a hash in the root. The values
		should be truth test functions.

		Does fuzzy search for the `name` attribute.
	 */
	search: function(filter) {
		var results = [],
				collection = this;

		_.each(this.models, function(model) {
			var result = _.every(collection.conditions, function(func, name){
				var r = func(filter, model);
				return r;
			});

			if(result) {
				results.push(model);
			}
		});

		return new App.Collections.RoomCollection(results);
	}
});

var Rooms = new App.Collections.RoomCollection;

App.Models.Room = App.Models.BaseModel.extend({

 	computed: ['isBookedRightNow'],

 	initialize: function() {
 		this.bookings = new App.Collections.BookingCollection;

 		this.bootstrap();
 	},

 	bootstrap: function() {
 		var now = new Date;
 		now.setHours(10);
 		var next = new Date(now);
 		next.setHours(12);

 		var date = {
 			date: now.yyyymmdd(),
 			startTime: now.hhmm(),
 			endTime: next.hhmm()
 		};
 		var data = _.extend({room: this}, date);

 		var m = this.bookings.create(data);
 	},

 	isBookedRightNow: function() {
 		var now = new Date;
 		return this.bookings.filter(function(b){
 			var startDate = Utils.dateFromTime(b.get("date"), b.get("startTime"));
 			var endDate = Utils.dateFromTime(b.get("date"), b.get("endTime"));
 			
 			return startDate < now && now < endDate;
 		}).length > 0;
 	},

 	isBookedDuringTimespan: function(date1, date2) {
 		return this.bookings.filter(function(b){
 			var startDate = Utils.dateFromTime(b.get("date"), b.get("startTime"));
 			var endDate = Utils.dateFromTime(b.get("date"), b.get("endTime"));
 			
 			return (date1 < startDate && startDate < date2) || (startDate < date1 && date1 < endDate);
 		}).length > 0;
 	}
 });

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

 		// Create sub views
 		this.scheduleView = new ScheduleView({model: this.model.bookings});
 	},

 	render: function() {
 		this.$el.html(this.template(this.model.toJSON()));
 		var opts = this.$el.find(".booking-purpose option");
 		if(opts.length == 1) {
 			opts.parents("select").attr("disabled", true);
 		}

 		// Assign and render schedule view
 		this.assign(this.scheduleView, ".time-display");

 		return this;
 	},

 	assign: function(view, selector) {
 		if(!view) return;
 		view.setElement(this.$(selector)).render();
 	},

 	createBookingData: function(roomView) {
 		return {
 			room: roomView.model,
 			comment: roomView.$el.find(".booking-comment").val(),
 			description: roomView.$el.find(".booking-description").val(),
 			purpose: roomView.$el.find(".booking-purpose option:selected").text()
 		};
 	},

 	createBooking: function(evt) {

 		App.GLOBAL_BOOKING.set(this.createBookingData(this));

 		console.log(this.scheduleView.timeslotData);

 		if(App.GLOBAL_BOOKING.isValid()) {
 			this.model.bookings.create(App.GLOBAL_BOOKING);
 			UserBookings.create(App.GLOBAL_BOOKING.clone());

 			// Cleanup
 			App.GLOBAL_BOOKING = App.createBooking();
 		}

 		// Re-render item view
 		this.render();
 	},

 	clear: function(evt) {
 		evt.preventDefault();
 		this.model.destroy();
 	}
 });

 var RoomsView = Backbone.View.extend({

 	collection: Rooms,

 	initialize: function() {
 		this.setElement($("#rooms"));

 		// Listen to collection events

 		this.listenTo(this.collection, "reset", this.addAll);
 		this.listenTo(this.collection, "add", this.addOne);
 		
 		//FIXME: workaround
 		this.collection.model = App.Models.Room;
 		
 		this.collection.seedOrFetch();
 	},

 	createTimeSegments: function(timeslot) {
 		this.$el.find(".time-segment").css({
 			width: (timeslot.endTime - timeslot.startTime) * 2 +'%',
 			left: 2 * timeslot.startTime + '%'
 		});
 	},

 	refresh: function(filter) {
 		this.searchCollection = this.collection.search(filter);
 		this.renderSearch();
 	},

 	renderSearch: function() {
 		this.$el.html("");
 		this.addAll(this.searchCollection);
 	},

 	addOne: function(room) {	
 		var view = new RoomView({model: room});
 		this.$el.append(view.render().el);
 	},

 	addAll: function(collection) {
 		// Clear list before adding item views
 		
 		if(collection.isEmpty()) {
 			var template = App.getEmptyTemplate();
 			this.$el.html(template({noun: "rum"}));
 		}
 		else {
 			this.$el.html("");
 			collection.each(this.addOne, this);
 		}
 	}
 });
