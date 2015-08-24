define([
  'backbone',
  'handlebars',
  'text!countries/templates/country-widget.handlebars'
], function(Backbone, Handlebars, tpl) {

  'use strict';

  var WidgetView = Backbone.View.extend({

    template: Handlebars.compile(tpl),

    events: {
      'click #delete' : '_delete',
      'click #info'   : '_info',
      'click #share'  : '_share'
    },

    initialize: function() {

    },

    _delete: function() {
      $(this).remove();
    },

    _info: function() {},

    _share: function() {},

    render: function() {
      return this.$el.html(this.template({id: this.id}));
    }

  });

  return WidgetView;

});
