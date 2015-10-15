define([
  'backbone',
  'handlebars',
  'underscore',
  'views/WidgetView',
  'text!countries/templates/country-national-grid.handlebars'
], function(Backbone, Handlebars, _, WidgetView, tpl) {

  var NationalView = Backbone.View.extend({

    el: '.reports-grid',

    template: Handlebars.compile(tpl),

    initialize: function(options) {
      console.log(options)
      this.widgets = options.widgets;
      this.countryModel = options.model;
    },

    _getWidgetsId: function() {
      return _.keys(this.widgets);
    },

    render: function() {
      var widgets = [],
        promises = [],
        widgetsId = this._getWidgetsId();

      this.$el.html(this.template);

      widgetsId.forEach(_.bind(function(id) {

        if (_.has(this.widgets, id)) {

          var deferred = $.Deferred();
          var currentWidget = new WidgetView({
            id: id,
            options: this.widgets[id]
          });

          widgets.push(currentWidget);

          currentWidget._loadMetaData(function(data) {
            deferred.resolve(data);
          });

          promises.push(deferred);
        }

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
