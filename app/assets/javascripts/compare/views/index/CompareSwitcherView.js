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
      'click .js--compare-switcher': '_moveComparePanel'
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

      this._calculateOffsets();
      this._scrollDocument();
      this._setListeners();
    },

    render: function() {
      this.$el.html(this.template(this._parseData()));

      this._setActiveTabMb();
    },

    _setListeners: function(){
      this.$document.on('scroll',_.bind(this._scrollDocument,this));
      // $('#compareGridView').on('scroll',_.bind(this._checkPannel,this));
      this.$window.on('resize',_.bind(this._calculateOffsets,this));
      Backbone.Events.on('compareTabMb:change', _.bind(this._changeTab), this)
    },

    _parseData: function() {
      var country1 = this.status.get('country1').toJSON();
      var country2 = this.status.get('country2').toJSON();

      var select1 = {
        tab: '1',
        name: this._setName(country1,1)
      };

      var select2 = {
        tab: '2',
        name: this._setName(country2,2)
      };

      return { selection: [select1, select2] };
    },

    _setActiveTabMb: function() {
      $('.js--compare-switcher[data-tab="1"]').addClass('is-active');
    },

    _setName: function(country,tab) {
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

    _moveComparePanel: function (e) {
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

    _calculateOffsets: function(){
      this.offsetTop = this.$offsetTop.offset().top;
      this.offsetBottom = this.$offsetBottom.offset().top - this.$el.height();
    },

    _scrollDocument: function(e){
      var scrollTop = this.$document.scrollTop();
      this._calculateOffsets();
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

    _changeTab: function(activeTab) {
      this.$('.js--compare-switcher').removeClass('is-active');
      this.$('.'+activeTab).addClass('is-active');
    }



  });

  return CompareSwitcherView;

});
