define([
  'jquery',
  'backbone',
  'underscore',
  'handlebars',
  'mps',
  'views/SourceWindowView',
  'text!countries/templates/country-indicators-window.handlebars'
], function($,Backbone, _,Handlebars,mps, SourceWindowView, tpl) {

  'use strict';

  var CountryWindowView = SourceWindowView.extend({

    template: Handlebars.compile(tpl),

    el: '.source_window',

    events: function() {
      return _.extend({}, SourceWindowView.prototype.events, {
        'click .indicator': '_toggleIndicator',
        'click #btn-done': 'done'
      });
    },

    initialize: function() {
      this.constructor.__super__.initialize.apply(this);
      this.$el.addClass('source_window--countries')
      this.render();
    },

    _deselectIndicator: function() {
      this.removeClass('indicator__name--selected');
    },

    _selectIndicator: function() {
      this.addClass('indicator__name--selected')
    },

    _toggleIndicator: function(e) {
      // if($(e.currentTarget).hasClass('indicator__name--selected') {

      // })
      $(e.currentTarget).find('span').toggleClass('indicator__name--selected');
    },

    show: function(e) {
      e && e.preventDefault() && e.stopPropagation();
      this.model.set('hidden', false);
    },

    done: function() {
      console.log('done!')
    },

    render: function() {
      this.$el.html(this.template);
    }

    // _initBindings: function() {
    //   this.mobile = (this.$window.width() > 850) ? false : true;
    //   this.scrollTop = this.$document.scrollTop();
    //   if(this.mobile) {
    //     this.$htmlbody.addClass('active');
    //     this.$htmlbody.animate({ scrollTop: this.scrollTop },0);
    //   }
    //   // document keyup
    //   this.$document.on('keyup', _.bind(function(e) {
    //     if (e.keyCode === 27) {
    //       this.hide();
    //     }
    //   },this));
    //   // backdrop
    //   this.$backdrop.on('click', _.bind(function() {
    //     this.hide();
    //   },this));
    // },

    // _stopBindings: function() {
    //   if(this.mobile) {
    //     this.$htmlbody.removeClass('active');
    //     this.$htmlbody.animate({ scrollTop: this.scrollTop },0);
    //   }
    //   this.$document.off('keyup');
    //   this.$backdrop.off('click');
    // },

    // _toggle: function() {
    //   if (this.model.get('hidden') === true) {
    //     this._stopBindings();
    //     this.$sourceWindow.removeClass('active iframe');
    //     this.$backdrop.removeClass('active');
    //   } else if (this.model.get('hidden') === false) {
    //     this._initBindings();
    //     this.$sourceWindow.addClass('active');
    //     this.$backdrop.addClass('active');
    //   }
    // },

    // hide: function(e) {
    //   e && e.preventDefault();
    //   this.model.set('hidden', true);
    //   // return this;
    // },

    // show: function(e) {
    //   e && e.preventDefault() && e.stopPropagation();
    //   this.model.set('hidden', false);
    //   // this.$contentWrapper.animate({ scrollTop: 0 }, 0);
    //   // var data_slug = $(e.currentTarget).data('source');
    //   // var data_iframe = $(e.currentTarget).data('iframe');
    //   // (data_iframe) ? this.$sourceWindow.addClass('iframe') : this.$sourceWindow.removeClass('iframe');
    //   // this.$content.html($('#' + data_slug).clone());
    //   // return this;
    // },

    // // showByParam: function(data_slug,link){
    // //   this.model.set('hidden', false);
    // //   var $clone = $('#' + data_slug).clone();
    // //   this.$content.html($clone);
    // //   if (link) {
    // //     $clone.find('.set-link').attr('href',link);
    // //   }
    // //   return this;
    // // },

    // render: function() {
    //   this.$content = this.$sourceWindow.find('.content');
    //   this.$contentWrapper = this.$sourceWindow.find('.content-wrapper');
    //   this.$close = this.$sourceWindow.find('.close');
    //   return this.$sourceWindow;
    // },

  });
  return CountryWindowView;
});
