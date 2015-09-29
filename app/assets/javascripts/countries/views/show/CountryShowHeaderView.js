define([
  'backbone',
  'countries/presenters/show/CountryHeaderPresenter'
], function(Backbone, CountryHeaderPresenter) {

  'use strict';

  var CountryShowHeaderView = Backbone.View.extend({

    el: '#headerCountry',

    initialize: function() {
      this.presenter = new CountryHeaderPresenter(this);
    }

  });

  return CountryShowHeaderView;

});
