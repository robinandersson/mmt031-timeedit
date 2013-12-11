/*
	Various configs.
 */

// "Abstract" base collection

var BaseCollection = Backbone.Collection.extend({

	seed: function(callback) {
		// Don't try to seed if no source (url or file) is specified
		if(!this.url) return;

		console.log("Seeding from "+this.url+" into '"+this.localStorage.name+"' store ...");
		var collection = this;

		// Fetch models from URL and inject into the collection.
		// Also remember to initially create the models in the local store
		// as well.
		$.getJSON(this.url, function(json, status, jqxhr) {
			if(json && json.length) 
				var models = collection.reset(json);
				$.each(models, function(i, model) {
					collection.localStorage.create(model);
				});
				
				if(callback !== undefined) callback(collection, jqxhr, null);
				console.log("* Done seeding "+models.length + " models into store");
		});
	},

	// If the local store is empty, seed it from remote. Else, fetch from
	// local store into collection.
	seedOrFetch: function(callback) {
		(!this.localStorage.findAll().length) ? this.seed() : this.fetch({reset: true, success: callback});
	}
});

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

Utils = {

	generateNextDateSpan: function(next) {
		if(next === undefined) next = 1;
		var now = new Date(),
				nextHour = parseInt(now.hhmm().substr(0, 2)) + next;

		if(nextHour == 24) {
			nextHour = "00";
		}

		if(typeof nextHour !== "string" && nextHour < 10) {
			nextHour = "0"+nextHour;
		}

		var nextEndTime = parseInt(now.hhmm().substr(3));

		if(nextEndTime === 60) {
			nextHour++;
			nextEndTime = "00";

			if(nextHour === 24) {
				nextHour = "00";
			}
		}

		return {
			date: now.yyyymmdd(),
			startTime: now.hhmm(),
			endTime: nextHour + ":" + nextEndTime
		};
	},

	dateFromTime: function(dateString, time) {
		var date = new Date(dateString),
				time = time.split(":");

		date.setHours(time[0]);
		date.setMinutes(time[1]);

		return date;
	},

	pixelsFromTime: function(time, pixelsPerFiveMinutes) {
		var time_split = time.split(':');
		var periods = (time_split[0] * 12 + time_split[1]/5);
		var pixels = periods * pixelsPerFiveMinutes
		return (pixels% pixelsPerFiveMinutes > 0 ? 
			((pixels % pixelsPerFiveMinutes) > pixelsPerFiveMinutes/2 ? 
				pixels - (pixels%pixelsPerFiveMinutes) + pixelsPerFiveMinutes 
				: pixels - (pixels%pixelsPerFiveMinutes) ) 
			: pixels);
	},

	timeFromPixels: function(pixels, pixelsPerFiveMinutes) {
		var periods = (pixels / pixelsPerFiveMinutes);
		var hours = (periods - (periods%12)) * 5 / 60;
		var minutes = (periods%12) * 5;

		var now = new Date;
		now.setHours(hours);
		now.setMinutes(minutes);

		return now.hhmm(false);
	},

	findIntersectors: function(targetSelector, intersectorsSelector) {
	    var intersectors = [];

	    var $target = $(targetSelector);
	    var tAxis = $target.offset();
	    var t_x = [tAxis.left, tAxis.left + $target.outerWidth()];
	    var t_y = [tAxis.top, tAxis.top + $target.outerHeight()];

	    $(intersectorsSelector).each(function() {
	          var $this = $(this);
	          var thisPos = $this.offset();
	          var i_x = [thisPos.left, thisPos.left + $this.outerWidth()]
	          var i_y = [thisPos.top, thisPos.top + $this.outerHeight()];

	          if ( t_x[0] < i_x[1] && t_x[1] > i_x[0] &&
	               t_y[0] < i_y[1] && t_y[1] > i_y[0]) {
	              intersectors.push($this);
	          }

	    });
	    return intersectors;
	},

	isColliding: function(targetSelector, intersectorsSelector) {
		return Utils.findIntersectors(targetSelector, intersectorsSelector).length > 0;
	},

	createRandomBookingData: function() {
		var data = {
			comment: "Random comment",
			description: "My own description",
			purpose: "Övrigt"
		},

		date = Utils.getRandomTimeslot();

		return _.extend(data, date);
	},

	randomFromInterval: function(from, to) {
		return Math.floor(Math.random()*(to-from+1)+from);
	},

	getRandomTimeslot: function() {
		var now = new Date,
				randomMinute = Utils.randomFromInterval(0, 60),
				randomHour = Utils.randomFromInterval(8, 22),
				randomLength = Utils.randomFromInterval(1, 5);

		now.setHours(randomHour);
		now.setMinutes(randomMinute);

		var endDate = new Date(now);
		endDate.setHours(randomHour + randomLength);

		return {
			date: now.yyyymmdd(),
			startTime: now.hhmm(),
			endTime: endDate.hhmm()
		};
	}
};

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
 * Round off to closest five minute span (ceil) if
 * @autoCorrect == true.
 *
 * Ex. 	15:54 => 15:55
 * 			15:51 => 15:55
 * 			15:56 => 16.00
 * 			
 * @return A string on the format "HH:mm"
 */
Date.prototype.hhmm = function(autoCorrect) {
	if(autoCorrect === undefined) autoCorrect = true;

	var hours = this.getHours();
	var minutes = this.getMinutes();
	var interval = 5;

	if(autoCorrect) {
		minutes = Math.ceil((minutes+1) / interval) * interval;

		if(minutes === 60) {
			hours++;
			minutes = "00";

			if(hours === 24) {
				hours = "00";
			}
		}
	}

	if(hours < 10) {
		hours = "0"+hours;
	}
	if(minutes.toString().length === 1) {
		minutes = "0" + minutes;
	}

	return hours + ":" + minutes;
};
