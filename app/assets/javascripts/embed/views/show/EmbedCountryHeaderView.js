define([
  'backbone',
  'embed/presenters/EmbedCountryHeaderPresenter',
  'widgets/views/WidgetView',
], function(Backbone, Presenter, WidgetView) {
  'use strict';

  var EmbedCountryHeaderView = Backbone.View.extend({

    el: '#embedHeader',

    initialize: function() {
      this.presenter = new Presenter(this);
    },

    render: function() {
      console.log('render');
    }

  });

  return EmbedCountryHeaderView;

});