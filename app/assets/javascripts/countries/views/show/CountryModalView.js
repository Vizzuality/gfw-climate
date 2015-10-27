define([
  'jquery',
  'backbone',
  'underscore',
  'handlebars',
  'views/SourceWindowView',
  'countries/models/CountryModel',
  'countries/presenters/show/CountryModalPresenter',
  'text!countries/templates/reports-modal.handlebars'
], function($, Backbone, _, Handlebars, SourceWindowView,
  CountryModel, CountryModalPresenter, indicatorTemplate) {

  'use strict';

  var CountryModalView = SourceWindowView.extend({

    template: Handlebars.compile(indicatorTemplate),

    el: '.source_window',

    events: function() {
      return _.extend({}, SourceWindowView.prototype.events, {
        'click .item'      : '_toggleWidgets',
        'click #btn-done'  : '_submitWidgets',
        'click #btn-next'  : '_navModal',
        'click #btn-back'  : '_navModal'
      });
    },

    initialize: function() {
      this.constructor.__super__.initialize.apply(this);
      this.presenter = new CountryModalPresenter(this);

      var iso = sessionStorage.getItem('countryIso');

      this.countryModel = new CountryModel({id: iso});


      this.enabledIndicators = [];

      this.$el.addClass('source_window--countries')

      this._setListeners();

      this._setupModal();
    },

    _setListeners: function() {
      this.presenter.status.on('change:view', this._setupModal, this);
    },

    show: function(e) {
      e && e.preventDefault() && e.stopPropagation();
      this.model.set('hidden', false);
    },

    _navModal: function() {
      this.$el.find('.page1').toggleClass('is-hidden');
      this.$el.find('.page2').toggleClass('is-hidden');
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
    },

    _setupModal: function() {
      var view = this.presenter.status.get('view');

      switch(view) {

        case 'national':
          this.setup = {
            isNational: true
          };

          this.render();

          break;

        case 'subnational':

          // TO FIX

          this.countryModel.fetch().done(function() {

            this.setup = {
              isJurisdictions: true,
              jurisdictions: this.countryModel.get('jurisdictions')
            };

            this.render();

          }.bind(this));

          break;

        case 'areas-interest':

          this.setup = {
            isAreas: true
          };

          this.render();

          break;
      }

      if (view === 'national') {
        this.$el.find('.page2').removeClass('is-hidden');
      }

    },

    render: function() {

      this.$el.html(this.template({
        data: this.setup
      }));
    }

  });

  return CountryModalView;

});
