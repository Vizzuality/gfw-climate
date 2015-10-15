define([
  'mps',
  'countries/models/CountryModel',
  'countries/presenters/PresenterClass'
], function(mps, CountryModel, PresenterClass) {

  var CountryShowPresenter = PresenterClass.extend({

    init: function(view) {
      this._super();

      this.iso;
      this.view = view;
      this.countryModel = CountryModel;
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
      * Triggered from 'Place/Go' events.
      */
    _onPlaceGo: function(place) {
      this._keepIso(place.country);
      this.countryModel.setCountry(place.country);
      this.countryModel.fetchData();
    },


    /**
     * Saves on sessionStorage the current ISO.
     * @param  {string} iso
     */
    _keepIso: function(iso) {
      sessionStorage.setItem('countryIso', iso);
    }

  });

  return CountryShowPresenter;

});
