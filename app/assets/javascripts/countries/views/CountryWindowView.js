define([
  'jquery',
  'backbone',
  'underscore',
  'handlebars',
  'countries/presenters/show/CountryWindowPresenter',
  'views/SourceWindowView',
  'text!countries/templates/country-indicators-window.handlebars'
], function($,Backbone, _,Handlebars, CountryWindowPresenter, SourceWindowView, tpl) {

  'use strict';

  var CountryWindowView = SourceWindowView.extend({

    template: Handlebars.compile(tpl),

    el: '.source_window',

    events: function() {
      return _.extend({}, SourceWindowView.prototype.events, {
        'click .indicator' : '_toggleWidgets',
        'click #btn-done'  : '_submitWidgets'
      });
    },

    initialize: function() {
      this.constructor.__super__.initialize.apply(this);
      this.presenter = new CountryWindowPresenter(this);
      this.$el.addClass('source_window--countries')
      this.enabledIndicators = [];
      this.render();
    },

    show: function(e) {
      e && e.preventDefault() && e.stopPropagation();
      this.model.set('hidden', false);
    },

    _toggleWidgets: function(e) {
      var indicator = e.currentTarget;
      var id = $(indicator).attr('id');

      $(indicator).toggleClass('indicator--selected');

      if ($(indicator).hasClass('indicator--selected')) {

        if (_.contains(this.enabledIndicators, id)) {
          return;
        }

        this.enabledIndicators.push(id);

      } else {

        if (!_.contains(this.enabledIndicators, id)) {
          return;
        }

        this.enabledIndicators = _.without(this.enabledIndicators, id);
      }
    },

    _submitWidgets: function() {
      this.presenter.onRenderWidgets(this.enabledIndicators);
      this.hide();
    },

    render: function() {
      this.$el.html(this.template);
    }

  });

  return CountryWindowView;

});
