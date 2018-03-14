define(
  [
    'backbone',
    'handlebars',
    'embed/presenters/EmbedCountryHeaderPresenter',
    'text!embed/templates/embed-country-header.handlebars'
  ],
  function(Backbone, Handlebars, Presenter, tpl) {
    'use strict';

    var EmbedCountryHeaderView = Backbone.View.extend({
      el: '#embedHeader',

      template: Handlebars.compile(tpl),

      initialize: function() {
        this.presenter = new Presenter(this);
      },

      render: function() {
        this.$el.html(this.template(this.presenter.status.toJSON()));
      }
    });

    return EmbedCountryHeaderView;
  }
);
