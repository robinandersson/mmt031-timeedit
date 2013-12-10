/*
	The room schedule visualization
*/

var TimeslotView = Backbone.View.extend({

	tagName: "div",
	className: "timebox",

	initialize: function(args) {
		this.parent = args.parent;
	},

	render: function() {

		// Rendering code based on model.startTime and model.endTime goes here ...

		var start_split = this.model.get('startTime').split(':');
		var end_split = this.model.get('endTime').split(':');

		var start_pixels = (start_split[0] * 12 + start_split[1]/5) * this.parent.pixels_per_five_minutes;
		var end_pixels = (end_split[0] * 12 + end_split[1]/5) * this.parent.pixels_per_five_minutes;

		var timespan_pixels = end_pixels - start_pixels;

		this.$el.css({
			width: timespan_pixels + 'px',
			left: ((start_split[0] * this.parent.pixels_per_five_minutes * 12) + (start_split[1] / 5 * this.parent.pixels_per_five_minutes)) +'px'
		});

		return this;
	}
});

var ScheduleView = Backbone.View.extend({

	pixels_per_five_minutes: 2,

	initialize: function(args) {
		this.bookings = args.model;
		this.subViews = [];
		
		this.createTimeslotViews(this.bookings.models);
	},

	/*
		Assign several subviews and render them
	 */
	createTimeslotViews: function(models) {
		_.each(models, function (booking) {
			this.subViews.push( new TimeslotView({model: booking, parent: this}) );
		}, this);
	},

	updateSegmentData: function(evt, segment) {
		var start, width;
		var el = $(this);
		
		if(segment === undefined) {
			el = this.$el.find(".time-segment");
			width = el.width();
			start = parseInt(el.css("left"));
		}
		else {
			if(segment.position !== undefined) 
				start = segment.position.left;
			else
				start = parseInt(el.css("left"));
			
			if(segment.size !== undefined)
				width = segment.size.width;
			else 
				width = el.width();
		}

		this.timeslotData = {
			startTime: start,
			endTime: start + width
		}
	},

	createSegment: function(timeslot) {

		if(timeslot === undefined) {
			timeslot = {
				startTime: $("#booking-start-time").val(),
				endTime: $("#booking-end-time").val()
			};
		}

		var view = this;
		var $el = $('<div class="time-segment" />');
		var time_end = timeslot.endTime.split(":");
		var time_start = timeslot.startTime.split(":");

		$el.css({
			width: (((time_end[0] * 12 + time_end[1]/5)
					- (time_start[0] * 12 + time_start[1]/5)) * this.pixels_per_five_minutes) +'px',
			left: this.pixels_per_five_minutes * time_start[0] * 12 + this.pixels_per_five_minutes * time_start[1]/5 + 'px'
		});

		$el.draggable({
			axis: 'x',
			containment: 'parent',
			grid: [2, 2],
			snapMode: 'inner',
			snapTolerance: '7',
			drag: view.updateSegmentData
		}).resizable({
			containment: 'parent',
			handles: 'e, w',
			minWidth: '100%',
			grid: [2, 2],
			stop: view.updateSegmentData
		});

		var that = this;
		$el.on("drag", function(evt, data){
			that.trigger("segment:dragged", evt, data);
		});

		return $el;
	},

	render: function() {
		_(this.subViews).each(function(subview) {
			this.$el.append(subview.render().el);
		}, this);

		this.$el.append(this.createSegment());
		this.updateSegmentData();
	}
});
