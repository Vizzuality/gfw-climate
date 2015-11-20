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
    },

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


    // Fix to trigger this function after grid render
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
      console.log(this.cutPoints);
    },

    _checkPosition:function(y) {

      if (this.cutPoints) {
        if(y > this.cutPoints[4].cutpoint) {
          this.presenter.setName(this.cutPoints[4]);
        } else if(y > this.cutPoints[3].cutpoint) {
          this.presenter.setName(this.cutPoints[3]);
        } else if(y > this.cutPoints[2].cutpoint) {
          this.presenter.setName(this.cutPoints[2]);
        } else if(y > this.cutPoints[1].cutpoint) {
          this.presenter.setName(this.cutPoints[1]);
        } else if(y > this.cutPoints[0].cutpoint) {
           this.presenter.setName(this.cutPoints[0]);
        }
      }
    },


    scrollDocument: function(e){
      var scrollTop = this.$document.scrollTop();
      this.calculateOffsets();
      this._checkPosition(scrollTop);
      if (scrollTop > this.offsetTop) {
        this.$offsetTop.css({'padding-top': this.$el.height()});
        if(scrollTop < this.offsetBottom) {
          this.$el.removeClass('is-bottom').addClass('is-fixed');
        }else{
          this.$el.removeClass('is-fixed').addClass('is-bottom');
        }
      }else{
        this.$offsetTop.css({'padding-top': 0});
        this.$el.removeClass('is-fixed is-bottom');
      }
    },

    render: function() {
      this.$el.html(this.template(this._parseData()));
      this.$el.find('ul').addClass('-country');
    },

    _parseData: function() {
      var country = this.status.get('country');

      var data = {
        tab: '1',
        name:  _.map(country.options.jurisdictions, function(j) {
            return _.pick(j, 'name', 'id')
        })
      };

      return {country: data};
    }

  });

  return FixedHeaderView;

});
