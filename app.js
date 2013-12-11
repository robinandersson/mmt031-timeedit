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
				Controls: new ControlView,
				UserBookings: new UserBookingsView
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

		initialBootstrapEnabled: false,

		/*
			Add some default bookings to some rooms
		*/
		bootstrap: function(rooms, bookingsPerRoom) {

			if(!this.initialBootstrapEnabled) return;

			console.log("* Bootstrapping rooms ...");
			rooms.each(function(room, index) {
				var max = Utils.randomFromInterval(1, bookingsPerRoom);

				for(var i = 1; i <= max; i++) {
					var data = Utils.createRandomBookingData(),
							date1 = Utils.dateFromTime(data.date, data.startTime),
							date2 = Utils.dateFromTime(data.date, data.endTime);

					if(!room.isBookedDuringTimespan(date1, date2)) {

						_.extend(data, {room: room});
						
						var m = room.bookings.create(data);
						// Add some bookings to Userbookings
						if(index % 3 == 0) {
							UserBookings.add(m);
							m.save();
						}
					}
				}
			});

			var totalBookings = rooms.reduce(function(memo, room) {
				return memo + room.bookings.length;
			}, 0);

			console.log("* Bootstrapped "+ totalBookings +" bookings into "+rooms.length+" rooms");
			console.log("* Added "+UserBookings.length+" bookings to UserBookings");
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

// Visualization of time when looking at available rooms

$(function() {
	// Testing: Adds some text to display what hour each section of the time-display represents
	// $td.html('00 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23 00');
	
	// // Adds 'hourly' lines for every time-display
	// position_interval = 100/48;
	// for (var i = 1; i < 48; i++) {
	// 	if (i%2 > 0) {
	// 		$("<div/>").appendTo('.time-display').addClass('line').css('margin-left', position_interval * i + '%').hide();
	// 	} else {
	// 		$("<div/>").appendTo('.time-display').addClass('line').css('margin-left', position_interval * i + '%');
	// 	}
	// };
});
