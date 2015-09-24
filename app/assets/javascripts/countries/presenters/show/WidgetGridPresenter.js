define([
  'mps',
  'countries/presenters/PresenterClass'
], function(mps, PresenterClass) {

  'use strict';

  var WidgetGridPresenter = PresenterClass.extend({

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

  return WidgetGridPresenter;

});
