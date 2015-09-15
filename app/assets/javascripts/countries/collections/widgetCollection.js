define([
  'backbone',
  'jquery',
  'countries/models/CountryModel',
], function(Backbone, $, CountryModel) {

  var widgetCollection = Backbone.Collection.extend({

    url: '/api/widgets/',


    parse: function(data) {
      return data.widget;
    },

    _setURL: function(id) {
      return this.url + id;
    },

    _loadData: function(widgetId, cb) {
      var url = this._setURL(widgetId),
        iso = CountryModel.attributes.iso;

      var options = {
        url: url,
        data: {
          iso: iso
        },
        success: function(collection) {
          cb();
        },
        error: function(err) {
          throw err;
        }
      };


      this.fetch(options);
    }

  });

  return widgetCollection;

});
