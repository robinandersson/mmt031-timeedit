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
	localStorage: new Backbone.LocalStorage("UserBookings"),
	comparator: function(booking1, booking2) {
		return (booking1.date < booking2.date) ? -1 : 1; 
	}
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
		"click .destroy": "showConfirmation"
	},

	initialize: function() {
		this.listenTo(this.model, "destroy", this.remove);
	},

	showConfirmation: function(evt) {
		evt.preventDefault();
		evt.stopPropagation();

		var $link = $(evt.currentTarget),
				confirmView = new ConfirmationView({model: this.model}),
				originalContent = $link.html(),
				view = this;

		this.listenTo(confirmView, "cancel", function() {
			view.$el.find(".update").show().end().find(".confirmation-text").hide();
			$link.html(originalContent).removeClass("confirmation");
		});

		this.$el.find(".update").hide().end().find(".confirmation-text").show();
		$link.addClass("confirmation").html(confirmView.render().el);
	},

	render: function() {
		this.template = _.template($("#booking-template").html());
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},


});

var ConfirmationView = Backbone.View.extend({

	events: {
		"click .destroy-ok" : "removeBooking",
		"click .destroy-cancel" : "cancel"
	},

	removeBooking: function(evt) {
		this.model.destroy();
	},

	cancel: function(evt) {
		this.trigger("cancel");
		this.remove();
	},

	render: function() {
		this.template = _.template($("#booking-destroy-confirmation").html());
		this.$el.html(this.template());
		return this;
	}
});
