define([
  'backbone'
], function(Backbone) {

  'use strict';

  var IndicatorView = Backbone.View.extend({

    events: {},

    initialize: function(setup) {
      this.$el.addClass(setup.className);
    },

    render: function() {},

    setFetchParams: function(data) {
      if (data.location) {
        data.iso = data.location.iso;
        data.id_1 = (!!data.location.jurisdiction) ? data.location.jurisdiction : null;
        data.area = (!!data.location.area) ? data.location.area : null;
        delete data.location
      }
      return data;
    },

  });

  return IndicatorView;

})
