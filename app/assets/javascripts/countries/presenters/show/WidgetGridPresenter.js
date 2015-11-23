define([
  'mps',
  'underscore',
  'countries/presenters/PresenterClass',
  'widgets/collections/WidgetCollection'
], function(mps, _, PresenterClass, WidgetCollection) {

  'use strict';

  var WidgetGridPresenter = PresenterClass.extend({

    init: function(view) {
      this.view = view;
      this._super();

      this.widgetCollection = new WidgetCollection()

      this.status = new (Backbone.Model.extend({
        defaults: {
          globalThresh: 30
        }
      }));

      this._setListeners();

      mps.publish('Place/register', [this]);
    },

    /**
     * Application subscriptions.
     */
    _subscriptions: [{
      'Place/go': function(place) {
        this._onPlaceGo(place);
      }
    },{
      'Options/updated': function(id,slug,wstatus) {
        this._onOptionsUpdate(id,slug,wstatus);
      }
    }, {
      'View/update': function(view) {
        var p = {
          view: view
        }

        this._updateView(view);

        if (view === 'national') {

          var p = {
            view: view
          }

          var callback = function() {
            this.status.set({
              country: this.status.get('country'),
              jurisdictions: null,
              areas: null,
              view: view,
              options: this.getOptions(null, p)
            });

            this.view.start();
          }

          this.widgetCollection.fetch({default: true}).done(callback.bind(this));
        }

        if (view === 'subnational' || view === 'areas-interest') {

          this.status.set({
            country: this.status.get('country'),
            jurisdictions: null,
            areas: null,
            view: view,
            options: {}
          });
          this.view.start();
        }
      }
    }, {
      'Grid/update': function(params) {
        var p = jQuery.extend({}, params)

        var callback = function() {
          this.status.set({
            areas: params.areas,
            view: params.view,
            jurisdictions: params.jurisdictions,
            options: this.getOptions(p.options.indicators, p)
          });

          this.view.start();
        };

        this.widgetCollection.fetch({default: true}).done(callback.bind(this));
      }
    }],

    _setListeners: function() {
      this.status.on('change', function() {
        mps.publish('Place/update', []);
      }, this);
    },

    /**
     * Used by PlaceService to get the current iso/area params.
     *
     * @return {object} iso/area params
     */
    getPlaceParams: function() {
      var p = {};

      p.options = this.status.get('options');

      p.options.areas =  this.status.get('jurisdictions') ? null : this.status.get('areas');
      p.options.jurisdictions = this.status.get('areas') ? null : this.status.get('jurisdictions');

      _.extend(p.options, {
        view: this.status.get('view')
      });

      return p;
    },

    /**
     * Triggered from 'Place/Go' events.
     *
     * @param  {Object} place PlaceService's place object
     */
    _onPlaceGo: function(params) {
      switch(params.view) {
        case 'national':
          if (params.options) {
            this._loadCustomizedOptions(params);
          } else {
            this._loadDefaultOptions(params);
          }

          break;

        case 'subnational':

          if (params.options) {
            this._loadCustomizedOptions(params);
          } else {

            this.status.set({
              country: params.country.iso,
              view: params.view,
              areas: null,
              jurisdictions: null,
              options: {}
            });
            this.view.start()

            mps.publish('Tab/update', [{
              view: this.status.get('view'),
              silent: true
            }]);
          }

          break;

        case 'areas-interest':

          if (params.options) {
            this._loadCustomizedOptions(params);
          } else {
            this.status.set({
              country: params.country.iso,
              view: params.view,
              areas: null,
              jurisdictions: null,
              options: {}
            });

            this.view.start();
            mps.publish('Tab/update', [this.status.get('view')]);
          }

          break;

        default:
          this._loadDefaultOptions(params);
          break;
      }
    },

    /**
     * Setup the view with the params coming from PlaceService.
     * If there is no params from PlaceService, it will be setup
     * with the default ones.
     * @param  {[object]} params
     */

    _loadDefaultOptions: function(params) {
      var callback = function() {
        this.status.set({
          country: params.country.iso,
          jurisdictions: null,
          areas: null,
          view: params.view,
          options: this.getOptions(null, params)
        });

        this.view.start();
        mps.publish('Tab/update', [this.status.get('view')])
      };

      this.widgetCollection.fetch({default: true}).done(callback.bind(this));
    },

    _loadCustomizedOptions: function(params) {
      this.status.set({
        country: params.country.iso,
        jurisdictions: params.jurisdictions ? params.jurisdictions :  this.getJurisdictions(params),
        areas: params.areas ? params.areas : this.getAreas(params),
        options: params.options,
        view: params.view
      });

      this.view.start();

      mps.publish('Tab/update', [{
        view: this.status.get('view'),
        silent: true
      }]);
    },

    _updateView: function(view) {
      this.status.set({
        view: view
      }, {silent: true});
    },

    _onOptionsUpdate: function(id,slug,wstatus) {
      var options = _.clone(this.status.get('options').widgets);
      options[slug][id][0] = wstatus;

      var x = {};
      x[slug] = options[slug];


      // Set and publish
      // this.status.set('options', options);
      _.extend(this.status.get('options'), x);
      mps.publish('Place/update');
    },

    getJurisdictions: function(params) {

      var jurisdictions = null;

      if (params.options.hasOwnProperty('jurisdictions') &&
        params.options.jurisdictions !== null) {
        jurisdictions = params.options.jurisdictions;
      }

      return jurisdictions;
    },

    getAreas: function(params) {

      var areas = null;

      if (params.options.hasOwnProperty('areas') &&
        params.options.areas !== null) {
        areas = params.options.areas;
      }

      return areas;
    },

    getOptions: function(widgets, params) {

      var defaultWidgets = this.widgetCollection.toJSON(),
        activeWidgets;

      if (!widgets) {
        activeWidgets = [1, 2, 3, 4, 5, 6];
      } else {
        activeWidgets = widgets;
      }

      var w = _.groupBy(_.compact(_.map(defaultWidgets,_.bind(function(w){
        if (_.contains(activeWidgets, w.id)) {
          return {
            id: w.id,
            tabs: (!!w.tabs) ? this.getTabsOptions(w.tabs) : null,
            indicators: this.getIndicatorOptions(w.indicators),
          };
        }
        return null;
      }, this))), 'id');

      var r = {};

      switch(params.view) {

        case 'national':

            var iso = !!params['country'] ? params.country.iso : this.status.get('country');
            r[this.objToSlug(iso, '')] = w;
          break;

        case 'subnational':

            if(params.options.jurisdictions) {
              _.map(params.options.jurisdictions, function(j) {
                r[this.objToSlug(j.id, '')] = w;
              }.bind(this));
            }

          break;

        case 'areas-interest':

            if (params.options.areas) {
              _.map(params.options.areas, function(a) {
                r[this.objToSlug(a.id, '')] = w;
              }.bind(this));
            };

          break;

      }

      return {widgets: r};
    },

    getTabsOptions: function(tabs) {
      return _.map(tabs, _.bind(function(t){
        return {
          type: t.type,
          position: t.position,
          unit: (t.switch) ? t['switch'][0]['unit'] : null,
          start_date: (t.range) ? t['range'][0] : null,
          end_date: (t.range) ? t['range'][t['range'].length - 1] : null,
          thresh: (t.thresh) ? this.status.get('globalThresh') : 0,
          section: (t.sectionswitch) ? t['sectionswitch'][0]['unit'] : null,
          template: (t.template) ? t['template'] : null,
        }
      }, this))[0];
    },

    getIndicatorOptions: function(indicators) {
      return _.map(indicators,function(i){
        return i.id;
      });
    },

    objToSlug: function(obj,join) {
      var arr_temp = [];
      for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
          arr_temp.push(obj[p]);
        }
      }
      return arr_temp.join(join);
    }

  });

  return WidgetGridPresenter;

});
