define([
  'mps',
  'countries/presenters/PresenterClass'
], function(mps, PresenterClass) {

  'use strict';

  var TabsPresenter = PresenterClass.extend({

    init: function(view) {
      this.view = view;
      this._super();

      mps.publish('Place/register', [this]);
    },

    /**
     * Application subscriptions.
     */
    _subscriptions: [{}]

  });

  return TabsPresenter;

});
