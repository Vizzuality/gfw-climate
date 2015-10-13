define([
  'backbone',
  'handlebars',
  'views/WidgetView',
  'text!countries/templates/country-national-grid.handlebars'
], function(Backbone, Handlebars, WidgetView, tpl) {

  var NationalView = Backbone.View.extend({

    el: '.reports-grid',

    template: Handlebars.compile(tpl),

    initialize: function(options) {
      this.widgets = options.widgets;
      this.countryModel = options.model;
    },

    render: function() {
      this.$el.html(this.template);

      var promises = [],
        widgets = [];

      this.widgets.forEach(_.bind(function(id) {
        var deferred = $.Deferred();
        var currentWidget = new WidgetView({id: id});

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
