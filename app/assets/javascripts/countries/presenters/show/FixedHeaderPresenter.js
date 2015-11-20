define([
  'backbone',
  'mps',
  'countries/presenters/PresenterClass',
  'countries/models/CountryModel',
], function(Backbone, mps, PresenterClass, CountryModel) {

  'use strict';

  var fixedHeaderPresenter = PresenterClass.extend({

    status: new (Backbone.Model.extend({
      defaults: {}
    })),

    init: function(view) {
      this._super();
      this.view = view;
    },

    /**
     * Application subscriptions.
     */
    _subscriptions: [{
      'Place/go': function(params) {
        this._onPlaceGo(params);
      },
      'Country/update': function(params) {
        this._onPlaceGo(params);
      },
      'Grid/ready': function() {
        this.view.getCutPoints()
      }
    }],

    /**
    * Triggered from 'Place/Go' and 'Compare/update' events.
    *
    * @param  {Object} place PlaceService's place object
    */
    _onPlaceGo: function(params) {
      // Check if the incoming params are the same as current ones before render!
      var country = new CountryModel({iso: params.country.iso});

      country.fetch().done(function() {
        this.status.set('country', params);
        this.view.render();
      }.bind(this));
    },

    setName: function(d) {
      this.status.set({
        dataName: d
      });
    }


  });

  return fixedHeaderPresenter;

});
