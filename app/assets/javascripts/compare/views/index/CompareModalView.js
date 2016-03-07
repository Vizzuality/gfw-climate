define([
  'jquery',
  'backbone',
  'underscore',
  'handlebars',
  'chosen',
  'views/ModalView',
  'compare/presenters/CompareModalPresenter',
  'text!compare/templates/compareModal.handlebars'
], function($, Backbone, _, Handlebars, chosen, ModalView, CompareModalPresenter, tpl) {

  'use strict';

  var CountryModalView = ModalView.extend({

    id: 'compareModal',

    className: 'modal is-huge',

    template: Handlebars.compile(tpl),

    events: function() {
      return _.extend({}, ModalView.prototype.events, {
        'click  .js-modal-tablink'                 : 'changeTab',
        'click  .js-field-list-radio-jurisdiction' : 'changeJurisdiction',
        'click  .js-field-list-radio-area'         : 'changeArea',
        'click  .js-btn-continue'                  : 'continue',
        'change .js-chosen-select'                 : 'changeIso',
      });
    },

    initialize: function() {
      // Inits
      this.constructor.__super__.initialize.apply(this);

      // Presenter & status
      this.presenter = new CompareModalPresenter(this);
      this.status = this.presenter.status;

      this.render();
      this.$body.append(this.el);
    },

    render: function() {
      this.$el.html(this.template(this.parseData()));
      this._initVars();
      this.cacheVars();
      this.inits();
    },

    parseData: function() {
      return {
        countries: this.status.get('countries'),
        country1: this.status.get('country1'),
        country2: this.status.get('country2'),
      };
    },

    cacheVars: function() {
      this.$selects =   $('.js-chosen-select');
      this.$radios =    $('.js-field-list-radio');
      this.$tablinks =  $('.js-modal-tablink');
      this.$tabs =      $('.js-modal-tab');
    },

    inits: function() {
      this.$selects.chosen({
        width: '100%',
        // inherit_select_classes: true,
      });
      this.setTab();
    },

    hide: function(e) {
      e && e.preventDefault();
      this.model.set('hidden', true);
      this.$htmlbody.removeClass('active');
      if(!!this.status.get('compare1') && !!this.status.get('compare2')) {
        this.presenter.changeSelection();
      }

    },

    continue: function(e) {
      e && e.preventDefault();
      (!!!this.status.get('compare1')) ? this.presenter.changeTab(1) : null;
      (!!!this.status.get('compare2')) ? this.presenter.changeTab(2) : null;
      if(!!this.status.get('compare1') && !!this.status.get('compare2')) {
        ga('send', 'event', 'Compare Page','Select Countries',
           this.status.get('compare1').iso+':'+this.status.get('compare2').iso);
        this.hide();
      }
    },

    /*
      CHANGERS: Change values events
      - changeTab
      - changeIso
      - changeJurisdiction
      - changeArea
    */
    changeTab: function(e) {
      this.presenter.changeTab($(e.currentTarget).data('tab'));
    },

    changeIso: function(e) {
      this.presenter.changeIso($(e.currentTarget).val());
      (!!$(e.currentTarget).val()) ? this.$contentWrapper.addClass('is-loading') : null;
    },

    changeJurisdiction: function(e) {
      var jurisdiction = ($(e.currentTarget).hasClass('is-active')) ? 0 : $(e.currentTarget).data('id');
      this.presenter.changeJurisdiction(jurisdiction);
    },

    changeArea: function(e) {
      var area = ($(e.currentTarget).hasClass('is-active')) ? 0 : $(e.currentTarget).data('id');
      this.presenter.changeArea(area);
    },

    /*
      SETTERS: Set selected values by params
      - setTab
      - setCompare
    */
    setTab: function(tab) {
      var tab = this.status.get('tab');

      // Tablinks
      this.$tablinks.removeClass('is-active');
      this.$el.find('.js-modal-tablink[data-tab='+tab+']').addClass('is-active');

      // Tabs
      this.$tabs.removeClass('is-active');
      $('#selection'+tab).addClass('is-active');

      // Scroll
      this.$contentWrapper.scrollTop(0);
    },

    setCompare: function(who,compare) {
      this.$contentWrapper.removeClass('is-loading');
      if (compare) {
        var $select = $('#selection'+who).find('select'),
            $selectChosen = $('#selection'+who).find('.chosen-container'),
            $areas = $('#selection'+who).find('.compare-area'),
            $jurisdictions = $('#selection'+who).find('.compare-jurisdiction'),
            $radios = $('#selection'+who).find('.js-field-list-radio');

        // Set selects
        $select.toggleClass('with-selection',!!compare.iso);
        $selectChosen.toggleClass('with-selection',!!compare.iso);
        $select.val(compare.iso);
        $select.trigger('chosen:updated');

        // Set areas and jurisdiction
        $radios.removeClass('is-active');
        if (!!compare.area) {
          $areas.find('li[data-id='+compare.area+']').addClass('is-active');
        }
        if (!!compare.jurisdiction) {
          $jurisdictions.find('li[data-id='+compare.jurisdiction+']').addClass('is-active');
        }
      }
    },

  });

  return CountryModalView;

});
