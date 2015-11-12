define([
  'backbone',
  'mps',
  'compare/presenters/PresenterClass',
  'widgets/collections/WidgetCollection',
], function(Backbone, mps, PresenterClass, WidgetCollection) {

  'use strict';

  var CompareSelectorsPresenter = PresenterClass.extend({

    status: new (Backbone.Model.extend({})),

    init: function(view) {
      this._super();
      this.view = view;
    },

    /**
     * Application subscriptions.
     */
    _subscriptions: [{
      'Widgets/update': function(widgets) {
        this.status.set('widgetsActive',widgets);
        if (!!this.status.get('widgets')) {
          this.view.render();
          this.view.setWidgetsStatus();
        } else {
          new WidgetCollection()
            .fetch()
            .done(_.bind(function(response){
              this.status.set('widgets',response.widgets)
              this.view.render();
              this.view.setWidgetsStatus();
            }, this ));
        }
      },

      'CompareWidgetsModal/show': function(tab) {
        this.view.show();
      }
    }],


    changeActiveWidgets: function(widgetId,remove) {
      var widgets = _.clone(this.status.get('widgetsActive'));
      (remove) ? widgets = _.without(widgets,widgetId.toString()) : widgets.push(widgetId.toString());
      this.status.set('widgetsActive', widgets);
      this.view.setWidgetsStatus();
    },

    setActiveWidgets: function() {
      mps.publish('Widgets/change', [this.status.get('widgetsActive')]);
    }

  });

  return CompareSelectorsPresenter;

});
