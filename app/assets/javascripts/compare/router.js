define(
  ['backbone', 'underscore', 'utils', 'compare/services/PlaceService'],
  function(Backbone, _, utils, PlaceService) {
    var Router = Backbone.Router.extend({
      routes: {
        'compare-countries(/)(:compare1)(/)(:compare2)': '_initIndex'
      },

      initialize: function() {
        this.placeService = new PlaceService(this);
      },

      _initIndex: function(compare1, compare2) {
        this.name = 'compare-countries';
        var params = _.extend(
          {
            compare1: compare1,
            compare2: compare2
          },
          _.parseUrl()
        );
        this.placeService.initPlace(this.name, params);
      }
    });

    return Router;
  }
);
