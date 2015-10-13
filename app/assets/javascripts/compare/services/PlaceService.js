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
    compare1: null,
    compare2: null,
    options: 'eyIxIjp7ImRhdGVfc3RhcnQiOiIyNi8wNy8yMDAwIiwiZGF0ZV9lbmQiOiIyNi8wNy8yMDEyIiwiaWQiOjEsImluZGljYXRvciI6MSwidHJlc2hvbGQiOjI1LCJ1bml0IjoiaGEifSwiMiI6eyJkYXRlX3N0YXJ0IjoiMjYvMDcvMjAwMCIsImRhdGVfZW5kIjoiMjYvMDcvMjAxMiIsImlkIjoyLCJpbmRpY2F0b3IiOjIsInRyZXNob2xkIjoyNSwidW5pdCI6ImhhIn0sIjMiOnsiZGF0ZV9zdGFydCI6IjI2LzA3LzIwMDAiLCJkYXRlX2VuZCI6IjI2LzA3LzIwMTIiLCJpZCI6MywiaW5kaWNhdG9yIjozLCJ0cmVzaG9sZCI6MjUsInVuaXQiOiJoYSJ9LCI0Ijp7ImRhdGVfc3RhcnQiOiIyNi8wNy8yMDAwIiwiZGF0ZV9lbmQiOiIyNi8wNy8yMDEyIiwiaWQiOjQsImluZGljYXRvciI6NCwidHJlc2hvbGQiOjI1LCJ1bml0IjoiaGEifX0='
    // options: {
    //   "1" : {
    //     date_start: "26/07/2000",
    //     date_end: "26/07/2012",
    //     id: 1,
    //     indicator: 1,
    //     treshold: 25,
    //     unit: "ha"
    //   },
    //   "2" : {
    //     date_start: "26/07/2000",
    //     date_end: "26/07/2012",
    //     id: 2,
    //     indicator: 2,
    //     treshold: 25,
    //     unit: "ha"
    //   },
    //   "3" : {
    //     date_start: "26/07/2000",
    //     date_end: "26/07/2012",
    //     id: 3,
    //     indicator: 3,
    //     treshold: 25,
    //     unit: "ha"
    //   },
    //   "4" : {
    //     date_start: "26/07/2000",
    //     date_end: "26/07/2012",
    //     id: 4,
    //     indicator: 4,
    //     treshold: 25,
    //     unit: "ha"
    //   }
    // }

  };

  var PlaceService = PresenterClass.extend({

    _uriTemplate:'{name}{/compare1}{/compare2}{?options}',

    /**
     * Create new PlaceService with supplied Backbone.Router.
     *
     * @param  {Backbond.Router} router Instance of Backbone.Router
     */
    init: function(router) {
      this.router = router;
      this._presenters = [];
      this._name = null;
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
    initPlace: function(name, params) {
      this._name = name;
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
      this.params = this._standardizeParams(params);
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
      p.name = this._name ? this._name : null;

      // We have to develop this with our params
      if (p.compare1) {
        var splitCompare1 = p.compare1.split('+');
        p.compare1 = {
          iso: splitCompare1[0],
          jurisdiction: splitCompare1[1],
          area: splitCompare1[2],
        }
      }
      if (p.compare2) {
        var splitCompare2 = p.compare2.split('+');
        p.compare2 = {
          iso: splitCompare2[0],
          jurisdiction: splitCompare2[1],
          area: splitCompare2[2],
        }
      }

      p.options = (p.options) ? JSON.parse(atob(p.options)) : null;
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
      var p = _.extendNonNull({}, urlDefaultsParams, this.params, params);
      p.name = this._name ? this._name : null;

      // We have to develop this with our params
      if (p.compare1) {
        p.compare1 = p.compare1.iso + '+' + p.compare1.jurisdiction + '+' + p.compare1.area;
      }
      if (p.compare2) {
        p.compare2 = p.compare2.iso + '+' + p.compare2.jurisdiction + '+' + p.compare2.area;
      }

      if (p.options) {
        p.options = btoa(JSON.stringify(p.options));
      }

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
      }, this);

      return p;
    }

  });

  return PlaceService;
});
