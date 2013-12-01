/*
	MODELS
--------------------------
 */

App.Models.Booking = Backbone.Model.extend({

	validate: function(attrs, options) {
		if(attrs.startTime > attrs.endTime) {
			return "Bokningens starttid kan inte ligga efter dess sluttid";
		}

		if(attrs.room === undefined) {
			return "Du måste lägga till ett rum till din bokning";
		}
	}
});


App.Models.Room = Backbone.Model.extend({
	bookings: new App.Collections.BookingCollection,

	isBookedRightNow: function() {
		var now = new Date;
		return this.bookings.filter(function(b){
			var startDate = App.Utils.dateFromTime(b.get("date"), b.get("startTime"));
			var endDate = App.Utils.dateFromTime(b.get("date"), b.get("endTime"));
			
			return startDate < now && now < endDate;
		}).length > 0;
	},

	isBookedDuringTimespan: function(date1, date2) {

	}
});