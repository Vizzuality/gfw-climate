define(
  [
    'backbone',
    'embed/presenters/EmbedCountryPresenter',
    'widgets/views/WidgetView'
  ],
  function(Backbone, Presenter, WidgetView) {
    'use strict';

    var EmbedCountryView = Backbone.View.extend({
      el: '#embedWidget',

      initialize: function() {
        this.presenter = new Presenter(this);
      },

      render: function() {
        // Set variables
        var widgetId = this.presenter.status.get('widget');
        var location = this.presenter.status.get('location');
        var slugw = this.presenter.objToSlug(location, '');
        var status = this.presenter.status.get('options')[slugw][widgetId][0];

        var widgetView = new WidgetView({
          id: widgetId,
          className: 'gridgraphs--widget',
          model: {
            id: widgetId,
            slugw: slugw,
            location: location
          },
          status: status
        });

        // Trigger widget load
        widgetView._loadMetaData(
          function(data) {
            widgetView.render();
            this.$el.append(widgetView.el);
          }.bind(this)
        );
      }
    });

    return EmbedCountryView;
  }
);
