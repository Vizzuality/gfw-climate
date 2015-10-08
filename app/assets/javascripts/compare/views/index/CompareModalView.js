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
        'click .m-modal--tablink' : 'changeTab',
        'change .chosen-select' : 'changeIso'
      });
    },

    initialize: function() {
      // Inits
      this.constructor.__super__.initialize.apply(this);
      this.$el.addClass('is-huge');
      // Presenter & status
      this.presenter = new CompareModalPresenter(this);
      this.status = this.presenter.status;
      // Listeners
      this.setListeners();
    },

    setListeners: function() {
      // Compare
      this.status.on('change:compare1', function(model,compare){
        this.setCompare(1,compare);
        (!!model.get('compare2')) ? this.setCompare(2,model.get('compare2')) : null;
      }, this);
      this.status.on('change:compare2', function(model,compare){
        (!!model.get('compare1')) ? this.setCompare(1,model.get('compare1')) : null;
        this.setCompare(2,compare);
      }, this);

      // Tab
      this.status.on('change:tab', this.setTab, this);
    },

    render: function() {
      this.$el.html(this.template(this.parseData()));
      this.cacheVars();
      this.inits();
    },

    parseData: function() {
      // Ooops!!! This should be served by the API //
      var country1  = this.presenter.status.get('country1');
      var country2  = this.presenter.status.get('country2');
      (country1) ? country1.areas = [{ name: 'TREE PLANTATIONS',id: 1,},{ name: 'PROTECTED AREAS',id: 2,},{ name: 'PRIMARY FORESTS',id: 3,},{ name: 'MORATORIUM AREAS',id: 4,},{ name: 'MINING CONCESSIONS',id: 5,},{ name: 'LOGGING CONCESSIONS',id: 6,},{ name: 'PLANTATION CONCESSIONS',id: 7,},{ name: 'KEY BIODIVERSITY AREAS',id: 8,}] : null;
      (country2) ? country2.areas = [{ name: 'TREE PLANTATIONS',id: 1,},{ name: 'PROTECTED AREAS',id: 2,},{ name: 'PRIMARY FORESTS',id: 3,},{ name: 'MORATORIUM AREAS',id: 4,},{ name: 'MINING CONCESSIONS',id: 5,},{ name: 'LOGGING CONCESSIONS',id: 6,},{ name: 'PLANTATION CONCESSIONS',id: 7,},{ name: 'KEY BIODIVERSITY AREAS',id: 8,}] : null;
      // ***** //
      return {
        countries: this.presenter.status.get('countries'),
        country1: country1,
        country2: country2,
      };
    },

    cacheVars: function() {
      this.$selects = $('.chosen-select');
      this.$radios = $('.m-field-list-radio');
      this.$tablinks = $('.m-modal--tablink');
      this.$tabs = $('.m-modal--tab');
    },

    inits: function() {
      this.$selects.chosen({
        width: '100%'
      });
      this.setTab();
    },

    show: function(e) {
      e && e.preventDefault() && e.stopPropagation();
      this.model.set('hidden', false);
    },

    // Events
    changeTab: function(e) {
      this.presenter.changeTab($(e.currentTarget).data('tab'));
    },

    changeIso: function(e) {
      this.presenter.changeIso($(e.currentTarget).val(),$(e.currentTarget).data('compare'));
    },

    // Set selected values by params
    setCompare: function(who,compare) {
      if (compare) {
        var $select = $('#selection'+who).find('select'),
            $areas = $('#selection'+who).find('.compare-area'),
            $jurisdictions = $('#selection'+who).find('.compare-jurisdiction');

        // Set selects
        $select.val(compare.iso);
        $select.trigger('chosen:updated');

        // Set areas
        if (!!compare.area) {
          $areas.find('li[data-id='+compare.area+']').addClass('is-active');
        }

        // Set jurisdiction
        if (!!compare.jurisdiction) {
          $jurisdictions.find('li[data-id='+compare.jurisdiction+']').addClass('is-active');
        }
      }
    },

    setTab: function() {
      var tab = this.status.get('tab');

      // Tablinks
      this.$tablinks.removeClass('is-active');
      this.$el.find('.m-modal--tablink[data-tab='+tab+']').addClass('is-active');

      //Tabs
      this.$tabs.removeClass('is-active');
      $(tab).addClass('is-active');
    },

    setSublevel: function(e) {
      this.$radios.removeClass('is-active');
      if (!$(e.currentTarget).hasClass('is-active')) {
        $(e.currentTarget).addClass('is-active');
      }
    },




  });

  return CountryModalView;

});
