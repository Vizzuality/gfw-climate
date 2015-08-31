define([
  'mps',
  'countries/presenters/PresenterClass'
], function(mps, PresenterClass) {

  'use strict';

  var ShowPresenter = PresenterClass.extend({

    init: function(view) {
      this._super();
      this.view = view;
    },

    /**
     * Application subscriptions.
     */
    _subscriptions: [{}],

    onRenderWidgets: function(widgets) {
      mps.publish('WidgetGrid/render', [widgets]);
    }

  });

  return ShowPresenter;

});
