define([
  'mps',
  'underscore',
  'countries/presenters/PresenterClass'
], function(mps,underscore, PresenterClass) {

  'use strict';

  var WidgetGridPresenter = PresenterClass.extend({

    init: function(view) {
      this.view = view;
      this._super();

      this.status = new (Backbone.Model.extend({
        defaults: {
          view: 'national',
          widgets: [1, 2]
        }
      }));

      mps.publish('Place/register', [this]);
    },

    /**
     * Application subscriptions.
     */
    _subscriptions: [{
      'Place/go': function(place) {
        this._onPlaceGo(place);
      }
    }, {
      'CountryModel/Fetch': function(countryModel) {
        this.view.start(countryModel);
      }
    }],

    /**
     * Used by PlaceService to get the current iso/area params.
     *
     * @return {object} iso/area params
     */
    getPlaceParams: function() {
      var p = {};

      p.widgetGridStatus = {
        view: this.status.attributes.view,
        wiggets: this.status.attributes.widgets
      };

      return p;
    },

    /**
     * Triggered from 'Place/Go' events.
     *
     * @param  {Object} place PlaceService's place object
     */
    _onPlaceGo: function(place) {
      this._setupView(place);
    },

    /**
     * Get the keys (widget's id) from an object
     * @param  {[object]} widgets
     * @return {[array]} array with widget's id will be displayed
     */
    _getWidgetsIds: function(widgets) {
      return _.keys(widgets);
    },

    /**
     * Setup the view with the params coming from PlaceService.
     * If there is no params from PlaceSerice, it will be setup
     * with the default ones.
     * @param  {[object]} params
     */
    _setupView: function(params) {
      var options = params.options;

      this.status.set({
        view: options && options.view ? options.view : this.status.attributes.view,
        widgets: options && options.widgets ? this._getWidgetsIds(options.widgets) : this.status.attributes.widgets
      });
    },

    _onOpenModal: function() {
      mps.publish('ReportsPanel/open', []);
    },

  });

  return WidgetGridPresenter;

});
