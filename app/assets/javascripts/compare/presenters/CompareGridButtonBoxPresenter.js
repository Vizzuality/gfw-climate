define(['backbone', 'mps', 'compare/presenters/PresenterClass'], function(
  Backbone,
  mps,
  PresenterClass
) {
  'use strict';

  var CompareSelectorsPresenter = PresenterClass.extend({
    init: function(view) {
      this._super();
      this.view = view;
    },

    /**
     * Application subscriptions.
     */
    _subscriptions: [],

    showIndicatorModal: function() {
      // mps publish an event that makes the indicator modal show
      mps.publish('CompareWidgetsModal/show');
    }
  });

  return CompareSelectorsPresenter;
});
