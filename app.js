// "Abstract" base collection

var BaseCollection = Backbone.Collection.extend({

	seed: function() {
		console.log("Seeding from "+this.url+" into '"+this.localStorage.name+"' store ...");
		var collection = this;

		// Fetch models from URL and inject into the collection.
		// Also remember to initially create the models in the local store
		// as well.
		$.getJSON(this.url, function(json) {
			if(json && json.length) 
				var models = collection.reset(json);
				$.each(models, function(i, model) {
					collection.localStorage.create(model);
				});
				console.log("* Done seeding "+models.length + " models into store");
		});
	},

	// If the local store is empty, seed it from remote. Else, fetch from
	// local store into collection.
	seedOrFetch: function() {
		(!this.localStorage.findAll().length) ? this.seed() : this.fetch();
	}
});


var Room = Backbone.Model.extend({

});

var RoomCollection = BaseCollection.extend({
	// Here, the local seed file
	url: "/rooms.json",
	model: Room,
	// Create local store
	localStorage: new Backbone.LocalStorage("Rooms")
});

var Rooms = new RoomCollection;

var RoomView = Backbone.View.extend({
	tagName: "li",

	events: {
		"click a.destroy" : "clear"
	},

	initialize: function() {
		this.template = _.template($("#room-template").html());

		// Listen to model events

		this.listenTo(this.model, "change", this.render);
		this.listenTo(this.model, "destroy", this.remove);
	},

	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},

	clear: function(evt) {
		evt.preventDefault();
		this.model.destroy();
	}
});

var RoomsView = Backbone.View.extend({
	collection: Rooms,

	initialize: function() {
		this.setElement($("#rooms"));

		// Listen to collection events

		this.listenTo(this.collection, "reset", this.addAll);
		this.listenTo(this.collection, "add", this.addOne);

		this.collection.seedOrFetch();
	},

	refresh: function(filter) {
		var results = this.collection.where(filter);
		this.collection.reset(results);
	},

	addOne: function(room) {
		var view = new RoomView({model: room});
		this.$el.append(view.render().el);
	},

	addAll: function() {
		// Clear list before adding item views
		this.$el.html("");
		this.collection.each(this.addOne, this);
	}
});

var ControlView = Backbone.View.extend({

	events: {
		"change input" : "refresh"
	},

	modelBindings: {
		"input[type='search']" : "name"
	},

	initialize: function() {
		this.setElement($("#controls"));

		this.controls = this.$("input");
		this.rooms = new RoomsView;
		this.filter = {};

		if(this.rooms.collection != null) {
			var view = this;
			$.each(this.modelBindings, function(selector, attribute) {
				view.$(selector).on("change", function(evt){
					var data = view.$(evt.target).val();
					view.filter[attribute] = data;
				});
			});
		}
	},

	refresh: function(evt) {
		console.log(this.filter);
		this.rooms.refresh(this.filter);
	}
});

(function($, exports) {

	exports.App = {
		start: function() {
			console.log("Initializing app ...");
			App.Collections.Rooms = Rooms;

			App.Views = {
				Controls: new ControlView
			};
		},

		// Namespaces

		Views: {},
		Models: {},
		Collections: {}
	};

})(jQuery, window);

$(function() {
	App.start();
});
