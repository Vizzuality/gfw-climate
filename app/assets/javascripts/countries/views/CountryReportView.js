define([
  'backbone',
  'text!countries/templates/countryReport.handlebars',
], function(
  Backbone,
  tpl
) {
  'use strict';

  var CountryReportView = Backbone.View.extend({

    el: '#report',

    template: Handlebars.compile(tpl),

    initialize: function() {
      this.render();
    },

    render: function() {
      this.$el.removeClass('is-loading');
      this.$el.html(this.template({}));
    }

  });

  return CountryReportView;
});
