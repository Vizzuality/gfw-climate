define([
  'jquery',
  'mps',
  'backbone',
  'underscore',
  'handlebars',
  'views/SourceWindowView',
  'countries/models/CountryModel',
  'widgets/collections/WidgetCollection',
  'countries/presenters/show/CountryModalPresenter',
  'text!countries/templates/reports-modal.handlebars'
], function($, mps, Backbone, _, Handlebars, SourceWindowView,
  CountryModel, WidgetCollection, CountryModalPresenter, indicatorTemplate) {

  'use strict';

  /*
   * REFACTOR MÁS ADELANTE
   */
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
      this.widgetCollection = new WidgetCollection();

      this._setListeners();
    },

    _setListeners: function() {
      this.presenter.status.on('change:view', this.start, this);
    },

    start: function() {
      this.countryModel = new CountryModel({
        iso: this.presenter.status.get('country')
      });

      this.widgetCollection.fetch().done(function(){
        this._setupModal();
      }.bind(this));
    },

    update: function() {
      var $jurisdictionsList = $('#jurisdictions-list'),
        $areasList = $('#areas-list'),
        $indicatorsGroup = $('.indicators-group'),
        indicators = this.presenter.status.get('options')['activedWidgets'];

      this._cleanIndicators();
      this.setData();

      if (indicators) {
        indicators.forEach(function(ind) {
          $indicatorsGroup.find('li[data-id="' + ind + "']").addClass('is-selected');
        });
      }

      switch(this.presenter.status.get('view')) {

        case 'subnational':

          var jurisdictions = this.presenter.status.get('jurisdictions');

          if (!jurisdictions) {
            return;
          }

          jurisdictions.forEach(function(j) {
            $jurisdictionsList.find('li[data-id="' + j.idNumber + '"]').addClass('is-selected');
          });

          break;

        case 'areas':
          var areas = this.presenter.status.get('areas');

          if (!areas) {
            return;
          }

          areas.forEach(function(a) {
            $areasList.find('li[data-id="' + a.idNumber + '"]').addClass('is-selected');
          });

          break;
      }
    },

    _cleanIndicators: function() {
      $('.indicators-group').find('li').removeClass('is-selected');
      $('#jurisdictions-list').find('li').removeClass('is-selected');
      $('#areas-list').find('li').removeClass('is-selected');
    },

    setInitialParams: function() {
      var $jurisdictionsList = $('#jurisdictions-list'),
        $areasList = $('#areas-list'),
        $indicatorsGroup = $('.indicators-group');

      // Change this
      var defaultIndicators = [1,2,3,4,5];

      if (!this.presenter.status.get('options') || !this.presenter.status.get('options')['widgets']) {

        if (this.presenter.status.get('view') !== 'national') {
          return;
        }

        defaultIndicators.forEach(function(ind) {
          $indicatorsGroup.find('li[data-id="' + ind + '"]').addClass('is-selected');
        });

        return;
      }

      var opts = this.presenter.status.get('options');

      // Jurisdictions
      if (opts.jurisdictions) {
        var jurisdictions = opts.jurisdictions;

        jurisdictions.forEach(function(j) {
          $jurisdictionsList.find('li[data-id="' + j.idNumber + '"]').addClass('is-selected');
        });
      }

      // Areas
      if (opts.areas) {
        var areas = opts.areas;

        areas.forEach(function(a) {
          $areasList.find('li[data-id="' + a.idNumber + '"]').addClass('is-selected');
        });
      }

      // Indicators
      if (opts.widgets) {
        var key = Object.keys(opts.widgets),
          indicators = opts.widgets[key[0]];

        _.map(indicators, function(i) {
          $indicatorsGroup.find('li[data-id="' + i[0].id + '"]').addClass('is-selected');
        });
      }
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
        indicators.push(~~$(i).data('id') );
      });

      console.log(indicators)

      this.presenter.setIndicators(indicators);
    },

    _addJurisdictions: function() {
      var items = $('.jurisdictions-group').find('.is-selected'),
        jurisdictions = [];

      var iso = sessionStorage.getItem('countryIso');

      _.map(items, function(i) {
        jurisdictions.push({
          id: iso + $(i).data('id') + '0',
          idNumber: ~~$(i).data('id'),
          name: $(i).data('name')
        });
      });

      this.presenter.setJurisdictions(jurisdictions);
      this.presenter.setAreas(null);
    },

    setData: function() {
      this._addAreas();
      this._addJurisdictions();
    },

    _addAreas: function() {
      var items = $('.areas-group').find('.is-selected'),
        areas = [];

      var iso = sessionStorage.getItem('countryIso');

      _.map(items, function(i) {
        areas.push({
          id: iso + $(i).data('id') + '0',
          idNumber: ~~$(i).data('id'),
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
      this._resetPosition();
    },

    _resetPosition: function() {
      var view = this.presenter.status.get('view');

      if(view !== 'national') {
        this.$el.find('.page1').removeClass('is-hidden');
        this.$el.find('.page2').toggleClass('is-hidden');
      } else {
        this.$el.find('.page1').addClass('is-hidden');
        this.$el.find('.page2').removeClass('is-hidden');
      }
    },


    _setupModal: function() {
      var view = this.presenter.status.get('view');

      var indicatorsByGroup = _.groupBy(this.widgetCollection.toJSON(), 'type');

      switch(view) {

        case 'national':

          this.setup = {
            isNational: true,
            indicators: indicatorsByGroup
          };

          this.render();

          break;

        case 'subnational':

          this.countryModel.fetch().done(function() {
            this.setup = {
              jurisdictions: this.countryModel.get('jurisdictions'),
              indicators: {
                'Forest and Carbon Data':  indicatorsByGroup['Forest and Carbon Data']
              }
            };

            this.render();

          }.bind(this));

          break;

        case 'areas-interest':

          this.countryModel.fetch().done(function() {

            this.setup = {
              areas: this.countryModel.get('areas_of_interest'),
              indicators: {
                'Forest and Carbon Data':  indicatorsByGroup['Forest and Carbon Data']
              },
            };

            this.render();

          }.bind(this));

          break;
      }

      if (view === 'national') {
        this.$el.find('.page2').removeClass('is-hidden');
      }
    },

    render: function() {

      this.$el.addClass('source_window--countries');

      this._resetPosition();
      this._cleanIndicators();

      this.$el.html(this.template({
        data: this.setup
      }));

      this.setInitialParams();
    }

  });

  return CountryModalView;

});
