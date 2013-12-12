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
		var hours = date.getHours(),
				day = date.getDate(),
				now = new Date(date.getTime());
		
		now.setHours(hours + value);
		now.setDate(day);
		
		return now;
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

			if(isBefore) {
				if(date1 >= date2) {
					console.log("Is before, incrementing");
					date2 = incrementHourInterval(date1);
					$other.val(date2.hhmm(false));
				}				
			}
			else {
				if(date1 <= date2) {
					console.log("Decrementing");
					date2 = decrementHourInterval(date1);

					// Do another check 
					if(date1 <= date2) {
						console.warn("You cannot filter on several days");
					}
					else {
						$other.val(date2.hhmm(false));
					}
				}
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
		closeTrigger: ".expand",
		extra: ".extra",
		expandedClass: "expanded",
		duration: 100,
		child: true,
		slideParent: false,
		start: function(el) {
			el.toggleClass(settings.expandedClass);
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

		close: function(el, expandElement) {

			el[method](expandElement).slideUp({
				duration: settings.duration + 300,
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

			if(!$(settings.trigger).is(settings.closeTrigger)) {
				$this.delegate(settings.trigger, "click", function(evt){
					evt.preventDefault();
					
					var exp = ($(this).is("li")) ? $(this) : $(this).parents("li");
					if($(this).hasClass(settings.expandedClass)) return;

					methods.expand(exp, settings.extra);
				});

				$this.delegate(settings.closeTrigger, "click", function(evt){
					evt.preventDefault();
					
					var exp = ($(this).is("li")) ? $(this) : $(this).parents("li");
					if(!exp.hasClass(settings.expandedClass)) {
						return;
					}
					else {
						evt.stopPropagation();
					}

					methods.close(exp, settings.extra);
				});
			}
			else {

				$this.delegate(settings.trigger, "click", function(evt){
					evt.preventDefault();
					var exp = ($(this).is("li")) ? $(this) : $(this).parents("li");
					methods.toggle(exp);
				});

			}
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
		trigger: "li",
		closeTrigger: ".room-expand",
		extra: ".room-additional",
		child: true,
		slideParent: true
	});

	$("#user-bookings").toggleExtra({
		trigger: "li:not(.no-expand)",
		closeTrigger: "li:not(.no-expand)",
		extra: ".booking-extra"
	});

	$.fn.tipsy.defaults.live = true;
	$(".timebox").tipsy();

});