define([
  'jquery',
  'backbone',
  'underscore',
  'handlebars',
  'views/ModalView',
  'compare/presenters/CompareModalWidgetsPresenter',
  'text!compare/templates/compareWidgetsModal.handlebars'
], function($, Backbone, _, Handlebars, ModalView, CompareModalWidgetsPresenter, tpl) {

  'use strict';

  var CountryWidgetsModalView = ModalView.extend({

    id: 'compareWidgetsModal',

    className: 'modal is-huge',

    template: Handlebars.compile(tpl),

    events: function() {
      return _.extend({}, ModalView.prototype.events, {
        'click .js-field-list-checkbox-widget' : 'changeWidgets',
        'click .js-btn-continue' : 'hide',
      });
    },

    initialize: function() {
      // Inits
      this.constructor.__super__.initialize.apply(this);
      // Presenter & status
      this.presenter = new CompareModalWidgetsPresenter(this);
      this.status = this.presenter.status;

      this.render();
      this.$body.append(this.el);
    },

    setListeners: function() {
    },

    render: function() {
      this.$el.html(this.template(this.parseData()));
      this._initVars();
      this.cacheVars();
    },

    parseData: function() {
      return {
        widgets: this.status.get('widgets')
      }
    },

    cacheVars: function() {
      this.$checkboxes = this.$el.find('.js-field-list-checkbox-widget');
    },

    setWidgetsStatus: function() {
      _.each(this.$checkboxes, _.bind(function(el){
        var is_active = _.contains(this.status.get('widgetsActive'),$(el).data('id'));
        $(el).toggleClass('is-active', is_active);
      }, this ));
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
