define([
  'backbone'
], function(Backbone) {

  var Router = Backbone.Router.extend({

    routes: {
      'countries/:country(/:jurisdiction)' : '_initIndex'
    },

    _initIndex: function() {
      new CompareIndexView();
    }

  });

  return Router;

});
