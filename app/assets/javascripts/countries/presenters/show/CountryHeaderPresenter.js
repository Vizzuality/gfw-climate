define(
  [
    'mps',
    'backbone',
    'countries/presenters/PresenterClass',
    'countries/services/CountryStatsService'
  ],
  function(mps, Backbone, PresenterClass, CountryStatsService) {
    'use strict';

    var CountryHeaderPresenter = PresenterClass.extend({
      init: function(view) {
        this._super();
        this.view = view;
        this.service = CountryStatsService;

        (this.status = new (Backbone.Model.extend())()),
          mps.publish('Place/register', [this]);
      },

      /**
       * Application subscriptions.
       */
      _subscriptions: [
        {
          'Place/go': function(place) {
            this._onPlaceGo(place);
          }
        }
      ],

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
       * Triggered from 'Place/Go' events.
       *
       * @param  {Object} place PlaceService's place object
       */
      _onPlaceGo: function(place) {
        this._setCountry(place.country.iso);
        // this.view.start();
        this.requestStats();
      },

      requestStats: function() {
        var iso = this.status.get('iso');

        this.service.execute(
          iso,
          _.bind(this.onSuccess, this),
          _.bind(this.onError, this)
        );
      },

      onSuccess: function(meta) {
        if (meta.data && !meta.data.error && meta.data.length) {
          this.view.drawStats(meta.data[0]);
        }
      },

      onError: function(err) {
        throw err;
      },

      _setCountry: function(country) {
        this.status.set({
          iso: country
        });
      }
    });

    return CountryHeaderPresenter;
  }
);
