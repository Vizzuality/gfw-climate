define([
  'backbone',
  'handlebars',
  'text!countries/templates/country-areas-grid.handlebars',
  'text!countries/templates/no-indicators.handlebars'
], function(Backbone, Handlebars, tpl, noIndicatorsTpl) {

  var AreasView = Backbone.View.extend({

    el: '.gridgraphs--container-profile',

    initialize: function(options) {
      this.widgets = options.widgets;
      this.areas = options.areas;
    },

    render: function() {
      this.$el.html('');

      if (this.areas && this.areas.length > 0) {

        this.template = Handlebars.compile(tpl);

        this.$el.html(this.template);

        this.widgets.forEach(_.bind(function(widget) {
          widget.render()
          this.$el.addClass('.areas-grid').append(widget.el);
        }, this));

      } else {

        this.template = Handlebars.compile(noIndicatorsTpl);

        var options = {
          isAreas: true
        };

        this.$el.html(this.template({
          setup: options
        }));
      }

      return this;
    }

  });

  return AreasView;

});
