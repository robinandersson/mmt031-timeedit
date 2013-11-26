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

$(function() {

	$("#booking-start-time").incrementDates("#booking-end-time");

});