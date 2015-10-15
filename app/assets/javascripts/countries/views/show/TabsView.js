define([
  'backbone',
  'countries/presenters/show/TabsPresenter'
], function(Backbone, TabsPresenter) {

  'use strict';

  var TabsView = Backbone.View.extend({

    el: '.display-tabs',

    events: {
      'click li' : '_onClick'
    },

    initialize: function(params) {
      this.presenter = new TabsPresenter(this);
    },

    start: function() {
      this._setCurrentTab();
    },

    /**
     * Get the value give by the tab data
     * and inform the presenter about it.
     */
    _onClick: function(e) {
      var display = $(e.currentTarget).data('display');
      this.presenter.setDisplay(display);
    },

    /**
     * Add 'is-selected' class to current tab.
     */
    _setCurrentTab: function() {
      var $currentTab = this.$el.find('li[data-display="' + this.presenter.status.get('view') + '"]');

      this.$el.find('li').removeClass('is-selected');
      $currentTab.addClass('is-selected');
    }

  });

  return TabsView;

});
