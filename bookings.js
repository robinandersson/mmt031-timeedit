/*
	BOOKINGS
--------------------------
 */

App.Models.Booking = App.Models.BaseModel.extend({

	validate: function(attrs, options) {
		if(attrs.startTime > attrs.endTime) {
			return "Bokningens starttid kan inte ligga efter dess sluttid";
		}

		if(attrs.room instanceof Backbone.Model) {
			var date1 = App.Utils.dateFromTime(attrs.date, attrs.startTime);
			var date2 = App.Utils.dateFromTime(attrs.date, attrs.endTime);
			
			if(attrs.room.isBookedDuringTimespan(date1, date2)) {
				return "Rum '"+ attrs.room.get("name") +"' är redan bokat under denna tid";
			}
		}

		if(attrs.room === undefined) {
			return "Du måste lägga till ett rum till din bokning";
		}
	}
});

App.Collections.UserBookingCollection = BaseCollection.extend({
	model: App.Models.Booking,
	localStorage: new Backbone.LocalStorage("UserBookings")
});

var UserBookings = new App.Collections.UserBookingCollection;

App.Collections.BookingCollection = BaseCollection.extend({
	model: App.Models.Booking,
	localStorage: new Backbone.LocalStorage("Bookings")
});

var UserBookingsView = Backbone.View.extend({
	collection: UserBookings,
	
	initialize: function() {
		this.setElement($("#user-bookings"));

		this.listenTo(this.collection, "reset", this.addAll);
		this.listenTo(this.collection, "add", this.addOne);

		this.collection.fetch();
	},

	addAll: function() {
		// Clear list before adding item views
		this.$el.html("");
		this.collection.each(this.addOne, this);
	},

	addOne: function(booking) {
		var view = new BookingView({model: booking});
		this.$el.append(view.render().$el.addClass("highlight"));
	}
});

var BookingView = Backbone.View.extend({
	tagName: "li",

	events: {
		"click .destroy": "removeBooking"
	},

	initialize: function() {
		this.listenTo(this.model, "destroy", this.remove);
	},

	removeBooking: function(evt) {
		evt.preventDefault();
		if(confirm("Vill du verkligen avboka '"+this.model.get("room").name+"'?")) {
			this.model.destroy();
		}
	},

	render: function() {
		this.template = _.template($("#booking-template").html());

		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},


});
