define([
  'mps',
  'countries/models/CountryModel',
  'countries/presenters/PresenterClass'
], function(mps, CountryModel, PresenterClass) {

  var CountryShowPresenter = PresenterClass.extend({

    init: function(view) {
      this.view = view;
      this.countryModel = CountryModel;

      this._super();
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
      this._keepIso(place.country.iso);
      // console.log(place)
      // this.countryModel.setCountry(place.country.iso);
      // // this.countryModel.fetchData();
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
