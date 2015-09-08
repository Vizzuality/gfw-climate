define([
  'backbone',
  'mps'
], function(Backbone, mps) {

  var CountryIndicatorsView = Backbone.View.extend({

    el: '#reportIndicators',

    events: {
      'click #addIndicators' : '_show'
    },

    initialize: function() {},

    _show: function(e) {
      mps.publish('ReportsPanel/open', []);
    }

  });

  return CountryIndicatorsView;

});
