define([
  'backbone',
  'handlebars',
  'views/WidgetView',
  'text!countries/templates/country-national-grid.handlebars'
], function(Backbone, Handlebars, WidgetView, tpl) {

  var NationalView = Backbone.View.extend({

    el: '.reports-grid',

    template: Handlebars.compile(tpl),

    initialize: function(model) {
      this.model = model;
    },

    render: function() {
      var enabledWidgets = this.model.attributes.widgets;

      this.$el.html(this.template);

      enabledWidgets.forEach(_.bind(function(widgetId) {
        this.$el.append(new WidgetView({
          el: this.el,
          id: widgetId
        }).render().el);
      }, this));

      return this;
    }

  });

  return NationalView;

});
