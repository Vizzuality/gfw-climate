define([
  'Backbone',
  'mps',
  'compare/models/CountryModel',
  'compare/presenters/PresenterClass',
  'compare/collections/CountriesCollection'
], function(Backbone, mps, CountryModel, PresenterClass, CountriesCollection) {

  'use strict';

  var CompareSelectorsPresenter = PresenterClass.extend({

    status: new (Backbone.Model.extend({
      defaults: {
        name: 'compare-countries'
      }
    })),

    init: function(view) {
      this._super();
      this.view = view;
      mps.publish('Place/register', [this]);
    },

    /**
     * Application subscriptions.
     */
    _subscriptions: [{
      'Place/go': function(place) {
        this._onPlaceGo(place);
      },
      'Compare/selection': function(place) {
        this._onPlaceGo(place);
      }
    }],


    /**
     * Used by PlaceService to get the current iso/area params.
     *
     * @return {object} iso/area params
     */
    getPlaceParams: function() {
      // var p = {};
      // p.compare1 = this.status.get('compare1');
      // p.compare2 = this.status.get('compare2');
      // return p;
    },

    /**
    * Triggered from 'Place/Go' events.
    *
    * @param  {Object} place PlaceService's place object
    */
    _onPlaceGo: function(params) {
      // console.log(params);
      var country1;
      var country2;

      if (!!params.compare1 && !!params.compare2) {
        this.status.set('compare1', params.compare1);
        this.status.set('compare2', params.compare2);

        var complete = _.invoke([
          country1  = new CountryModel({ id: params.compare1.iso }),
          country2  = new CountryModel({ id: params.compare2.iso }),
        ], 'fetch');

        $.when.apply($, complete).done(function() {
          this.view.render(country1, country2);
        }.bind(this));
      }


    },

    showModal: function(tab) {
      mps.publish('CompareModal/show', [tab]);
    }

  });

  return CompareSelectorsPresenter;

});
