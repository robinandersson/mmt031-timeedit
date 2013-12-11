$.fn.incrementDates = function(other) {

	var INTERVAL = 5,
			HOUR_OFFSET = 1;

	function formatTime(date) {
		return date.getHours()+":"+date.getMinutes();
	}

	function getDateFromTime(time) {
		var date = new Date(),
				time = time.split(":");
		date.setHours(time[0]);
		date.setMinutes(time[1]);

		return date;
	}

	function incrementMinuteInterval(date) {
		var hours = date.getHours();
		var minutes = date.getMinutes();

		var minutes = Math.ceil((minutes+1) / INTERVAL) * INTERVAL;

		if(minutes === 60) {
			hours++;
			minutes = "00";

			if(hours >= 24) {
				hours = "00";
			}
		}

		return getDateFromTime(hours + ":" + minutes);
	}

	function changeHours(date, value) {
		var hours = date.getHours();
		date.setHours(hours + value);
		return date;
	}

	function incrementHourInterval(date) {
		return changeHours(date, HOUR_OFFSET);
	}

	function decrementHourInterval(date) {
		return changeHours(date, -HOUR_OFFSET);
	}

	return this.each(function() {
		var $this = $(this);

		$this.add(other).on("change", function(evt) {
			var $input = $(evt.currentTarget),
					$other = $input.parents("#controls").find("input[type='time']").not($input),
					isBefore = $input.data("time") === "start" ? true : false;

			var date1 = getDateFromTime($input.val()),
					date2 = getDateFromTime($other.val());

			//FIXME: known bug. If the start time is ex. 00:20 and end time is thus
			// 01:20, and you *decrease* the hours in the start time to 23:20, the
			// end time will incorrectly *increase* to 02:20. This is becase the date
			// comparison below will give true, since the getDateFromTime() helper
			// will set the same *day* on the timestamps. Thus is 00:20 *more* than 01:20.

			if(date1 >= date2) {

				if(isBefore) {
					date2 = incrementHourInterval(date2);
				}
				else {
					date2 = decrementHourInterval(date2);
				}

				$other.val(date2.hhmm(false));
			}
		});
	});
};

$.fn.listSearch = function(options) {
	var defaults = {
		list: "#list",
		fields: []
	};

	var settings = $.extend({}, defaults, options);

	return this.each(function() {
		var items = $(settings.list).find("li");

		$(this).bind("keyup", function(evt){
			var filter = $(this).val();

			// If 'Esc'
			if(evt.keyCode === 27){
				items.show();
				$(this).val("").trigger("blur");
				return;
			}

			items.each(function(){
				var el = $(this),
						text = (settings.fields.length > 0) ? el.find(settings.fields.join(",")).text() 
							: el.text();

				var action = (text.search(new RegExp(filter, "i")) >= 0) ? "show" : "hide";
				el[action]();
			});

		})
		.bind("blur search", function(){
			if($(this).val() == ""){
				items.show();
			}
		});
	});
};

$.fn.toggleExtra = function(options, extra) {
	var defaults = {
		trigger: ".expand",
		extra: ".extra",
		expandedClass: "expanded",
		duration: 100,
		child: true,
		start: function(el) {
			el.parents("li").toggleClass(settings.expandedClass);
		}
	},

	settings = {};

	if(typeof options !== "string") {
		settings = $.extend({}, defaults, options);
	}
	else {
		settings = defaults;
	}

	var method = (settings.child) ? "children" : "nextAll";

	var methods = {
		expand: function(el, expandElement) {
			el[method](expandElement).slideDown({
				duration: settings.duration,
				start: settings.start(el)
			});
		},

		toggle: function(el) {
			el[method](settings.extra).slideToggle({
				duration: settings.duration,
				start: settings.start(el)
			});
		}
	};

	return this.each(function() {
		var $this = $(this);

		if(typeof options === "string" && extra !== undefined) {
			methods.expand($this, extra);
		}
		else {
			$this.delegate(settings.trigger, "click", function(evt){
				evt.preventDefault();
				methods.toggle($(this));
			});
		}
	});
};

function updateInputs(dateHash) {
	var dateObject = {};
	if(typeof dateHash === "string" && dateHash === "now") {
		dateObject = Utils.generateNextDateSpan();
	}

	$("#booking-date").val(dateObject.date);
	$("#booking-start-time").val(dateObject.startTime);
	$("#booking-end-time").val(dateObject.endTime);

	App.Views.Controls.refresh();
}

$(function() {

	// Disable past dates in the datepicker
	$("#booking-date").attr("min", function() {
		return (new Date).yyyymmdd();
	});

	$("#booking-start-time").incrementDates("#booking-end-time");
	
	$("#rooms").toggleExtra({
		trigger: ".room-expand",
		extra: ".room-additional",
		child: false
	});

	$("#user-bookings").toggleExtra({
		trigger: "li:not(.no-expand)",
		extra: ".booking-extra"
	});

});