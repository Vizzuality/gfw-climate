/**
 * The ShareWidgetView selector view.
 *
 * @return ShareWidgetView instance (extends Backbone.View).
 */
define([
  'backbone',
  'underscore',
  'handlebars',
  'mps',
  'text!templates/share-widget.handlebars',
  'widgets/presenters/ShareWidgetPresenter',  
], function(Backbonoe,_, Handlebars, mps, tpl, Presenter) {

  'use strict';

  var ShareModel = Backbone.Model.extend({
    defaults: {
      hidden: true,
      type: 'link',
      url: null,
      widget: null
    }
  });

  var ShareWidgetView = Backbone.View.extend({
    el: '#shareWidgetView',

    className: 'share-modal mini-modal',

    template: Handlebars.compile(tpl),

    events: {
      'click .js-close-share' : 'hide',
      'click .js-type-share' : 'changeType',
      'click .js-copy-share' : 'copyUrl',
      'focus .js-input-share' : 'selectUrl',
      'click .js-social-share' : 'openPopup',     
      // 'click #preview' : '_showPreview',

    },

    initialize: function(parent) {
      this.presenter = new Presenter();
      this.model = new ShareModel();
      this.render();
      this.listeners();
    },


    // Render & cache & listeners //
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.cache();
      this.setOptions()
    },

    cache: function() {
      this.$body = $('body');
      this.$input = this.$el.find('#share-field');

      // Social links
      this.$twitterLink = this.$('.twitter');
      this.$facebookLink = this.$('.facebook');
      this.$googleplusLink = this.$('.google_plus');

    },

    listeners: function() {
      this.model.on('change:hidden', this.toggle, this);
      this.model.on('change:type', this.render, this);
      this.model.on('change:url', this.setInput, this);

      // Everytime we click inside an .js-open-share we will show the modal
      this.$body.on('click', '.js-open-share', _.bind(this.show, this ));
    },

    
    // Show, hide and toggle //
    show: function(e) {
      this.model.set('widget', $(e.currentTarget).data('widget'));
      this.model.set('slugshare', $(e.currentTarget).data('slugshare'));
      this.model.set('hidden', false);
    },

    hide: function() {
      this.model.set('hidden', true);
      this.model.set('type', 'link');

    },

    toggle: function() {
      var is_hidden = this.model.get('hidden');
     
      if (is_hidden) {
        this.$el.hide(0);
        this.unbindings();
      } else {
        this.$el.show(0);
        this.bindings(); 
      }
    },

    
    // Bindings //
    bindings: function() {
      $(document).on('keyup.share', function(e){
        if (e.keyCode === 27) {
          this.hide();
        }
      }.bind(this));
    },

    unbindings: function() {
      $(document).off('keyup.share');
    },

    // SETTERS
    // Set options
    setOptions: function(e) {
      console.log('We should set the url of embed and link, open the modal, get the options param');
      this.setUrl(e);      
    },


    setUrl: function(e) {
      switch(this.model.get('type')){
        case 'link':
          this.setUrlLink();
        break;
        case 'embed':
          this.setUrlEmbed(e);
        break;
      }
    },

    setInput: function() {
      this.$input.val(this.model.get('url'));
    },

    // LINK
    setUrlLink: function() {
      this.getBitlyLink(window.location.href, function(url) {
        this.model.set('url', url);
        this.setSocialLinks();
      }.bind(this));
      ga('send', 'event', 'Map', 'Share', 'Share Link clicked');
    },

    getBitlyLink: function(url, callback) {
      $.ajax({
        url: 'https://api-ssl.bitly.com/v3/shorten?longUrl=' + encodeURIComponent(url) + '&login=simbiotica&apiKey=R_33ced8db36b545829eefeb644f4c3d19',
        type: 'GET',
        async: false,
        dataType: 'jsonp',
        success: function(r) {
          if (!r.data.url) {
            callback && callback(url);

            throw new Error('BITLY doesn\'t allow localhost alone as domain, use localhost.lan for example');
          } else {
            callback && callback(r.data.url);
          }
        },
        error: function() {
          callback && callback(url);
        }
      });      
    },

    // EMBED
    setUrlEmbed: function(e) {
      var url = this.getEmbedLink();
      this.model.set('url', url);
    },

    getEmbedLink: function() {
      var width = 600;
      var height = 600;
      var url = window.location.protocol + '//' + window.location.host + '/embed/countries/'+ this.model.get('slugshare') +'/'+ this.model.get('widget');
      return '<iframe width="' +width+ '" height="' +height+ '" frameborder="0" src="' + url + '"></iframe>';
    },

    // SOCIAL
    setSocialLinks: function() {
      this.$twitterLink.attr('href', 'https://twitter.com/share?url=' + this.model.get('url'));
      this.$facebookLink.attr('href', 'https://www.facebook.com/sharer.php?u=' + this.model.get('url'));
      this.$googleplusLink.attr('href', 'https://plus.google.com/share?url=' + this.model.get('url'));
    },

    
    // UI EVENTS
    changeType: function(e) {
      e && e.preventDefault()
      this.model.set('type', $(e.currentTarget).data('type'));
    },

    copyUrl: function(e) {
      this.$input.select();
      try {
        var successful = document.execCommand('copy');
        $(e.currentTarget).html('copied')
      } catch(err) {
        mps.publish('Notification/open', ['not-clipboard-support']);
      }
    },

    selectUrl: function(e) {
      this.$input.select();
    },

    openPopup: function(e) {
      e && e.preventDefault();

      var width  = 575,
          height = 400,
          left   = ($(window).width()  - width)  / 2,
          top    = ($(window).height() - height) / 2,
          url    = $(e.currentTarget).attr('href'),
          opts   = 'status=1' +
                   ',width='  + width  +
                   ',height=' + height +
                   ',top='    + top    +
                   ',left='   + left;

      window.open(url, 'Share this map view', opts);
    },

    // _showPreview: function() {
    //   this.iframeView = ne({
    //     src: this.model.get('embedUrl'),
    //     width: this.model.get('embedWidth'),
    //     height: this.model.get('embedHeight'),
    //   });

    //   $('body').append(this.iframeView.render().$el);
    // },


    // _isMobile: function() {
    //   return ($(window).width() > 850) ? false : true;
    // }
  });

  return ShareWidgetView;

});
