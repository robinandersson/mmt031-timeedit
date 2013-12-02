// "Abstract" base collection

var BaseCollection = Backbone.Collection.extend({

	seed: function() {
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


var Room = Backbone.Model.extend({

});

var RoomCollection = BaseCollection.extend({
	// Here, the local seed file
	url: "/rooms.json",
	model: Room,
	// Create local store
	localStorage: new Backbone.LocalStorage("Rooms")
});

var Rooms = new RoomCollection;

var RoomView = Backbone.View.extend({
	tagName: "li",

	events: {
		"click a.destroy" : "clear"
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

		if(this.rooms.collection != null) {
			var view = this;
			$.each(this.modelBindings, function(selector, attribute) {
				view.$(selector).on("change", function(evt){
					var data = view.$(evt.target).val();
					view.filter[attribute] = data;
				});
			});
		}
	},

	refresh: function(evt) {
		console.log(this.filter);
		this.rooms.refresh(this.filter);
	}
});

(function($, exports) {

	exports.App = {
		start: function() {
			console.log("Initializing app ...");
			App.Collections.Rooms = Rooms;

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
			console.log($(this).)
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