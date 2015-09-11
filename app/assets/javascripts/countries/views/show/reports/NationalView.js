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
      console.log('render national');
      var enabledWidgets = this.model.attributes.widgets;

      this.$el.html(this.template);

      enabledWidgets.forEach(_.bind(function(widget, i) {
        this.$el.find('.national').html(new WidgetView({id: widget}).render());
      }, this));

      return this.$el.html();
    }

  });

  return NationalView;

});
