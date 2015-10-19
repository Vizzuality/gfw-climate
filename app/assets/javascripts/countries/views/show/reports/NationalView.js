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
      this.widgets = options.widgets;
      this.countryModel = options.model;
    },

    _getWidgetsId: function() {
      var ids = [];
      _.map(this.widgets, function(w) {
        ids.push(w.id);
      });
      return ids;
    },

    render: function() {
      var widgets = [],
        promises = [],
        widgetsId = this._getWidgetsId();

      this.$el.html(this.template);

      widgetsId.forEach(_.bind(function(id) {

        if (_.has(this.widgets, id)) {

          var deferred = $.Deferred();
          var options =  _.where(this.widgets, {id: id})[0];
          var currentWidget = new WidgetView(options);

          widgets.push(currentWidget);

          currentWidget._loadMetaData(id, function(data) {

            var currentIndicator = _.where(currentWidget.widgetModel.get('indicators'), {default: true}),
              currentTab = _.where(currentWidget.widgetModel.get('tabs'), {default: true });

            options.indicators = currentIndicator[0];
            options.tab = currentTab[0];

            currentWidget.setupView(options);

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
