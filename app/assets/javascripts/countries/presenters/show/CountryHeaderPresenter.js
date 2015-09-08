define([
  'mps',
  'countries/presenters/PresenterClass'
], function(mps, PresenterClass) {

  'use strict';

  var CountryHeaderPresenter = PresenterClass.extend({

    init: function(view) {;
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
     */
    onSwitchDisplay: function(display) {
      mps.publish('CountryHeader/switchDisplay', [display]);
    },

    onOpenReportsPanel: function() {
      mps.publish('ReportsPanel/open', []);
    }

  });

  return CountryHeaderPresenter;

});
