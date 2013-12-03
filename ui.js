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
					$other = $input.parent().find("input[type='time']").not(this),
					isBefore = $input.data("time") === "start" ? true : false;

			var date1 = getDateFromTime($input.val()),
					date2 = getDateFromTime($other.val());

			if(date1 >= date2) {

				if(isBefore) {
					date2 = incrementHourInterval(date2);
				}
				else {
					date2 = decrementHourInterval(date2);
				}

				$other.val(formatTime(date2));
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

$.fn.toggleExtra = function(options) {
	var defaults = {
		trigger: ".expand",
		extra: ".extra",
		expandedClass: "expanded",
		duration: 100,
		child: true
	},

	settings = $.extend({}, defaults, options);

	return this.each(function() {
		var method = (settings.child) ? "children" : "nextAll";

		$(this).delegate(settings.trigger, "click", function(evt){
			evt.preventDefault();

			$(this)[method](settings.extra).slideToggle({
				duration: settings.duration,
				start: function() {
					$(this).parents("li").toggleClass(settings.expandedClass);
				}
			});
		});
	});
};

$(function() {
/*
	$("#booking-location").listSearch({
		list: "#rooms",
		fields: ['.room-name']
	});*/
	$("#booking-start-time").incrementDates("#booking-end-time");
	
	$("#rooms").toggleExtra({
		trigger: ".room-expand",
		extra: ".room-additional",
		child: false
	});

	$("#user-bookings").toggleExtra({
		trigger: "li",
		extra: ".booking-extra"
	});

});