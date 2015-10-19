define([
  'mps',
  'underscore',
  'countries/presenters/PresenterClass',
  'countries/collections/WidgetCollection'
], function(mps,underscore, PresenterClass, WidgetCollection) {

  'use strict';

  var WidgetGridPresenter = PresenterClass.extend({



    init: function(view) {
      this.view = view;
      this._super();

      this.widgetCollection = new WidgetCollection()

      this.status = new (Backbone.Model.extend({
        defaults: {
          view: 'national'
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
        view: this.status.get('view'),
        widgets: this.status.get('widgets')
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
     * If there is no params from PlaceService, it will be setup
     * with the default ones.
     * @param  {[object]} params
     */
    _setupView: function(params) {
      var gridStatus = params.options ? params.options.gridStatus : null,
        widgetStatus = gridStatus ? gridStatus.widgets : null;

        if (!widgetStatus) {

          var callback = function() {
            this.status.set({
              view: gridStatus ? gridStatus.view : this.status.get('view'),
              widgets: _.where(this.widgetCollection.toJSON(), {default: true})
            });
          };

          this.widgetCollection.fetch().done(callback.bind(this));

        } else {
          this.status.set({
            view: gridStatus ? gridStatus.view : this.status.get('view'),
            widgets: widgetStatus
          });
        }
    },

    _onOpenModal: function() {
      mps.publish('ReportsPanel/open', []);
    },

  });

  return WidgetGridPresenter;

});
