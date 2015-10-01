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
      this._retrieveData(iso);
      this._keepIso(iso);
    },

    _keepIso: function() {
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
