define([
  'backbone',
  'widgets/views/WidgetView'
], function(Backbone, WidgetView) {

  var NationalView = Backbone.View.extend({

    el: '.gridgraphs--container-profile',

    initialize: function(options) {
      this.parent = options.parent;

      this.widgets = options.status;
      this._setupGrid();
    },

    _setupGrid: function() {
      var promises = [],
        widgetsArray = [],
        iso = sessionStorage.getItem('countryIso');

      _.map(this.widgets[iso], function(w, key) {

          var deferred = $.Deferred();
          var newWidget = new WidgetView({
            model: {
              id: w[0].id,
              slug: iso,
              location: {
                iso: iso,
                jurisdiction: 0,
                area: 0
              },
            },
            className: 'gridgraphs--widget',
            status: this.widgets[iso][w[0].id][0]
          });

          newWidget._loadMetaData(function() {
            deferred.resolve();
          });

          widgetsArray.push(newWidget);
          promises.push(deferred);

      }.bind(this));

      $.when.apply(null, promises).then(function() {
        this.render(widgetsArray);
      }.bind(this));
    },

    render: function(widgetsArray) {
      this.$el.html('');

      widgetsArray.forEach(function(widget) {
        widget.render();
        this.$el.addClass('national-grid').append(widget.el);
      }.bind(this));

      this.parent.append(this.el);

      // return this;
    }

  });

  return NationalView;

});
