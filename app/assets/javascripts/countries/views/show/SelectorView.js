define([
  'backbone',
  'handlebars',
  'countries/presenters/show/SelectorPresenter',
  'text!countries/templates/country-selector.handlebars'
], function(Bakcbone, Handlebars, SelectorPresenter, tpl) {

  'use strict';

  var SelectorView = Backbone.View.extend({

    template: Handlebars.compile(tpl),

    events:  {},

    initialize: function() {
      console.log('init selector view');
      this.presenter = new SelectorPresenter();

      this.render();
    },

    render: function() {
      this.$el.html(this.template);
    }

  });

  return SelectorView;

});
