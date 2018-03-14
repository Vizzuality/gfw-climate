define(['mps', 'backbone', 'countries/presenters/PresenterClass'], function(
  mps,
  Backbone,
  PresenterClass
) {
  'use strict';

  var ShareWidgetPresenter = PresenterClass.extend({
    init: function(view, setup) {
      this.view = view;
      this._super();
    },

    _subscriptions: [
      {
        'Place/store': function(params) {
          // console.log(params);
        }
      }
    ]
  });

  return ShareWidgetPresenter;
});
