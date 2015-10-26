define([
  'backbone',
  'handlebars',
  'widgets/views/WidgetView',
  'text!countries/templates/country-subnational-grid.handlebars',
  'text!countries/templates/no-indicators.handlebars'
], function(Backbone, Handlebars, WidgetView, tpl, noIndicatorsTpl) {

  var SubNationalView = Backbone.View.extend({

    el: '.gridgraphs--container',

    initialize: function(options) {
      this.widgets = options.widgets;
      this.jurisdictions = options.jurisdictions;
    },

    render: function() {
      this.$el.html('');

      if (this.jurisdictions && this.jurisdictions.length > 0) {

        this.template = Handlebars.compile(tpl);

        this.$el.html(this.template);

        this.widgets.forEach(_.bind(function(widget) {
          widget.render()
          this.$el.addClass('.subnational-grid').append(widget.el);
        }, this));


      } else {

        this.template = Handlebars.compile(noIndicatorsTpl);

        var options = {
          isJurisdictions: true
        };

        this.$el.html(this.template({
          setup: options
        }));

      }

      return this;
    }

  });

  return SubNationalView;

});
