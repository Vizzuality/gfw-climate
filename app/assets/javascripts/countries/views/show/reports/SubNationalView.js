define([
  'mps',
  'backbone',
  'handlebars',
  'widgets/views/WidgetView',
  'text!countries/templates/country-subnational-grid.handlebars',
  'text!countries/templates/no-indicators.handlebars'
], function(mps, Backbone, Handlebars, WidgetView, tpl, noIndicatorsTpl) {

  var SubNationalView = Backbone.View.extend({

    el: '.gridgraphs',

    initialize: function(options) {
      this.iso           = options.country;
      this.jurisdictions = options.jurisdictions;
      this.parent        = options.parent;
      this.widgets       = options.widgets;


      if (!this.jurisdictions || !this.widgets) {
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

          var currentJurisdiction = _.findWhere(this.jurisdictions, {id: key});

          var deferred = $.Deferred();
          var newWidget = new WidgetView({
            model: {
              id: w[0].id,
              slugw: key,
              jur_slug: key,
              location: {
                iso: this.iso,
                jurisdiction: currentJurisdiction.idNumber,
                area: 0
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
      this.activeWidgets = widgetsArray;
      this.$el.html('');

      this.$el.removeClass();
      this.$el.addClass('gridgraphs -subnational');

      if (this.jurisdictions && this.jurisdictions.length > 0  && this.widgets) {

        this.template = Handlebars.compile(tpl);

        this.$el.html(this.template(this.parseData()));

        var data = [];

        var widgetsGroup = _.groupBy(widgetsArray, function(w) {
          return w.presenter.model.attributes.jur_slug;
        });

        this.jurisdictions.forEach(function(j, i) {
          data.push({
              jurisdiction: j,
              widgets: widgetsGroup[j.id]
          });

        }.bind(this));

        _.each(data, _.bind(function(d) {
          _.each(d.widgets, (function(w) {
            $('#box-jurisdictions-' + d.jurisdiction.id+ ' .gridgraphs-container').append(w.render().el);
          }));

        }, this));

        this.parent.append(this.$el);
        mps.publish('Grid/ready', [{
          options: {
            view: 'subnational',
            jurisdictions: this.jurisdictions
          }
        }]);

      } else {

        this.template = Handlebars.compile(noIndicatorsTpl);

        var options = {
          isJurisdictions: true
        };

        this.$el.html(this.template({
          setup: options
        }));

        this.parent.append(this.$el);
      }
    },

    parseData: function() {
      return {
        jurisdictions: this.jurisdictions
      };
    },

    destroy: function() {
      if (this.activeWidgets) {
        this.activeWidgets.forEach(function(widget) {
          widget.destroy();
        });
      }
    }

  });

  return SubNationalView;

});
