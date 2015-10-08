/**
 * The PlaceService class manages places in the application.
 *
 * A place is just the current state of the application which can be
 * represented as an Object or a URL. For example, the place associated with:
 *
 *   http://localhost:5000/map/6/2/17/ALL/terrain/loss
 *
 * Can also be represented like this:
 *
 *  zoom - 6
 *  lat - 2
 *  lng - 17
 *  iso - ALL
 *  maptype - terrain
 *  baselayers - loss
 *
 * The PlaceService class handles the following use cases:
 *
 * 1) New route updates views
 *
 *   The Router receives a new URL and all application views need to be updated
 *   with the state encoded in the URL.
 *
 *   Here the router publishes the "Place/update" event passing in the route
 *   name and route parameters. The PlaceService handles the event by
 *   standardizing the route parameters and publishing them in a "Place/go"
 *   event. Any presenters listening to the event receives the updated
 *   application state and can update their views.
 *
 * 2) Updated view updates URL
 *
 *   A View state changes (e.g., a new map zoom) and the URL needs to be
 *   updated, not only with its new state, but from the state of all views in
 *   the application that provide state for URLs.
 *
 *   Here presenters publishe the "Place/register" event passing in a
 *   reference to themselves. The PlaceService subscribes to the
 *   "Place/register" event so that it can keep references to all presenters
 *   that provide state. Then the view publishes the "Place/update" event
 *   passing in a "go" parameter. If "go" is false, the PlaceService will
 *   update the URL. Otherwise it will publish the "Place/go" event which will
 *   notify all subscribed presenters.
 *
 * @return {PlaceService} The PlaceService class
 */
define([
  'underscore',
  'mps',
  'uri',
  'compare/presenters/PresenterClass',
], function (_, mps, UriTemplate, PresenterClass) {

  'use strict';

  var urlDefaultsParams = {
    // treshold: 30
  };

  var widgetStatus = {};

  var PlaceService = PresenterClass.extend({

    _uriTemplate: 'countries{/country}{/area}{?options}',

    /**
     * Create new PlaceService with supplied Backbone.Router.
     *
     * @param  {Backbond.Router} router Instance of Backbone.Router
     */
    init: function(router) {
      this.router = router;
      this._presenters = [];
      this.params = {};
      this._super();
    },

    /**
     * Subscribe to application events.
     */
    _subscriptions: [{
      'Place/register': function(presenter) {
        this._presenters = _.union(this._presenters, [presenter]);
      }
    }, {
      'Place/update': function() {
        this._updatePlace();
      }
    }],

    /**
     * Init by the router to set the name
     * and publish the first place.
     *
     * @param  {String} name   Place name
     * @param  {Object} params Url params
     */
    initPlace: function(params) {
      this._newPlace(params);
    },

    /**
     * Silently updates the url from the presenter params.
     */
    _updatePlace: function() {
      var route, params;
      params = this._destandardizeParams(
        this._getPresenterParams(this._presenters));

      route = this._getRoute(params);
      this.router.navigate(route, {silent: true});
    },

    /**
     * Handles a new place.
     *
     * @param  {Object}  params The place parameters
     */
    _newPlace: function(params) {
      var place = {};

      this.params = this._standardizeParams(params);
      console.log('go!')
      mps.publish('Place/go', [this.params]);
    },

    /**
     * Return route URL for supplied route name and route params.
     *
     * @param  {Object} params The route params
     * @return {string} The route URL
     */
    _getRoute: function(param) {
      var url = new UriTemplate(this._uriTemplate).fillFromObject(param);
      return decodeURIComponent(url);
    },

    /**
     * Return standardized representation of supplied params object.
     *
     * @param  {Object} params The params to standardize
     * @return {Object} The standardized params.
     */
    _standardizeParams: function(params) {
      var p = _.extendNonNull({}, urlDefaultsParams, params);

      p.country = p.country ? p.country : null;
      p.area = p.area ? p.area : null;
      p.options = p.options ? JSON.parse(atob(p.options)) : null;

      console.log(p);

      return p;
    },

    /**
     * Return formated URL representation of supplied params object based on
     * a route name.
     *
     * @param  {Object} params Place to standardize
     * @return {Object} Params ready for URL
     */
    _destandardizeParams: function(params) {
      var p = _.extendNonNull({}, this.params, params);

      p.country = p.country ? p.country : null;
      p.area = p.area ? p.area : null;

      var localOptions = {
        view : p.view ? p.view : null,
        widgets: p.widgetStatus ? p.widgetStatus : null,
        treshold: p.treshold ? p.treshold : null
      };

      p.options = btoa(JSON.stringify(localOptions));

      // console.log(p);

      return p;
    },

    /**
     * Return param object representing state from all registered presenters
     * that implement getPlaceParams().
     *
     * @param  {Array} presenters The registered presenters
     * @return {Object} Params representing state from all presenters
     */
    _getPresenterParams: function(presenters) {
      var p = {};

      _.each(presenters, function(presenter) {
        _.extend(p, presenter.getPlaceParams());
        if (p.hasOwnProperty('widgetStatus')) {
          widgetStatus[p.widgetStatus.id] = p.widgetStatus;
        }
      }, this);

      p.widgetStatus = widgetStatus;

      return p;
    }

  });

  return PlaceService;
});
