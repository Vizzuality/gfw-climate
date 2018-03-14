define(['jquery', 'backbone', 'underscore'], function($, Backbone, _) {
  var SourceWindowModel = Backbone.Model.extend({
    defaults: {
      hidden: true
    }
  });

  var sourceWindowView = Backbone.View.extend({
    el: 'body',

    events: {
      'click .close-modal': 'hide'
    },

    initialize: function(options) {
      // Model
      this.model = new SourceWindowModel();

      // Cache
      this._initVars(options);

      // Init
      // this.render();
      this.model.on('change:hidden', this._toggle, this);
    },

    _initVars: function(options) {
      this.$htmlbody = $('html, body');
      this.$window = $(window);
      this.$document = $(document);
      this.$sourceWindow =
        !!options && !!options.sourceWindow
          ? $(options.sourceWindow)
          : $('#window');
      this.$backdrop = $('#backdrop');
      this.mobile = this.$window.width() > 850 ? false : true;
      this.$content = this.$sourceWindow.find('.content');
      this.$contentWrapper = this.$sourceWindow.find('.content-wrapper');
      this.$close = this.$sourceWindow.find('.close');
      this.$body = $('body');
      this.$html = $('html');
    },

    _initBindings: function() {
      this.mobile = this.$window.width() > 850 ? false : true;
      this.scrollTop = this.$document.scrollTop();
      if (this.mobile) {
        this.$htmlbody.addClass('active');
        this.$htmlbody.animate({ scrollTop: this.scrollTop }, 0);
      }
      // document keyup
      this.$document.on(
        'keyup',
        _.bind(function(e) {
          if (e.keyCode === 27) {
            this.hide();
          }
        }, this)
      );
      // backdrop
      this.$backdrop.on(
        'click',
        _.bind(function() {
          this.hide();
        }, this)
      );
    },

    _stopBindings: function() {
      if (this.mobile) {
        this.$htmlbody.removeClass('active');
        this.$htmlbody.animate({ scrollTop: this.scrollTop }, 0);
      }
      this.$document.off('keyup');
      this.$backdrop.off('click');
    },

    _toggle: function() {
      if (this.model.get('hidden') === true) {
        this._stopBindings();
        this.$sourceWindow.removeClass('active iframe');
        this.$backdrop.removeClass('active');
      } else if (this.model.get('hidden') === false) {
        this._initBindings();
        this.$sourceWindow.addClass('active');
        this.$backdrop.addClass('active');
      }
    },

    hide: function(e) {
      e && e.preventDefault();
      this.model.set('hidden', true);

      //Give back scroll beyond modal window.
      this.$body.removeClass('is-no-scroll');
      this.$html.removeClass('is-no-scroll');

      return this;
    },

    show: function(e) {
      e && e.preventDefault() && e.stopPropagation();
      this.model.set('hidden', false);
      this.$contentWrapper.animate({ scrollTop: 0 }, 0);
      var data_slug = $(e.currentTarget).data('source');
      var data_iframe = $(e.currentTarget).data('iframe');
      data_iframe
        ? this.$sourceWindow.addClass('iframe')
        : this.$sourceWindow.removeClass('iframe');

      this.$content.html($('#' + data_slug).clone());

      //Prevent scroll beyond modal window.
      this.$body.addClass('is-no-scroll');
      this.$html.addClass('is-no-scroll');

      return this;
    }

    // render: function() {
    //   this.$content = this.$sourceWindow.find('.content');
    //   this.$contentWrapper = this.$sourceWindow.find('.content-wrapper');
    //   this.$close = this.$sourceWindow.find('.close');
    //   return this.$sourceWindow;
    // }
  });

  return sourceWindowView;
});
