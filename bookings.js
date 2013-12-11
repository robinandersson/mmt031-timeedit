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
			var date1 = Utils.dateFromTime(attrs.date, attrs.startTime);
			var date2 = Utils.dateFromTime(attrs.date, attrs.endTime);
			
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

		this.collection.fetch({
			success: function(collection) {
				App.bidirectionalSeed(collection);
			}
		});
	},

	addAll: function() {
		// Clear list before adding item views
		this.$el.html("");
		this.collection.each(this.addOne, this);
	},

	addOne: function(booking) {
		var view = new BookingView({model: booking, parent: this});

		this.$el.prepend(view.render().$el.addClass("highlight"));
	},

	_switchView: function(originalView, secondView) {
		secondView.parent = this;
		originalView.$el.replaceWith(secondView.render().el);
		return secondView;
	},

	renderEdit: function(itemView) {
		var editView = new BookingEditView({model: itemView.model});
		return this._switchView(itemView, editView);
	},

	cancelEdit: function(editView) {
		var bookingView = new BookingView({model: editView.model, parent: this});
		return this._switchView(editView, bookingView);
	}
});

var BookingView = Backbone.View.extend({
	tagName: "li",

	events: {
		"click .destroy": "showConfirmation",
		"click .edit" : "edit"
	},

	initialize: function(args) {
		this.parent = args.parent;
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
			view.$el.find(".edit").show().end().find(".confirmation-text").hide();
			$link.html(originalContent).removeClass("confirmation");
		});

		this.$el.find(".edit").hide().end().find(".confirmation-text").show();
		$link.addClass("confirmation").html(confirmView.render().el);
	},

	edit: function(evt) {
		this.parent.renderEdit(this);
	},

	render: function() {
		this.template = _.template($("#booking-template").html());
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},


});

var BookingEditView = BookingView.extend({

	className: "booking-edit no-expand",

	events: {
		"click .update" : "saveBooking",
		"click .cancel" : "cancelBooking"
	},

	saveBooking: function() {
		var view = this,
		data = {
			comment: this.$el.find(".booking-comment").val(),
			description: this.$el.find(".booking-description").val()
		};

		// Bypass date validation since we're not changing the dates
		this.model.save(data, {
			validate: false,
			success: function(model) {
				console.log("Saved!", model.toJSON());
				var newView = view.parent.cancelEdit(view);

				newView.$el.addClass("highlight").toggleExtra("expand", ".booking-extra");
			}
		});
	},

	cancelBooking: function() {
		var view = this.parent.cancelEdit(this);
		// Expand new view
		view.$el.toggleExtra("expand", ".booking-extra");
	},

	render: function() {
		this.template = _.template($("#booking-edit-template").html());
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	}
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
