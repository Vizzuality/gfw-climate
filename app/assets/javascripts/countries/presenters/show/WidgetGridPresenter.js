define([
  'mps',
  'underscore',
  'countries/presenters/PresenterClass'
], function(mps, _, PresenterClass) {

  var WidgetGridPresenter = PresenterClass.extend({

    init: function(view) {
      this._super();
      this.view = view;
    },

    _subscriptions: [{
      'Widgets/render': function(widgets) {
        this.view._setWidgets(widgets);
      }
    }, {
      'CountryHeader/switchDisplay': function(display) {
        this.view._setDisplay(display);
      }
    }],

    _onOpenModal: function() {
      mps.publish('ReportsPanel/open', []);
    },

  });

  return WidgetGridPresenter;

});
