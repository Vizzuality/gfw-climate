define([
  'backbone',
  'mps',
  'handlebars',
  'countries/presenters/show/ThemeTabsPresenter',
  'text!countries/templates/country-theme-tabs.handlebars'
], function(Backbone, mps, Handlebars, ThemeTabsPresenter, tpl) {

  'use strict';

  var ThemeTabsView = Backbone.View.extend({

    template: Handlebars.compile(tpl),

    events: {},

    initialize: function() {
      console.log('init theme tabs')
      this.presenter = new ThemeTabsPresenter();

      this.render();
    },

    render: function() {
      this.$el.html(this.template);
    }

  });

  return ThemeTabsView;

});
