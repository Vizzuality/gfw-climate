define([
  'jquery',
  'backbone',
  'underscore',
  'handlebars',
  'mps',
  'views/SourceWindowView',
  'text!countries/templates/country-indicators-window.handlebars'
], function($,Backbone, _,Handlebars,mps, SourceWindowView, tpl) {

  'use strict';

  var CountryWindowView = SourceWindowView.extend({

    template: Handlebars.compile(tpl),

    el: '.source_window',

    events: function() {
      return _.extend({}, SourceWindowView.prototype.events, {
        'click .indicator': '_toggleIndicator',
        'click #btn-done': 'done'
      });
    },

    initialize: function() {
      this.constructor.__super__.initialize.apply(this);
      this.$el.addClass('source_window--countries')
      this.render();
    },

    _toggleIndicator: function(e) {
      $(e.currentTarget).find('span').toggleClass('indicator__name--selected');
    },

    show: function(e) {
      e && e.preventDefault() && e.stopPropagation();
      this.model.set('hidden', false);
    },

    done: function() {
      console.log('done!')
    },

    render: function() {
      this.$el.html(this.template);
    }

  });
  return CountryWindowView;
});
