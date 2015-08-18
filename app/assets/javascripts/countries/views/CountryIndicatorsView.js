define([
  'backbone',
  'countries/views/CountryWindowView',
], function(Backbone, CountryWindowView) {

  var CountryIndicatorsView = Backbone.View.extend({

    el: '#reportIndicators',

    events: {
      'click #addIndicators' : 'show'
    },

    initialize: function() {
      this.modal = new CountryWindowView();
    },

    show: function(e) {
      this.modal.show(e);
    }

  });

  return CountryIndicatorsView;

});
