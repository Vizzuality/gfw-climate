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

      var promises = [],
        widgets = [];

      enabledWidgets.forEach(_.bind(function(widgetId) {
        var deferred = $.Deferred();
        var currentWidget = new WidgetView({wid: widgetId});

        widgets.push(currentWidget);
        currentWidget._loadMetaData(function(data) {
          deferred.resolve(data);
        });

        promises.push(deferred);
      }, this));

      var self = this;

      $.when.apply(null, promises).then(function() {
        widgets.forEach(function(widget) {
          widget.render();
          self.$el.append(widget.el);
        });
      });

      return this;
    }

  });

  return NationalView;

});
