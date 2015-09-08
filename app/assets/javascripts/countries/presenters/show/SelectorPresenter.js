define([
  'mps',
  'countries/presenters/PresenterClass'
], function(mps, PresenterClass) {

  var SelectorPresenter = PresenterClass.extend({

    init: function(view) {
      this._super();
      this.view = view;
    },

    /**
     * Application subscriptions.
     */
    _subscriptions: [{

    }],


  });

  return SelectorPresenter;

})
