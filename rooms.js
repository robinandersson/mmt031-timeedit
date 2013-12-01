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
			var startDate = App.Utils.dateFromTime(filter.date, filter.startTime);
			var endDate = App.Utils.dateFromTime(filter.date, filter.endTime);

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
		console.log(filter);
		var results = [],
				collection = this;

		_.each(this.models, function(model) {
			var result = _.every(collection.conditions, function(func, name){
				var r = func(filter, model);
				console.log(model.get("name"), name, r);
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
 	},

 	isBookedRightNow: function() {
 		var now = new Date;
 		return this.bookings.filter(function(b){
 			var startDate = App.Utils.dateFromTime(b.get("date"), b.get("startTime"));
 			var endDate = App.Utils.dateFromTime(b.get("date"), b.get("endTime"));
 			
 			return startDate < now && now < endDate;
 		}).length > 0;
 	},

 	isBookedDuringTimespan: function(date1, date2) {
 		return this.bookings.filter(function(b){
 			var startDate = App.Utils.dateFromTime(b.get("date"), b.get("startTime"));
 			var endDate = App.Utils.dateFromTime(b.get("date"), b.get("endTime"));
 			
 			return (date1 <= startDate && startDate <= date2) || (startDate <= date1 && date1 <= endDate);
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

 	refresh: function(filter) {
 		console.log("Filter", filter);
 		var results = this.collection.search(filter);
 		console.log(results);
 		this.searchCollection = results;
 		this.renderSearch();
 	},

 	renderSearch: function() {
 		this.$el.html("");
 		this.searchCollection.each(this.addOne, this);
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
