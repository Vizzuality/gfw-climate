/**
  PlaceService
 */
define([
  'underscore',
  'mps',
  'uri',
  'embed/presenters/PresenterClass',
], function (_, mps, UriTemplate, PresenterClass) {

  'use strict';

  var urlDefaultsParams = {
    location: null,
    widget: null,
  };

  var PlaceService = PresenterClass.extend({

    _uriTemplate:'{name}{/location}{/widget}',

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
      p.widget = (p.widget) ? parseInt(p.widget) : null;
      p.globalThresh = (p.globalThresh) ? p.globalThresh : 30;

      // We have to develop this with our params
      if (p.location) {
        var location = p.location.split('+');
        p.location = {
          iso: location[0],
          jurisdiction: ~~location[1],
          area: location[2],
        }
      }
      if (p.options) {
        p.options = JSON.parse(atob(p.options));
      }
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
      p.widget = (p.widget) ? parseInt(p.widget) : null;
      p.globalThresh = (p.globalThresh) ? p.globalThresh : 30;

      // We have to develop this with our params
      p.location = (p.location) ? p.location.iso + '+' + p.location.jurisdiction + '+' + p.location.area : null;

      if (p.options) {
        p.options = params.options;
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
