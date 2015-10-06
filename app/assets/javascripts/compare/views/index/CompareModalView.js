define([
  'jquery',
  'backbone',
  'underscore',
  'handlebars',
  'chosen',
  'views/SourceWindowView',
  'compare/presenters/CompareModalPresenter',
  'text!compare/templates/compareModal.handlebars'
], function($, Backbone, _, Handlebars, chosen, SourceWindowView, CompareModalPresenter, tpl) {

  'use strict';

  var CountryModalView = SourceWindowView.extend({

    template: Handlebars.compile(tpl),

    el: '.source_window',

    events: function() {
      return _.extend({}, SourceWindowView.prototype.events, {
        'click .m-field-list-radio' : 'setSublevel',
      });
    },

    initialize: function() {
      this.constructor.__super__.initialize.apply(this);
      this.presenter = new CompareModalPresenter(this);

      this.$el.addClass('is-huge')
    },


    render: function() {
      this.$el.html(this.template({ countries: this.countries }));
      this.cacheVars();
      this.inits();
    },

    cacheVars: function() {
      this.$selects = $('.chosen-select');
      this.$radios = $('.m-field-list-radio');
    },

    inits: function() {
      this.$selects.chosen();
    },

    setFields: function(countries) {
      this.countries = countries;
      this.render();
    },

    show: function(e) {
      e && e.preventDefault() && e.stopPropagation();
      this.model.set('hidden', false);
    },

    // Events
    setSublevel: function(e) {
      if (!$(e.currentTarget).hasClass('is-active')) {
        this.$radios.removeClass('is-active');
        $(e.currentTarget).addClass('is-active');
      } else {
        this.$radios.removeClass('is-active');
      }
    }

  });

  return CountryModalView;

});
