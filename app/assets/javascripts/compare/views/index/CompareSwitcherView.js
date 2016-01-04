define([
  'backbone',
  'handlebars',
  'underscore',
  'chosen',
  'compare/presenters/CompareSelectorsPresenter',
  'helpers/CountryHelper',
  'text!compare/templates/compareSwitcher.handlebars'
], function(Backbone, Handlebars, _, chosen, CompareSelectorsPresenter, CountryHelper, tpl) {

  var CompareSwitcherView = Backbone.View.extend({

    el: '#compareSwitcherView',

    template: Handlebars.compile(tpl),

    events: {
      'click .js--compare-switcher': 'moveComparePanel'
    },

    initialize:function() {
      this.presenter = new CompareSelectorsPresenter(this);
      this.status = this.presenter.status;
      this.helper = CountryHelper;
    },

    render: function() {
      this.$el.html(this.template(this._parseData()));

      this._setActiveTabMb();
    },

    _parseData: function() {
      var country1 = this.status.get('country1').toJSON();
      var country2 = this.status.get('country2').toJSON();

      var select1 = {
        tab: '1',
        name: this.setName(country1,1)
      };

      var select2 = {
        tab: '2',
        name: this.setName(country2,2)
      };

      return { selection: [select1, select2] };
    },

    _setActiveTabMb: function() {
      $('.js--compare-switcher[data-tab="1"]').addClass('is-active');
    },

    setName: function(country,tab) {
      var jurisdiction = ~~this.status.get('compare'+tab).jurisdiction;
      var area = ~~this.status.get('compare'+tab).area;
      if (!!jurisdiction) {
        return _.findWhere(country.jurisdictions, {id: jurisdiction}).name +' in ' + country.name;
      } else if (!!area) {
        return _.findWhere(country.areas_of_interest, {id: area }).name +' in ' + country.name;
      } else {
        return country.name;
      }
    },

    moveComparePanel: function (e) {
      var $panel = $('.widgets-wrapper');
      var $switchers = $('.js--compare-switcher');
      var $currentBtn = $(e.currentTarget);
      var tab = $currentBtn.data('tab');

      if ( tab == 2 ) {
        $panel.addClass( 'is-tab-'+tab );
      } else {
        $panel.removeClass('is-tab-2');
      }

      $switchers.removeClass('is-active');
      $currentBtn.addClass('is-active');
    }

  });

  return CompareSwitcherView;

});
