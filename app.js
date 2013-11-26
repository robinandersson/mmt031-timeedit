//
// MAIN APP
// 

// Use recursive toJSON for nested models and collections

Backbone.Model.prototype.toJSON = function() {
  var json = _.clone(this.attributes);
  for(var attr in json) {
    if((json[attr] instanceof Backbone.Model) || (json[attr] instanceof Backbone.Collection)) {
      json[attr] = json[attr].toJSON();   
    }
  }
  return json;
};


// Format dates

Date.prototype.yyyymmdd = function() {         
                      
	var yyyy = this.getFullYear().toString();                                    
	var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based         
	var dd  = this.getDate().toString();             
	                  
	return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
};

/**
 * Round off to closest five minute span (ceil).
 *
 * Ex. 	15:54 => 15:55
 * 			15:51 => 15:55
 * 			15:56 => 16.00
 * 			
 * @return A string on the format "HH:mm"
 */
Date.prototype.hhmm = function() {
	var hours = this.getHours();
	var minutes = this.getMinutes();
	var interval = 5;

	var minutes = Math.ceil((minutes+1) / interval) * interval;

	if(minutes === 60) {
		hours++;
		minutes = "00";

		if(hours >= 24) {
			hours = "00";
		}
	}

	return hours + ":" + minutes;
};


// "Abstract" base collection

var BaseCollection = Backbone.Collection.extend({

	seed: function() {
		// Don't try to seed if no source (url or file) is specified
		if(!this.url) return;

		console.log("Seeding from "+this.url+" into '"+this.localStorage.name+"' store ...");
		var collection = this;

		// Fetch models from URL and inject into the collection.
		// Also remember to initially create the models in the local store
		// as well.
		$.getJSON(this.url, function(json) {
			if(json && json.length) 
				var models = collection.reset(json);
				$.each(models, function(i, model) {
					collection.localStorage.create(model);
				});
				console.log("* Done seeding "+models.length + " models into store");
		});
	},

	// If the local store is empty, seed it from remote. Else, fetch from
	// local store into collection.
	seedOrFetch: function() {
		(!this.localStorage.findAll().length) ? this.seed() : this.fetch();
	}
});


var Booking = Backbone.Model.extend({
	room: null
});

var BookingCollection = BaseCollection.extend({
	model: Booking,
	localStorage: new Backbone.LocalStorage("Bookings")
});

var Room = Backbone.Model.extend({
	bookings: new BookingCollection
});

var UserBookingCollection = BaseCollection.extend({
	model: Booking,
	localStorage: new Backbone.LocalStorage("UserBookings")
});

var RoomCollection = BaseCollection.extend({
	// Here, the local seed file
	url: "/rooms.json",
	model: Room,
	localStorage: new Backbone.LocalStorage("Rooms")
});

var Rooms = new RoomCollection;
var UserBookings = new UserBookingCollection;

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
		console.log("Creating booking");
		
		App.GLOBAL_BOOKING.set({room: this.model});

		this.model.bookings.add(App.GLOBAL_BOOKING);
		UserBookings.add(App.GLOBAL_BOOKING);

		App.GLOBAL_BOOKING.save();

		// Cleanup
		App.GLOBAL_BOOKING = App.Utils.createBooking();
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
	collection: Rooms,

	initialize: function() {
		this.setElement($("#rooms"));

		// Listen to collection events

		this.listenTo(this.collection, "reset", this.addAll);
		this.listenTo(this.collection, "add", this.addOne);

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
		//"change input" : "refresh"
	},

	modelBindings: {
		"input[type='search']" : "name"
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
		this.rooms.refresh(this.filter);
	}
});

(function($, exports) {

	exports.App = {
		start: function() {
			console.log("Initializing app ...");

			// Set current date/time span on global booking model
			App.GLOBAL_BOOKING = App.Utils.createBooking();
			
			App.Collections = {
				Rooms: Rooms,
				UserBookings: UserBookings
			};

			App.Views = {
				UserBookings: new UserBookingsView,
				Controls: new ControlView
			};
		},

		Utils: {
			/*
				Generate a new booking from today's date and time
			 */
			createBooking: function(){
				return new Booking(App.Utils.generateNextDateSpan());
			},
			generateNextDateSpan: function() {
				var now = new Date();
				var nextHour = parseInt(now.hhmm().substr(0, 2)) + 1;

				return {
					date: now.yyyymmdd(),
					startTime: now.hhmm(),
					endTime: nextHour + now.hhmm().substr(2)
				};
			}
		},

		// Namespaces

		Views: {},
		Models: {},
		Collections: {}
	};

})(jQuery, window);

$(function() {
	App.start();
});
