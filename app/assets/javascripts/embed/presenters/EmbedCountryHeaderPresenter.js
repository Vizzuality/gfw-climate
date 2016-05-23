define([
  'mps',
  'backbone',
  'embed/presenters/PresenterClass',
  'embed/models/CountryModel',
], function(mps, Backbone, PresenterClass, CountryModel) {

  'use strict';

  var EmbedCountryHeaderPresenter = PresenterClass.extend({

    status: new (Backbone.Model.extend({})),

    init: function(view) {
      this._super();
      this.view = view;
      mps.publish('Place/register', [this]);
    },

    /**
     * Used by PlaceService to get the current iso/area params.
     *
     * @return {object} iso/area params
     */
    getPlaceParams: function() {
      var p = {};
      return p;
    },

    /**
     * Application subscriptions.
     */
    _subscriptions: [{
      'Place/go': function(params) {
        this.status.set(params);
        this.placeGo(params);
      }
    }],


    /**
     * Place GO
     */    
    placeGo: function(params) {
      var location = this.status.get('location');
      
      if (!!location) {
        new CountryModel({ iso: location.iso })
          .fetch()
          .done(function(response){
            console.log(response);
          }.bind(this));
      }
    },

  });

  return EmbedCountryHeaderPresenter;

});
