define([
  'jquery',
  'backbone',
  'underscore',
  'handlebars',
  'views/ModalView',
  'countries/presenters/show/CountryWidgetsModalPresenter',
  'text!countries/templates/countryWidgetsModal.handlebars'
], function($, Backbone, _, Handlebars, ModalView, CountryWidgetsModalPresenter, tpl) {

  'use strict';

  var CountryWidgetsModalView = ModalView.extend({

    id: 'countryWidgetsModal',

    className: 'modal is-huge',

    template: Handlebars.compile(tpl),

    events: function() {
      return _.extend({}, ModalView.prototype.events, {
        'click .js-field-list-checkbox-widget' : 'changeWidgets',
        'click .js-field-list-checkbox-jurisdiction' : 'changeJurisdictions',
        'click .js-field-list-checkbox-area' : 'changeAreas',
        'click .js-btn-continue' : 'hide',
        'click .js-btn-next'  : '_nextStep',
        'click #js-btn-back'  : '_prevStep'
      });
    },

    initialize: function() {
      // Inits
      this.constructor.__super__.initialize.apply(this);
      // Presenter & status
      this.presenter = new CountryWidgetsModalPresenter(this);
      this.status = this.presenter.status;
    },

    render: function() {
      this.$el.html(this.template(this.parseData()));
      this._initVars();
      this.cacheVars();
      this.$body.append(this.el);
    },

    parseData: function() {
      var forestAndCarbon = 'Forest and Carbon Data';
      // TODO: make this dynamic
      var peatDrainageSlug = 'emissions-from-peat-drainage-on-plantations';
      var peatDrainageCountries = ["IDN", "MYS"];

      var widgets = _.groupBy(this.status.get('widgets'), 'type'),
        jurisdictions, areas;

      switch(this.status.get('view')) {

        case 'subnational':
          widgets = widgets[forestAndCarbon];
          jurisdictions = this.presenter.countryModel.get('jurisdictions');
          jurisdictions = jurisdictions.length > 0 ? jurisdictions : null;
          break;

        case 'areas-interest':
          widgets = widgets[forestAndCarbon];
          areas = this.presenter.countryModel.get('areas_of_interest');
          areas = areas.length > 0 ? areas : null;
          break;
      }

      if (widgets[forestAndCarbon]) {
        var country = this.status.get('country');
        for (var i = 0, wLength = widgets[forestAndCarbon].length; i < wLength; i++) {
          if (widgets[forestAndCarbon][i].slug === peatDrainageSlug) {
            widgets[forestAndCarbon][i].hide = peatDrainageCountries.indexOf(country) < 0;
          }
        }
      }
      console.log(widgets[forestAndCarbon]);
      return {
        view: {
          isNational: (this.status.get('view') == 'national') ? true : false,
          isSubNational: (this.status.get('view') == 'subnational') ? true : false,
          isAreas: (this.status.get('view') == 'areas-interest') ? true : false
        },
        widgets: widgets,
        jurisdictions: jurisdictions,
        areas: areas
      }
    },

    cacheVars: function() {
      this.$checkboxes = this.$el.find('.js-field-list-checkbox-widget');
      this.$jurisdictionsBoxes = this.$el.find('.js-field-list-checkbox-jurisdiction');
      this.$areasBoxes = this.$el.find('.js-field-list-checkbox-area');
      this.$page1 = this.$el.find('.page-1');
      this.$page2 = this.$el.find('.page-2');
    },

    setWidgetsStatus: function() {
      _.each(this.$checkboxes, _.bind(function(el){
        var is_active = _.contains(this.status.get('widgetsActive'),$(el).data('id'));
        $(el).toggleClass('is-active', is_active);
      }, this ));
    },

    // Set active jurisdictions (not widgets)
    setJurisdictionStatus: function() {
      _.each(this.$jurisdictionsBoxes, _.bind(function(el){
        var is_active = _.contains(this.status.get('jurisdictionsIds'),$(el).data('id'));
        $(el).toggleClass('is-active', is_active);
      }, this ));
    },

    // Set active areas (not widgets)
    setAreasStatus: function() {
      _.each(this.$areasBoxes, _.bind(function(el){
        var is_active = _.contains(this.status.get('areasIds'),$(el).data('id'));
        $(el).toggleClass('is-active', is_active);
      }, this ));
    },

    hide: function(e) {
      e && e.preventDefault();
      this.model.set('hidden', true);
      this.$htmlbody.removeClass('active');
      this.presenter.setActiveWidgets();
      this.presenter.hide();
      this._resetPagesPosition();
    },

    changeWidgets: function(e) {
      this.presenter.changeActiveWidgets($(e.currentTarget).data('id'),$(e.currentTarget).hasClass('is-active'));
    },

    changeJurisdictions: function(e) {
      this.presenter.changeActiveJurisdictions($(e.currentTarget).data('id'),$(e.currentTarget).hasClass('is-active'));
    },

    changeAreas: function(e) {
      this.presenter.changeActiveAreas($(e.currentTarget).data('id'),$(e.currentTarget).hasClass('is-active'));
    },

    enableSelection: function() {
      this.$el.find('.m-field-list').removeClass('-disabled');
    },

    disableSelection: function() {
      this.$el.find('.m-field-list').addClass('-disabled');
    },

    _nextStep: function() {
      var view = this.status.get('view');

      switch(view) {
        case 'subnational':
          this._setJurisdictions();
          break;

        case 'areas-interest':
          this._setAreas();
          break;
      }

      this.$page1.toggleClass('is-hidden');
      this.$page2.toggleClass('is-hidden');
    },

    _prevStep: function() {
      this.$page1.toggleClass('is-hidden');
      this.$page2.toggleClass('is-hidden');
    },

    _resetPagesPosition: function() {
      var view = this.presenter.status.get('view');

      if(view !== 'national') {
        this.$page1.removeClass('is-hidden');
        this.$page2.addClass('is-hidden');
      } else {
        this.$page1.addClass('is-hidden');
        this.$page2.removeClass('is-hidden');
      }
    },

    _setJurisdictions: function() {
      var items = $('.jurisdictions-group').find('.is-active'),
        jurisdictions = [];

      var iso = this.status.get('country');

      _.map(items, function(i) {
        jurisdictions.push({
          id: iso + $(i).data('id') + '0',
          idNumber: ~~$(i).data('id'),
          name: $(i).data('name')
        });
      });

      this.status.set({
        jurisdictions: jurisdictions,
        areas: null
      });
    },

    _setAreas: function() {
      var items = $('.areas-group').find('.is-active'),
        areas = [];

      var iso = this.status.get('country');

      _.map(items, function(i) {
        areas.push({
          id: iso + $(i).data('id') + '0',
          idNumber: ~~$(i).data('id'),
          name: $(i).data('name')
        });
      });

      this.status.set({
        areas: areas,
        jurisdictions: null
      });
    },

  });

  return CountryWidgetsModalView;

});
