define([
  'mps',
  'countries/models/CountryModel',
  'countries/presenters/PresenterClass'
], function(mps, model, PresenterClass) {

  'use strict';

  var WidgetGridPresenter = PresenterClass.extend({

    init: function(view) {
      this.view = view;
      this.model = model;
      this._super();

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
     * Used by PlaceService to get the current iso/area params.
     *
     * @return {object} iso/area params
     */
    getPlaceParams: function() {
      var p = {};

      // Fill with incoming params


      return p;
    },

    // Subscriptions at develop. Maybe we will need them in a while...
    // _subscriptions: [{
    //   'Widgets/render': function(widgets) {
    //     this.view._setWidgets(widgets);
    //   }
    // }, {
    //   'CountryHeader/switchDisplay': function(display) {
    //     this.view._setDisplay(display);
    //   },
    //   'Tabs/setDisplay': function(display) {
    //     this.view._setDisplay(display);
    //   }
    // }],


     /**
      * Triggered from 'Place/Go' events.
      *
      * @param  {Object} place PlaceService's place object
      */
    _onPlaceGo: function(place) {
      var iso = place.country;
      this._keepIso(iso);
      this._retrieveData(iso);
    },

    _keepIso: function(iso) {
      sessionStorage.setItem('countryIso', iso);
    },

    _retrieveData: function(iso) {
      this.model.setCountry(iso);

      var complete = _.invoke([this.model], 'fetch');

      $.when($, complete).done(function() {
        this.view.start(this.model);
      }.bind(this));
    },

    _onOpenModal: function() {
      mps.publish('ReportsPanel/open', []);
    },

  });

  return WidgetGridPresenter;

});
