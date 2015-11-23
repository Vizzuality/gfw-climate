define([
  'mps',
  'backbone',
  'handlebars',
  'widgets/views/WidgetView',
  'text!countries/templates/country-areas-grid.handlebars',
  'text!countries/templates/no-indicators.handlebars'
], function(mps, Backbone, Handlebars, WidgetView, tpl, noIndicatorsTpl) {

  var AreasView = Backbone.View.extend({

    el: '.gridgraphs',

    initialize: function(options) {
      this.iso     = options.country;
      this.areas   = options.areas;
      this.parent  = options.parent;
      this.widgets = options.widgets;

      if (!this.areas || !this.widgets) {
        this.render();
      } else {
        this._setupGrid();
      }
    },

    _setupGrid: function() {

      var promises = [],
        widgetsArray = [];

      _.map(this.widgets, function(j, key) {

        _.map(j, function(w) {

          var currentArea = _.findWhere(this.areas, {id: key});

          var deferred = $.Deferred();
          var newWidget = new WidgetView({
            model: {
              id: w[0].id,
              slug: key,
              location: {
                iso: this.iso,
                jurisdiction: 0,
                area: currentArea.idNumber
              },
            },
            className: 'gridgraphs-widget',
            status: this.widgets[key][w[0].id][0]
          });

          newWidget._loadMetaData(function() {
            deferred.resolve();
          });

          widgetsArray.push(newWidget);
          promises.push(deferred);

        }.bind(this));

      }.bind(this));

      $.when.apply(null, promises).then(function() {
        this.render(widgetsArray);
      }.bind(this));
    },

    render: function(widgetsArray) {
      this.$el.html('');

      this.$el.removeClass();
      this.$el.addClass('gridgraphs -areas')


      if (this.areas && this.areas.length > 0) {

        this.template = Handlebars.compile(tpl);

        this.$el.html(this.template(this.parseData()));

        var data = [];

        var widgetsGroup = _.groupBy(widgetsArray, function(w) {
          return w.presenter.model.attributes.slug;
        });

        this.areas.forEach(function(a, i) {
          data.push({
              areas: a,
              widgets: widgetsGroup[a.id]
          });

        }.bind(this));

        _.each(data, _.bind(function(d) {

          _.each(d.widgets, (function(w) {
            $('#box-areas-' + d.areas.id+ ' .gridgraphs-container').append(w.render().el);
          }));

        }, this));

        this.parent.append(this.$el);
        mps.publish('Grid/ready', [{
          options: {
            view: 'areas',
            areas: this.areas
          }
        }]);


      } else {

        this.template = Handlebars.compile(noIndicatorsTpl);

        var options = {
          isAreas: true
        };

        this.$el.html(this.template({
          setup: options
        }));

        this.parent.append(this.$el);
      }
    },


    parseData: function() {
      return {
        areas: this.areas
      };
    }

  });

  return AreasView;

});
