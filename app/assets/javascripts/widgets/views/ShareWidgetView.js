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
      // 'click #share_field' : '_selectTarget',
      // 'click .change-type' : '_setTypeFromEvent',
      // 'click #preview' : '_showPreview',
      // 'click .share-sozial a' : '_shareToSocial',
      // 'click .overlay' : 'hide',
      // 'click .copy_url' : '_copyToClipboard'
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

    // UI EVENTS
    changeType: function(e) {
      e && e.preventDefault()
      this.model.set('type', $(e.currentTarget).data('type'));
    },


    // LINK
    setUrlLink: function() {
      this.getBitlyLink(window.location.href, function(url) {
        this.model.set('url', url);
        // this.$input.val(url);
        // this.$twitterLink.attr('href', 'https://twitter.com/share?url=' + url);
        // this.$facebookLink.attr('href', 'https://www.facebook.com/sharer.php?u=' + url);
        // this.$google_plusLink.attr('href', 'https://plus.google.com/share?url=' + url);
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
      console.log(this.model.get('slugshare'));
      var width = 600;
      var height = 600;
      var url = '';
      return '<iframe width="' +width+ '" height="' +height+ '" frameborder="0" src="' + url + '"></iframe>';
    }

    // _renderEmbed: function() {
    //   this.$input.val(this._generateEmbedSrc());

    //   this.$shareinfo.html('Click and paste HTML to embed in website.');
    //   // Only show preview on desktop, mobile preview is quite fiddly
    //   // for the user
    //   if (!this._isMobile()) {
    //     this.$shareinfo.append('<button id="preview" class="btn gray little uppercase">Preview</button></p>');
    //   }

    //   ga('send', 'event', 'Map', 'Share', 'Share Embed clicked');
    // },

    // _generateEmbedSrc: function() {
    //   var dim_x = this.model.get('embedWidth') || 600, dim_y = this.model.get('embedHeight') || 600;
    //   return '<iframe width="' +dim_x+ '" height="' +dim_y+ '" frameborder="0" src="' + this.model.get('embedUrl') + '"></iframe>';
    // },

    // _setUrlsFromEvent: function(event) {
    //   var hideEmbed = $(event.currentTarget).data('hideembed');
    //   this.model.set('hideEmbed', !!hideEmbed);
    //   this.render();

    //   var url = $(event.currentTarget).data('share-url') || window.location.href;
    //   this.model.set('url', url);

    //   var embedUrl = $(event.currentTarget).data('share-embed-url') || window.location.origin + '/embed' + window.location.pathname + window.location.search;
    //   this.model.set('embedUrl', embedUrl);
    //   this.model.set('embedWidth', $(event.currentTarget).data('share-embed-width'));
    //   this.model.set('embedHeight', $(event.currentTarget).data('share-embed-height'));



    // },

    // _setTypeFromEvent: function(event) {
    //   this.$copy.html('copy')
    //   var target_type = $(event.currentTarget).data('type');
    //   var type = target_type || this.model.get('type') || 'link';
    //   this.model.set('type', type);
    // },

    // _toggleTypeButtons: function() {
    //   this.$changeType.toggleClass('blue').toggleClass('gray');
    //   this._renderInput();
    // },

    // _selectTarget: function(e) {
    //   $(e.currentTarget).select();
    // },

    // _copyToClipboard: function(e) {
    //   var url = document.querySelector('#share_field');
    //   url.select();

    //   try {
    //     var successful = document.execCommand('copy');
    //     $(e.currentTarget).html('copied')
    //   } catch(err) {
    //     mps.publish('Notification/open', ['not-clipboard-support']);
    //   }
    // },

    // _showPreview: function() {
    //   this.iframeView = ne({
    //     src: this.model.get('embedUrl'),
    //     width: this.model.get('embedWidth'),
    //     height: this.model.get('embedHeight'),
    //   });

    //   $('body').append(this.iframeView.render().$el);
    // },

    // _shareToSocial: function(e) {
    //   e && e.preventDefault();

    //   var width  = 575,
    //       height = 400,
    //       left   = ($(window).width()  - width)  / 2,
    //       top    = ($(window).height() - height) / 2,
    //       url    = $(e.currentTarget).attr('href'),
    //       opts   = 'status=1' +
    //                ',width='  + width  +
    //                ',height=' + height +
    //                ',top='    + top    +
    //                ',left='   + left;

    //   window.open(url, 'Share this map view', opts);
    // },

    // _isMobile: function() {
    //   return ($(window).width() > 850) ? false : true;
    // }
  });

  return ShareWidgetView;

});
