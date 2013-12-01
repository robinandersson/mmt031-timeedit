//
// MAIN APP
// 

(function($, exports) {

	exports.App = {

		createUserBooking: function(collection, model) {
			collection.add(model);
			UserBookings.add(model);
			model.save();
		},

		start: function() {
			console.log("Initializing app ...");

			// Set current date/time span on global booking model
			var booking = App.GLOBAL_BOOKING = App.Utils.createBooking();

			booking.on("invalid", function(model, error) {
				console.error(error);
			});

			App.Views = {
				UserBookings: new UserBookingsView,
				Controls: new ControlView
			};
		},

		Utils: {
			/*
				Generate a new booking from today's date and time
			 */
			createBooking: function(){
				return new App.Models.Booking(App.Utils.generateNextDateSpan());
			},
			generateNextDateSpan: function() {
				var now = new Date();
				var nextHour = parseInt(now.hhmm().substr(0, 2)) + 1;

				return {
					date: now.yyyymmdd(),
					startTime: now.hhmm(),
					endTime: nextHour + now.hhmm().substr(2)
				};
			},

			dateFromTime: function(dateString, time) {
				var date = new Date(dateString),
						time = time.split(":");

				date.setHours(time[0]);
				date.setMinutes(time[1]);

				return date;
			}
		},

		// Namespaces

		Views: {},
		Models: {},
		Collections: {}
	};

})(jQuery, window);

// Use recursive toJSON for nested models and collections

Backbone.Model.prototype.toJSON = function() {
  var json = _.clone(this.attributes);
  for(var attr in json) {
    if((json[attr] instanceof Backbone.Model) || (json[attr] instanceof Backbone.Collection)) {
      json[attr] = json[attr].toJSON();   
    }
  }
  return json;
};


// Format dates

Date.prototype.yyyymmdd = function() {         
                      
	var yyyy = this.getFullYear().toString();                                    
	var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based         
	var dd  = this.getDate().toString();             
	                  
	return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
};

/**
 * Round off to closest five minute span (ceil).
 *
 * Ex. 	15:54 => 15:55
 * 			15:51 => 15:55
 * 			15:56 => 16.00
 * 			
 * @return A string on the format "HH:mm"
 */
Date.prototype.hhmm = function() {
	var hours = this.getHours();
	var minutes = this.getMinutes();
	var interval = 5;

	var minutes = Math.ceil((minutes+1) / interval) * interval;

	if(minutes === 60) {
		hours++;
		minutes = "00";

		if(hours >= 24) {
			hours = "00";
		}
	}

	return hours + ":" + minutes;
};


$(function() {
	App.start();
});
