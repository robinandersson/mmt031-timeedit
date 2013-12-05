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

$(function() {
	App.start();
});

// Visualization of time when looking at available rooms

$(document).ready(function() {
	var $td = $('.time-display');
	// Testing: Adds some text to display what hour each section of the time-display represents
	// $td.html('00 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23 00');
	
	// Adds 'hourly' lines for every time-display
	position_interval = 100/48;
	for (var i = 1; i < 48; i++) {
		if (i%2 > 0) {
			$("<div/>").appendTo('.time-display').addClass('line').css('margin-left', position_interval * i + '%').hide();
		} else {
			$("<div/>").appendTo('.time-display').addClass('line').css('margin-left', position_interval * i + '%');
		}
	};

	// Testing: Adding some booked times for preview.
	add_booked_time(1*60+22, 4*60);
	add_booked_time(5*60+22, 7*60);
	add_booked_time(14*60+30, 18*60);
	add_booked_time(23*60+1, 24*60);

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
	var selected_time = {start: 19*60, end: 22*60};
	var percentage_per_minute = 100/(24*60);
	$('<div class="time-segment" />').appendTo('.time-display').css({
		width: (selected_time.end - selected_time.start) * percentage_per_minute +'%',
		left: percentage_per_minute * selected_time.start + '%'
	});
	$('.time-segment').draggable({
		axis: 'x',
		containment: 'parent',
		snap: '.line, .segment',
		snapMode: 'both',
		snapTolerance: '7',
		stop: function(event, ui) {
			// console.log(this);
			console.log($(this).css('width'));
			console.log($(this).parent().css('width'));
		}
	}).resizable({
		containment: 'parent',
		handles: 'e, w',
		minWidth: '100%'
	});

	
	/*
		//This shit is old, when used lines instead of a box to display time
	$('<div class = "segment" />').appendTo('.time-display').addClass('segment-left').css({
		width: '0.5%',
		'border': '2px black',
		'border-style': 'dashed dashed dashed none',
		position: 'absolute',
		top: '0%',
		height: '94%',
		'left': 100/24 * 19 + '%'
	});
	$('<div class = "segment" />').appendTo('.time-display').addClass('segment-right').css({
		width: '0.5%',
		'border': '2px black',
		'border-style': 'dashed none dashed dashed',
		position: 'absolute',
		top: '0%',
		height: '94%',
		'left': 100/24 * 21 + '%'
	});
	var segment_positions = {'segment-left': {x: 'false', y: 'false'}, 'segment-right': {x: 'false', y: 'false'}};
	$('.segment').draggable({
		axis: 'x',
		containment: 'parent',
		snap: '.line, .segment',
		snapMode: 'inner',
		start: function(event, ui) {
			console.log(event.target);
		},
		drag: function(event, ui) {
			// if (event.target.)
		}
	});
	$('.segment-right').draggable('option', 'snapMode', 'outer');*/


	/*
		This adds one booked timeslot for a start time (minutes) and an end time, for a room's time display.
	*/
	function add_booked_time(start, end
		// , room_class
		) {
		percentage = 100/(60*24);
		timespan = end*percentage-start*percentage;

		$('.room-name').parent().children('.time-display').append('<div class="timebox '+start+' '+end+'"></div>');
		$('.timebox.'+start+'.'+end).css({
			width: timespan+'%',
			'margin-left': start*percentage+'%'
		});
	};
});
