define([
  'backbone',
  'mps',
  'compare/presenters/PresenterClass',
  'compare/models/CountryModel',
], function(Backbone, mps, PresenterClass, CountryModel) {

  'use strict';

  var CompareFixedHeaderPresenter = PresenterClass.extend({

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
      'Compare/update': function(params) {
        this._onPlaceGo(params);
      }
    }],

    /**
    * Triggered from 'Place/Go' and 'Compare/update' events.
    *
    * @param  {Object} place PlaceService's place object
    */
    _onPlaceGo: function(params) {
      var country1;
      var country2;
      // Only render if compare params exists and they are different from the ones saved
      if ((!!params.compare1 && !!params.compare2) && (this.status.get('compare1') != params.compare1 || this.status.get('compare2') != params.compare2)) {

        var complete = _.invoke([
          country1 = new CountryModel({ id: params.compare1.iso }),
          country2 = new CountryModel({ id: params.compare2.iso }),
        ], 'fetch');

        $.when.apply($, complete).done(function() {
          this.status.set('compare1', params.compare1);
          this.status.set('compare2', params.compare2);

          this.status.set('country1', country1);
          this.status.set('country2', country2);

          this.view.render();
        }.bind(this));
      }
    },


  });

  return CompareFixedHeaderPresenter;

});
