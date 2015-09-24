define([
  'mps',
  'compare/presenters/PresenterClass'
], function(mps, PresenterClass) {

  'use strict';

  var CompareSelectorsPresenter = PresenterClass.extend({

    init: function(view) {
      this._super();
      this.view = view
    },

    /**
     * Application subscriptions.
     */
    _subscriptions: [{

    }],

    /**
     * Trigger the selected display option
     * @param  {[string]} display
     * Add below events publication
     */


  });

  return CompareSelectorsPresenter;

});
