define([
  'jquery',
  'mps',
  'backbone',
  'underscore',
  'handlebars',
  'views/SourceWindowView',
  'countries/models/CountryModel',
  'countries/presenters/show/CountryModalPresenter',
  'text!countries/templates/reports-modal.handlebars'
], function($, mps, Backbone, _, Handlebars, SourceWindowView,
  CountryModel, CountryModalPresenter, indicatorTemplate) {

  'use strict';

  var CountryModalView = SourceWindowView.extend({

    template: Handlebars.compile(indicatorTemplate),

    el: '.source_window',

    events: function() {
      return _.extend({}, SourceWindowView.prototype.events, {
        'click .item'      : '_toggleWidgets',
        'click #btn-done'  : '_submitWidgets',
        'click #btn-next'  : '_nextStep',
        'click #btn-back'  : '_prevStep'
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

    _prevStep: function() {
      this.$el.find('.page1').toggleClass('is-hidden');
      this.$el.find('.page2').toggleClass('is-hidden');
    },

    _nextStep: function() {
      var view = this.presenter.status.get('view');

      switch(view) {
        case 'subnational':
          this._addJurisdictions();
          break;

        case 'areas-interest':
          this._addAreas();
          break;
      }

      this.$el.find('.page1').toggleClass('is-hidden');
      this.$el.find('.page2').toggleClass('is-hidden');
    },

    _addIndicators: function() {
      var items = $('.indicators-group').find('.is-selected'),
        indicators = [];

      _.map(items, function(i) {
        indicators.push(~~i.getAttribute('id'));
      });

      this.presenter.setIndicators(indicators);
    },

    _addJurisdictions: function() {
      var items = $('.jurisdictions-group').find('.is-selected'),
        jurisdictions = [];

      var iso = sessionStorage.getItem('countryIso');

      _.map(items, function(i) {
        jurisdictions.push({
          id: iso + i.getAttribute('id') + '0',
          idNumber: ~~i.getAttribute('id'),
          name: $(i).data('name')
        });
      });

      this.presenter.setJurisdictions(jurisdictions);
      this.presenter.setAreas(null);
    },

    _addAreas: function() {
      var items = $('.areas-group').find('.is-selected'),
        areas = [];

      var iso = sessionStorage.getItem('countryIso');

      _.map(items, function(i) {
        areas.push({
          id: iso + i.getAttribute('id') + '0',
          idNumber: ~~i.getAttribute('id'),
          name: $(i).data('name')
        });
      });

      this.presenter.setAreas(areas);
      this.presenter.setJurisdictions(null);
    },

    _toggleWidgets: function(e) {
      $(e.currentTarget).toggleClass('is-selected');
    },

    _submitWidgets: function() {
      this._addIndicators();

      if (this.presenter.status.get('view') === 'national') {
        this.presenter.setJurisdictions(null);
        this.presenter.setAreas(null);
      }

      mps.publish('Grid/update', [{
        options: this.presenter.status.toJSON(),
        jurisdictions: this.presenter.status.get('jurisdictions'),
        areas: this.presenter.status.get('areas'),
        view: this.presenter.status.get('view'),
        country: sessionStorage.getItem('countryIso')
      }]);

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
