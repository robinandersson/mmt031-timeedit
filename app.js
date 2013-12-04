//
// MAIN APP
// 

(function($, exports) {

	exports.App = {

		getEmptyTemplate: function() {
			return _.template($("#empty-list-template").html());
		},

		start: function() {
			console.log("Initializing app ...");

			// Set current date/time span on global booking model
			var booking = App.GLOBAL_BOOKING = App.createBooking();

			booking.on("invalid", function(model, error) {
				console.error(error);
			});

			App.Views = {
				UserBookings: new UserBookingsView,
				Controls: new ControlView
			};
		},

		/*
			Reset the app data (rooms and bookings localstorage)
		 */
		reset: function() {
			UserBookings.localStorage._clear();
			Rooms.localStorage._clear();

			UserBookings.reset();
			Rooms.reset();
		},

		/*
			Generate a new booking from today's date and time
		 */
		createBooking: function(){
			return new App.Models.Booking(Utils.generateNextDateSpan());
		},

		// Namespaces

		Views: {},
		Models: {},
		Collections: {}
	};

})(jQuery, window);

