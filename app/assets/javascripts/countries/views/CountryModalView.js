define([
  'jquery',
  'backbone',
  'underscore',
  'handlebars',
  'countries/presenters/ReportsPanelPresenter',
  'views/SourceWindowView',
  'text!countries/templates/country-indicators-window.handlebars'
], function($, Backbone, _,Handlebars, ReportsPanelPresenter, SourceWindowView, tpl) {

  'use strict';

  var CountryModalView = SourceWindowView.extend({

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
      this.presenter = new ReportsPanelPresenter(this);

      this.enabledIndicators = [];

      this.$el.addClass('source_window--countries')
      this.render();
    },

    show: function(e) {
      e && e.preventDefault() && e.stopPropagation();
      this.model.set('hidden', false);
    },

    _toggleWidgets: function(e) {
      var indicator = e.currentTarget;
      var id = $(indicator).attr('id');

      $(indicator).toggleClass('is-selected');

      if ($(indicator).hasClass('is-selected')) {

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
      this.hide();
      this.presenter._onSubmitWidgets(this.enabledIndicators);
    },

    render: function() {
      this.$el.html(this.template);
    }

  });

  return CountryModalView;

});
