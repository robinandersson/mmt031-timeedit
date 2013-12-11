/*
	The room schedule visualization
*/

var TimeslotView = Backbone.View.extend({

	tagName: "div",
	className: "timebox",

	initialize: function(args) {
		this.parent = args.parent;
		this.listenTo(this.model, "destroy", this.remove);
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

		this.listenTo(this.bookings, "remove", this.removeSubView);
		this.listenTo(UserBookings, "remove", this.removeSubView);
	},

	removeSubView: function(model, collection) {
		var m = this.bookings.findWhere({id: model.get("id")});
		if(m !== undefined) m.destroy();
	},

	/*
		Assign several subviews and render them
	 */
	createTimeslotViews: function(models) {
		var views = [];
		_.each(models, function (booking) {
			views.push( new TimeslotView({model: booking, parent: this}) );
		}, this);

		return views;
	},

	updateSegmentData: function(evt, segment) {
		var start, width;
		var el = (segment === undefined) ? this.$el.find(".time-segment") : segment.helper;
		
		if(segment === undefined) {
			width = el.width();
			start = parseInt(el.css("left"));
		}
		else {
			start = (segment.position !== undefined) ? segment.position.left : parseInt(el.css("left"));
			width = (segment.size !== undefined) ? segment.size.width : el.width();
		}

		this.timeslotData = {
			startTime: start,
			endTime: start + width
		};

		this.trigger("segment:dragged", evt, this, el);
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
			snapTolerance: '7'
		}).resizable({
			containment: 'parent',
			handles: 'e, w',
			minWidth: '100%',
			grid: [2, 2]
		});

		$el.on("drag stop resize", function(evt, data) {
			view.updateSegmentData.call(view, evt, data);
		});

		return $el;
	},

	render: function() {

		var subviews = this.createTimeslotViews(this.bookings.models);

		_.each(subviews, function(subview) {
			this.$el.append(subview.render().el);
		}, this);

		this.$el.append(this.createSegment());
		this.updateSegmentData();
	}
});
