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
	url: null,
	model: Booking,
	localStorage: new Backbone.LocalStorage("Bookings")
});

var Room = Backbone.Model.extend({
	bookings: new BookingCollection
});

var UserBookingCollection = BaseCollection.extend({
	url: null,
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

var GLOBAL_BOOKING = new Booking;

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
		
		var booking = new Booking({room: this.model});
		this.model.bookings.add(booking);
		UserBookings.add(booking);

		// Datum
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

		this.listenTo(this.collection, "add", this.addOne);
	},

	addOne: function(booking) {
		var view = new UserBookingView({model: booking});
		this.$el.append(view.render().el);
	},
});

var UserBookingView = Backbone.View.extend({
	tagName: "li",

	render: function() {
		this.template = _.template($("#booking-template").html());

		console.log(this.model.toJSON());

		this.$el.html(this.template(this.model.toJSON()));
		return this;
	}
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
		"change input" : "refresh"
	},

	modelBindings: {
		"input[type='search']" : "name"
	},

	initialize: function() {
		this.setElement($("#controls"));

		this.controls = this.$("input");
		this.rooms = new RoomsView;
		this.filter = {};

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

	refresh: function(evt) {
		this.rooms.refresh(this.filter);
	}
});

(function($, exports) {

	exports.App = {
		start: function() {
			console.log("Initializing app ...");
			App.Collections.Rooms = Rooms;
			App.Collections.Bookings = UserBookings;
			App.Views.UserBookings = new UserBookingsView;

			(new BookingCollection).seedOrFetch();

			App.Views = {
				Controls: new ControlView
			};
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
