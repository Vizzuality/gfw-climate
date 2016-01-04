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

      //CACHE
      this.$window = $(window);
      this.$document = $(document);
      
      this.$offsetTop = $('#offsetTop');
      this.$offsetBottom = $('#offsetBottom');

      this.calculateOffsets();
      this.scrollDocument();
      this.setListeners();
    },

    render: function() {
      this.$el.html(this.template(this._parseData()));

      this._setActiveTabMb();
    },

    setListeners: function(){
      this.$document.on('scroll',_.bind(this.scrollDocument,this));
      this.$window.on('resize',_.bind(this.calculateOffsets,this));
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
    },

    calculateOffsets: function(){
      this.offsetTop = this.$offsetTop.offset().top;
      this.offsetBottom = this.$offsetBottom.offset().top - this.$el.height();
    },

    scrollDocument: function(e){
      var scrollTop = this.$document.scrollTop();
      this.calculateOffsets();
      if (scrollTop > this.offsetTop) {
        if(scrollTop < this.offsetBottom) {
          this.$el.removeClass('is-bottom').addClass('is-fixed');
        } else {
          this.$el.removeClass('is-fixed').addClass('is-bottom');
        }
      } else {
        this.$el.removeClass('is-fixed is-bottom');
      }
    },

  });

  return CompareSwitcherView;

});
