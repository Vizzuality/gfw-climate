/**
 * The CompareFixedHeaderView view.
 */
define([
  'jquery',
  'backbone',
  'underscore',
  'handlebars',
  'mps',
  'compare/presenters/CompareFixedHeaderPresenter',
  'text!compare/templates/compareFixedHeader.handlebars'
], function($, Backbone, _, Handlebars, mps, CompareFixedHeaderPresenter, tpl) {

  'use strict';

  var CompareFixedHeaderView = Backbone.View.extend({

    el: '#compareFixedHeaderView',

    template: Handlebars.compile(tpl),

    events: {},

    initialize: function() {
      this.presenter = new CompareFixedHeaderPresenter(this);
      this.status = this.presenter.status;
      //CACHE
      this.$window = $(window);
      this.$document = $(document);

      this.$offsetTop = $('#offsetTop');
      this.$offsetBottom = $('#offsetBottom');

      // //INITS
      this.calculateOffsets();
      this.scrollDocument();

      this.setListeners();
    },

    setListeners: function(){
      this.$document.on('scroll',_.bind(this.scrollDocument,this));
      this.$window.on('resize',_.bind(this.calculateOffsets,this));
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
        }else{
          this.$el.removeClass('is-fixed').addClass('is-bottom');
        }
      }else{
        this.$el.removeClass('is-fixed is-bottom');
      }
    },

    render: function() {
      this.$el.html(this.template(this._parseData()));
    },

    _parseData: function() {
      var country1 = this.status.get('country1').toJSON();
      var country2 = this.status.get('country2').toJSON();

      var select1 = {
        tab: '1',
        name: this.setName(country1,1),
      };

      var select2 = {
        tab: '2',
        name: this.setName(country2,2),
      };

      return { selection: [select1, select2] };
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


  });

  return CompareFixedHeaderView;

});
