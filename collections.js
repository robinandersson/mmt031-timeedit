/*
	COLLECTIONS
--------------------------------
 */

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

 App.Collections.BookingCollection = BaseCollection.extend({
	model: App.Models.Booking,
	localStorage: new Backbone.LocalStorage("Bookings")
});

 App.Collections.UserBookingCollection = BaseCollection.extend({
	model: App.Models.Booking,
	localStorage: new Backbone.LocalStorage("UserBookings")
});

 var UserBookings = new App.Collections.UserBookingCollection;

 App.Collections.RoomCollection = BaseCollection.extend({
	// Here, the local seed file
	url: "/rooms.json",
	model: App.Models.Room,
	localStorage: new Backbone.LocalStorage("Rooms")
});
