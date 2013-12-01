/*
	MODELS
--------------------------
 */

App.Models.BaseModel = Backbone.Model.extend({
	initialize: function(){
	    this.on('change', function(){
	      var i, changedAttributes = this.changedAttributes() || [];
	      _.each(this.attributes, function(value, key){
	        if( _.isFunction(value) && _.isArray(value.attributes) ) {
	          for(i in value.attributes) {
	            if ( _.has(changedAttributes, value.attributes[i]) ) {
	              this.trigger("change:"+key);
	              return ;
	            }
	          }
	        }
	      }, this);
	    }, this);
	  },

	  get: function(attr) {
	  	return ( _.isFunction(this[attr]) ) ? this[attr].call(this) : 
	  		Backbone.Model.prototype.get.call(this, attr);
	  },

	  toJSON: function() {
	  	var json = Backbone.Model.prototype.toJSON.apply(this, arguments),
	  		model = this;

	  	if(!_.isUndefined(this.computed)) {
	  		_.each(this.computed, function(func) {
	  			json[func] = model.get(func);
	  		});
	  	}
	  	
	  	return json;
	  }
});

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


App.Models.Room = App.Models.BaseModel.extend({
	bookings: new App.Collections.BookingCollection,

	computed: ['isBookedRightNow'],

	isBookedRightNow: function() {
		var now = new Date;
		return this.bookings.filter(function(b){
			var startDate = App.Utils.dateFromTime(b.get("date"), b.get("startTime"));
			var endDate = App.Utils.dateFromTime(b.get("date"), b.get("endTime"));
			
			return startDate < now && now < endDate;
		}).length > 0;
	},

	isBookedDuringTimespan: function(date1, date2) {
		return this.bookings.filter(function(b){
			var startDate = App.Utils.dateFromTime(b.get("date"), b.get("startTime"));
			var endDate = App.Utils.dateFromTime(b.get("date"), b.get("endTime"));
			
			return (startDate > date1 && startDate < date2) || (date1 > startDate && date1 < endDate);
		}).length > 0;
	}
});