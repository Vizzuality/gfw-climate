define([
  'backbone',
  'countries/models/CountryModel',
  'countries/presenters/PresenterClass'
], function(Backbone, CountryModel, PresenterClass) {

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
      'View/update': function() {
        this.view.lockHeader();
      },
      'Grid/ready': function(p) {
        this._onReadyGrid(p)
      },
      'Grid/update': function() {
        this.view.lockHeader();
      },
      'Widgets/update': function() {
        this.view.lockHeader();
      }
    }],


    /**
     * Triggers when any grid is rendered.
     * In case of receive an ISO, first obtain country data.
     * Otherwise, go ahead.
     *
     */
    _onReadyGrid: function(p) {

      if (p.iso) {
        var country = new CountryModel({iso: p.iso});
        country.fetch().done(function() {

          _.extend(p, {countryName: country.get('name')});

          this._updateOptions(p);
          this.view.unlockHeader();

        }.bind(this));

      } else {
        this._updateOptions(p);
        this.view.unlockHeader();
      }

    },

    _updateOptions: function(p) {
      this.status.set('country', p);
    },

    /**
     * Set the param's name will be displayed in the header
     */
    setName: function(d) {
      this.status.set('dataName', d);
    }
  });

  return fixedHeaderPresenter;

});
