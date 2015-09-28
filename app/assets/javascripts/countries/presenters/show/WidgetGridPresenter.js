define([
  'mps',
  'countries/models/CountryModel',
  'countries/presenters/PresenterClass'
], function(mps, model, PresenterClass) {

  'use strict';

  var WidgetGridPresenter = PresenterClass.extend({

    init: function(view) {
      this.view = view;
      this._super();
      this.model = model;

      mps.publish('Place/register', [this]);
    },

    /**
     * Application subscriptions.
     */
    _subscriptions: [{
      'Place/go': function(place) {
        this._onPlaceGo(place);
      }
    }],


    /**
     * Trigger the selected display option
     * @param  {[string]} display
     * Add below events publication
     */




     /**
      * Triggered from 'Place/Go' events.
      *
      * @param  {Object} place PlaceService's place object
      */
    _onPlaceGo: function(place) {
      var iso = place.params.country;
      console.log(iso);
      this._getData(iso);
    },

    _getData: function(iso) {
      this.model.setCountry(iso);

      var complete = _.invoke([this.model], 'fetch');

      $.when($, complete).done(function() {

        this.view.start(this.model);

      }.bind(this));
    }

  });

  return WidgetGridPresenter;

});
