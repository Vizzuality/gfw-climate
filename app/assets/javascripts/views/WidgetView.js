define([
  'backbone',
  'handlebars',
  'text!countries/templates/country-widget.handlebars'
], function(Backbone, Handlebars, tpl) {

  'use strict';

  var WidgetView = Backbone.View.extend({

    el: '#reports',

    template: Handlebars.compile(tpl),

    events: {
      'click .close' : '_close',
      'click #info'   : '_info',
      'click #share'  : '_share'
    },

    initialize: function() {

    },

    _close: function(e) {
      e && e.preventDefault();
      this.$el.remove();
    },

    _info: function() {},

    _share: function() {},

    render: function() {
      $(this.el).html(this.template({id: this.id}));
      return this;
    }

  });

  return WidgetView;

});
