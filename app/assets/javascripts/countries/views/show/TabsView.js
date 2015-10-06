define([
  'backbone',
  'countries/presenters/show/TabsPresenter'
], function(Backbone, TabsPresenter) {

  'use strict';

  var TabsView = Backbone.View.extend({

    el: '.display-tabs',

    events: {
      'click li' : '_setCurrentTab'
    },

    initialize: function(params) {
      this.presenter = new TabsPresenter(this);
    },

    start: function(params) {
      this._setCurrentTab(null, this.presenter.status.attributes.data);
    },

    /**
     * Set the new display value
     * @param {[string]} display
     */
    _setDisplay: function(display) {
      this.presenter._updateTab(display);
    },

    /**
     * Add 'is-selected' class to current tab.
     * Sends the new display value.
     * @param click event
     */
    _setCurrentTab: function(e, display) {
      var $currentTab;
      var newDisplay;

      if (e) {
        $currentTab = $(e.currentTarget);
        newDisplay = $currentTab.data('display')
      } else {
        $currentTab = this.$el.find('li[data-display="' + display + '"]');
        newDisplay = display;
      }

      this.$el.find('li').removeClass('is-selected');
      $currentTab.addClass('is-selected');

      this._setDisplay(newDisplay);
    }

  });

  return TabsView;

});
