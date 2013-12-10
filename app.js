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
			Add some default bookings to some rooms
		*/
		bootstrap: function(rooms) {
			var room = rooms.models[0];
			var date = Utils.generateNextDateSpan();
			var data = _.extend(date, {room: room});

			var m = room.bookings.create(data);

			/*rooms.each(function(room, index) {
				var data = {
					room: room
				},
				date = Utils.generateNextDateSpan();

				_.extend(data, date);
				var m = room.bookings.create(data);
			});*/
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

$(function() {
	App.start();
});

// Visualization of time when looking at available rooms

$(document).ready(function() {
	var $td = $('.time-display');
	var pixels_per_five_minutes = 2;
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

	// Testing: Adding some booked times for preview.
	add_booked_time('5:15', '7:15');
	add_booked_time('9:00', '11:00');
	add_booked_time('11:30', '13:30');
	// add_booked_time(14*60+30, 18*60);
	// add_booked_time(23*60+1, 24*60);

	// Adds the posting of the mouseposition any time you hover a time display element
	var t = false;
	var currentMousePosition = {x: -1, y: -1};
	// $td.mouseover(function(event) {
	// 	t = setInterval(function() {
	// 		currentMousePosition.x = event.pageX;
	// 		currentMousePosition.y = event.pageY;
	// 		console.log(currentMousePosition);
	// 	}, 100);
		
	// });
	// $td.mouseout(function() {
	// 	clearInterval(t);
	// 	t = false;
	// });

	// Adds draggable segments in the time display that represents the selected timespan
	$("#booking-start-time, #booking-end-time").change(function () {
		selected_time.start = $("#booking-start-time").val();
		selected_time.end = $("#booking-end-time").val();
		console.log(selected_time);
		// Remove earlier timesegments and add new ones.
		$('.time-segment').remove();
		$('<div class="time-segment" />').appendTo('.time-display').css({
			width: (selected_time.end - selected_time.start) * pixels_per_five_minutes +'%',
			left: pixels_per_five_minutes * selected_time.start + '%'
		});
		$('.time-segment').draggable({
			axis: 'x',
			containment: 'parent',
			// snap: '.line, .segment',
			grid: [2, 2],
			snapMode: 'both',
			snapTolerance: '7',
			stop: function(event, ui) {
				console.log($(this).css('width'));
				console.log($(this).parent().css('width'));
			}
		}).resizable({
			containment: 'parent',
			handles: 'e, w',
			minWidth: '100%',
			grid: [2, 2]
		});
	});
	var selected_time = {start: '13:15', end: '18:30'};
	console.log("hej" + $('input#booking-start-time').val());
	var time_end = selected_time.end.split(":");
	var time_start = selected_time.start.split(":");
	console.log("" + time_end + ", " + time_start);

	$('<div class="time-segment" />').appendTo('.time-display').css({
		width: (((time_end[0] * 12 + time_end[1]/5)
				- (time_start[0] * 12 + time_start[1]/5)) * pixels_per_five_minutes) +'px',
		left: pixels_per_five_minutes * time_start[0] * 12 + pixels_per_five_minutes * time_start[1]/5 + 'px'
	});
	$('.time-segment').draggable({
		axis: 'x',
		containment: 'parent',
		// snap: '.line, .segment',
		grid: [2, 2],
		snapMode: 'inner',
		snapTolerance: '7',
		stop: function(event, ui) {
			// console.log(this);
			console.log($(this).css('width'));
			console.log($(this).parent().css('width'));
		}
	}).resizable({
		containment: 'parent',
		handles: 'e, w',
		minWidth: '100%',
		grid: [2, 2]
	});


	/*
		This adds one booked timeslot for a start time (minutes) and an end time, for a room's time display.
	*/
	function add_booked_time(start, end
		// , room_class
		) {
		var start_split = start.split(':');
		var end_split = end.split(':');
		console.log((start_split[0] * 12 + start_split[1] /5));
		console.log((end_split[0] * 12 + end_split[1] /5));

		var start_pixels = (start_split[0] * 12 + start_split[1]/5) * pixels_per_five_minutes;
		var end_pixels = (end_split[0] * 12 + end_split[1]/5) * pixels_per_five_minutes;

		// percentage = 100/(60*24);
		timespan_pixels = end_pixels - start_pixels;
		console.log("--Start: " + start_pixels);
		console.log("--End: " + end_pixels);
		console.log(timespan_pixels);

		$('.room-name').parent().children('.time-display').append('<div class="timebox '+start_split[0]+start_split[1]+' '+end_split[0]+end_split[1]+'"></div>');
		$('.timebox.'+start_split[0]+start_split[1]+'.'+end_split[0]+end_split[1]).css({
			width: timespan_pixels + 'px',
			'left': ((start_split[0] * pixels_per_five_minutes * 12) + (start_split[1] / 5 * pixels_per_five_minutes)) +'px'
		});
	};
});
