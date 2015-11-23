define([
  'backbone',
  'mps',
  'countries/presenters/PresenterClass',
  'countries/models/CountryModel',
], function(Backbone, mps, PresenterClass, CountryModel) {

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
        this._updateOptions(p);
        this.view.unlockHeader();
      }
    }],

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
