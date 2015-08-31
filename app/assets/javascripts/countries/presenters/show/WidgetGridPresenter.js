define([
  'mps',
  'countries/presenters/PresenterClass'
], function(mps, PresenterClass) {

  var WidgetGridPresenter = PresenterClass.extend({

    init: function(view) {
      this._super();
      this.view = view;
    },

    _subscriptions: [{
      'WidgetGrid/render':function(widgets) {
        this.view.renderWidgets(widgets);
      }
    }],

  });

  return WidgetGridPresenter;

});
