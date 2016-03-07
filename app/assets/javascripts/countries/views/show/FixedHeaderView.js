/**
 * The CompareFixedHeaderView view.
 */
define([
  'jquery',
  'backbone',
  'underscore',
  'handlebars',
  'mps',
  'countries/presenters/show/FixedHeaderPresenter',
  'text!countries/templates/fixedHeader.handlebars'
], function($, Backbone, _, Handlebars, mps, fixedHeaderPresenter, tpl) {

  'use strict';

  var FixedHeaderView = Backbone.View.extend({

    el: '#fixedHeaderView',

    template: Handlebars.compile(tpl),

    events: {},

    initialize: function() {
      this.presenter = new fixedHeaderPresenter(this);
      this.status = this.presenter.status;
      //CACHE
      this.$window = $(window);
      this.$document = $(document);

      this.$offsetTop = $('#offsetTop');
      this.$offsetBottom = $('#offsetBottom');

      //INITS
      this.calculateOffsets();
      this.scrollDocument();

      this.setListeners();
    },

    setListeners: function(){
      this.$document.on('scroll',_.bind(this.scrollDocument,this));
      this.$window.on('resize',_.bind(this.calculateOffsets,this));

      this.status.on('change:dataName', this.onChangeName, this);
      this.status.on('change:country', this.render, this);
    },

    /**
     * Calculates the neccesary number and percentage of tranlations
     * for every param.
     */
    onChangeName:function() {
      var id = this.status.get('dataName').id,
        index = $('#' + id).data('index'),
        items = $('.-country li').length,
        parentHeight = $('.-country').height() * items,
        totalPercentage,
        translate,

      totalPercentage = (100 / items) * index;
      translate = -Math.abs((parentHeight * totalPercentage) / 100);

      $('.-country').css({
        transform: 'translate(0, ' + translate  + 'px)'
      });
    },

    calculateOffsets: function(){
      this.offsetTop = this.$offsetTop.offset().top;
      this.offsetBottom = this.$offsetBottom.offset().top - this.$el.height();
    },

    /**
     * Obtain the cut points and id's from current widgets displayed
     */
    getCutPoints: function() {
      var boxes = document.getElementsByClassName('box'),
        points = [];

      _.each(boxes, function(b) {
        var id = b.getAttribute('id').split('-')[2];

        points.push({
          id: id,
          cutpoint: $(b).offset().top
        });
      });

      this.cutPoints = points;
    },


    /**
     * Check the current scroll position and set name based
     * on the position.
     */
    _checkPosition:function(y) {
      if (!this.cutPoints) {
        return;
      }

      var max = this.cutPoints.length;

      for (var i = max - 1; i >= 0; i--) {
        if (y > this.cutPoints[i].cutpoint) {
          return this.presenter.setName(this.cutPoints[i]);
        }
      }
    },

    scrollDocument: function(e){
      var scrollTop = this.$document.scrollTop();
      this.calculateOffsets();
      this._checkPosition(scrollTop);
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
      this.$el.find('ul').addClass('-country');
      this.getCutPoints();
    },

    lockHeader: function() {
      this.$el.addClass('is-hidden');
    },

    unlockHeader: function() {
      this.$el.removeClass('is-hidden');
    },

    _parseData: function() {
      var country = this.status.get('country'),
        data, filter;

      switch(country.options.view) {

        case 'national':

          return { country: {
            tab: '1',
            name: [{
              name: country['countryName']
            }]
          }};

        case 'subnational':
            filter = country.options.jurisdictions;
          break;

        case 'areas':
            filter = country.options.areas;
          break;
      }


      data = _.map(filter, function(d) {
        return _.pick(d, 'name', 'id')
      });

      return { country: {
        tab: '1',
        name: data
      }};
    }

  });

  return FixedHeaderView;

});
