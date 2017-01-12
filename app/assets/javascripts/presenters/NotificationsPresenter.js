/**
 * The NotificationsPresenter class for the NotificationsPresenter view.
 *º
 * @return NotificationsPresenter class.
 */
define([
  'underscore',
  'mps',
  'map/presenters/PresenterClass'
], function(_, mps, PresenterClass) {

  'use strict';

  var NotificationsPresenter = PresenterClass.extend({

    init: function(view) {
      this.view = view;
      this._super();
    },

    // /**
    //  * Application subscriptions.
    //  */
    _subscriptions: [{
      'Notification/open': function(source) {
        this.view.show(source);
      }
    }]
  });

  return NotificationsPresenter;
});
