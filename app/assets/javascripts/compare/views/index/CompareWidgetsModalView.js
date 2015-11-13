define([
  'jquery',
  'backbone',
  'underscore',
  'handlebars',
  'views/SourceWindowView',
  'compare/presenters/CompareModalWidgetsPresenter',
  'text!compare/templates/compareWidgetsModal.handlebars'
], function($, Backbone, _, Handlebars, SourceWindowView, CompareModalWidgetsPresenter, tpl) {

  'use strict';

  var CountryWidgetsModalView = SourceWindowView.extend({

    template: Handlebars.compile(tpl),

    events: function() {
      return _.extend({}, SourceWindowView.prototype.events, {
        'click .js-field-list-checkbox-widget' : 'changeWidgets',
        'click #btnModalWidgetsContinue' : 'hide',
      });
    },

    initialize: function() {
      // Inits
      this.constructor.__super__.initialize.apply(this,[{ sourceWindow: '.source_window_widgets'}]);
      this.$sourceWindow.addClass('is-huge');
      // Presenter & status
      this.presenter = new CompareModalWidgetsPresenter(this);
      this.status = this.presenter.status;
    },

    setListeners: function() {
    },

    render: function() {
      this.$sourceWindow.html(this.template(this.parseData()));
      this.cacheVars();
    },

    parseData: function() {
      return {
        widgets: this.status.get('widgets')
      }
    },

    cacheVars: function() {
      this.$wrapper = this.$sourceWindow.find('.content-wrapper');
      this.$checkboxes = this.$sourceWindow.find('.js-field-list-checkbox-widget');
    },

    setWidgetsStatus: function() {
      _.each(this.$checkboxes, _.bind(function(el){
        var is_active = _.contains(this.status.get('widgetsActive'),$(el).data('id').toString());
        $(el).toggleClass('is-active', is_active);
      }, this ));
    },

    /*
      MODAL: Modal events (extends from 'SourceWindow Class')
      - show
      - hide
    */
    show: function(e) {
      e && e.preventDefault() && e.stopPropagation();
      this.model.set('hidden', false);
      this.$htmlbody.addClass('active');
    },

    hide: function(e) {
      e && e.preventDefault();
      this.model.set('hidden', true);
      this.$htmlbody.removeClass('active');
      this.presenter.setActiveWidgets();
    },

    changeWidgets: function(e) {
      this.presenter.changeActiveWidgets($(e.currentTarget).data('id'),$(e.currentTarget).hasClass('is-active'))
    }

  });

  return CountryWidgetsModalView;

});
