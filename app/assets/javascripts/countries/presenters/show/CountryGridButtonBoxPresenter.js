define(['backbone', 'mps', 'compare/presenters/PresenterClass'], function(
  Backbone,
  mps,
  PresenterClass
) {
  'use strict';

  var CountryGridButtonBoxPresenter = PresenterClass.extend({
    init: function(view) {
      this._super();
      this.open = false;
      this.view = view;
    },

    _subscriptions: [
      {
        'CountryWidgetsModal/hide': function() {
          this.open = false;
        }
      }
    ],

    showIndicatorModal: function() {
      if (!this.open) {
        // mps publish an event that makes the indicator modal show
        mps.publish('CountryWidgetsModal/show');
        this.open = true;
      }
    }
  });

  return CountryGridButtonBoxPresenter;
});
