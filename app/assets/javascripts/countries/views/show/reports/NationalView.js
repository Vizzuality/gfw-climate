define([
  'mps',
  'backbone',
  'handlebars',
  'widgets/views/WidgetView',
  'text!countries/templates/country-national-grid.handlebars',
], function(mps, Backbone, Handlebars, WidgetView, tpl) {

  var NationalView = Backbone.View.extend({

    el: '.gridgraphs',

    template: Handlebars.compile(tpl),

    initialize: function(options) {
      this.iso     = options.country;
      this.parent  = options.parent;
      this.widgets = options.status.widgets;


      this._setupGrid();
    },

    _setupGrid: function() {
      var promises = [];


      if (!!this.activeWidgets && !!this.activeWidgets.length) {
        this.destroy();
      };

      this.activeWidgets = [];


      _.map(this.widgets[this.iso], function(w, key) {

          var deferred = $.Deferred();
          var newWidget = new WidgetView({
            model: {
              id: w[0].id,
              slug: this.iso,
              location: {
                iso: this.iso,
                jurisdiction: 0,
                area: 0
              },
            },
            className: 'gridgraphs-widget',
            status: this.widgets[this.iso][w[0].id][0]
          });

          newWidget._loadMetaData(function() {
            deferred.resolve();
          });

          this.activeWidgets.push(newWidget);
          promises.push(deferred);

      }.bind(this));

      $.when.apply(null, promises).then(function() {
        this.render(this.activeWidgets);
        mps.publish('Grid/ready', [{
          iso: this.iso,
          options: {
            view: 'national'
          }
        }]);

      }.bind(this));
    },

    destroy: function() {
      this.activeWidgets.forEach(function(widget) {
        widget.destroy();
      });
    },

    render: function(widgetsArray) {
      this.$el.html('');

      this.$el.removeClass();
      this.$el.addClass('gridgraphs -national');

      this.$el.html(this.template);

      widgetsArray.forEach(function(widget) {
        this.$el.find('.gridgraphs-container').append(widget.render().el);
      }.bind(this));

      this.parent.append(this.el);
    }

  });

  return NationalView;

});
