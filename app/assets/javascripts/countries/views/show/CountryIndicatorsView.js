define([
  'backbone',
  'countries/views/CountryWindowView',
], function(Backbone, CountryWindowView) {

  var CountryIndicatorsView = Backbone.View.extend({

    el: '#reportIndicators',

    events: {
      'click #addIndicators' : '_show'
    },

    initialize: function() {
      this.modal = new CountryWindowView();
    },

    _show: function(e) {
      this.modal.show(e);
    }

  });

  return CountryIndicatorsView;

});
