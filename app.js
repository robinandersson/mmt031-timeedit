//
// MAIN APP
// 

(function($, exports) {

	exports.App = {

		createUserBooking: function(collection, model) {
			var m = collection.create(model);
			UserBookings.add(m);
		},

		start: function() {
			console.log("Initializing app ...");

			// Set current date/time span on global booking model
			var booking = App.GLOBAL_BOOKING = App.Utils.createBooking();

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

		Utils: {
			/*
				Generate a new booking from today's date and time
			 */
			createBooking: function(){
				return new App.Models.Booking(App.Utils.generateNextDateSpan());
			},
			generateNextDateSpan: function() {
				var now = new Date();
				var nextHour = parseInt(now.hhmm().substr(0, 2)) + 1;

				return {
					date: now.yyyymmdd(),
					startTime: now.hhmm(),
					endTime: nextHour + now.hhmm().substr(2)
				};
			},

			dateFromTime: function(dateString, time) {
				var date = new Date(dateString),
						time = time.split(":");

				date.setHours(time[0]);
				date.setMinutes(time[1]);

				return date;
			}
		},

		// Namespaces

		Views: {},
		Models: {},
		Collections: {}
	};

})(jQuery, window);

