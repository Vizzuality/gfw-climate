define(
  [
    'mps',
    'jquery',
    'underscore',
    'countries/presenters/PresenterClass',
    'widgets/collections/WidgetCollection'
  ],
  function(mps, $, _, PresenterClass, WidgetCollection) {
    'use strict';

    var WidgetGridPresenter = PresenterClass.extend({
      status: new (Backbone.Model.extend({
        defaults: {
          activeWidgets: null,
          defaultWidgets: [1, 2, 3, 4, 5, 6],
          globalThresh: 30
        }
      }))(),

      init: function(view) {
        this.view = view;
        this._super();

        this.widgetCollection = new WidgetCollection();
        mps.publish('Place/register', [this]);

        this._setListeners();
      },

      /**
       * Application subscriptions.
       */
      _subscriptions: [
        {
          'Place/go': function(place) {
            this._onPlaceGo(place);
          },

          'Options/updated': function(id, slug, wstatus) {
            this._onOptionsUpdate(id, slug, wstatus);
          },

          'Widgets/delete': function(id) {
            this._onWidgetsDelete(id);
          },

          'View/update': function(view) {
            var p = {
              view: view
            };

            this._updateView(view);

            if (view === 'national') {
              var p = {
                view: view
              };

              this.widgetCollection.fetch({ default: true }).done(
                function() {
                  this.status.set({
                    country: this.status.get('country'),
                    jurisdictions: null,
                    areas: null,
                    view: view,
                    options: this.getOptions(null, p)
                  });

                  this.view.start();
                }.bind(this)
              );
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
          },

          'Grid/update': function(params) {
            var p = jQuery.extend({}, params);

            this.widgetCollection.fetch({ default: true }).done(
              function() {
                this.status.set({
                  view: params.view,
                  areas:
                    p.options.widgetsActive.length > 0 ? params.areas : null,
                  jurisdictions:
                    p.options.widgetsActive.length > 0
                      ? params.jurisdictions
                      : null,
                  options: this.getOptions(p.options.widgetsActive, p)
                });

                this.view.start();
              }.bind(this)
            );
          }
        }
      ],

      _setListeners: function() {
        this.status.on(
          'change',
          function() {
            mps.publish('Place/update', []);
          },
          this
        );
      },

      /**
       * Used by PlaceService to get the current iso/area params.
       *
       * @return {object} iso/area params
       */
      getPlaceParams: function() {
        var p = {};

        p.options = this.status.get('options');
        p.options.areas = this.status.get('jurisdictions')
          ? null
          : this.status.get('areas');
        p.options.jurisdictions = this.status.get('areas')
          ? null
          : this.status.get('jurisdictions');

        var widgetString = this.status.get('activeWidgets');

        if (widgetString) {
          widgetString.forEach(function(v, i) {
            widgetString[i] = v.toString();
          });

          p.options.activeWidgets = widgetString;
        } else {
          p.options.activeWidgets = null;
        }

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
        switch (params.view) {
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
                options: {},
                activeWidgets: null
              });
              this.view.start();

              mps.publish('Tab/update', [
                {
                  view: this.status.get('view'),
                  silent: true
                }
              ]);
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
                options: {},
                activeWidgets: null
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
        this.widgetCollection.fetch({ default: true }).done(
          function() {
            this.status.set({
              country: params.country.iso,
              jurisdictions: null,
              areas: null,
              view: params.view,
              options: this.getOptions(null, params),
              activeWidgets: this.status.get('defaultWidgets')
            });

            this.view.start();
            mps.publish('Tab/update', [this.status.get('view')]);
          }.bind(this)
        );
      },

      _loadCustomizedOptions: function(params) {
        // this.status.set('activeWidgets', params.options.activeWidgets);
        this.status.set({
          country: params.country.iso,
          jurisdictions: params.jurisdictions
            ? params.jurisdictions
            : this.getJurisdictions(params),
          areas: params.areas ? params.areas : this.getAreas(params),
          options: params.options,
          view: params.view,
          activeWidgets: params.options.activeWidgets
        });

        this.view.start();

        mps.publish('Tab/update', [
          {
            view: this.status.get('view'),
            silent: true
          }
        ]);
      },

      _updateView: function(view) {
        this.status.set(
          {
            view: view
          },
          { silent: true }
        );
      },

      _onWidgetsDelete: function(id) {
        var widgetsActive = _.clone(this.status.get('activeWidgets'));
        // Fix this SHIT in a neraby future, ffs
        widgetsActive = _.without(widgetsActive, id.toString());
        this.status.set('activeWidgets', widgetsActive);

        this.widgetCollection.fetch({ default: true }).done(
          function() {
            this.status.set(
              'options',
              this.getOptions(this.status.get('activeWidgets'), null)
            );
            mps.publish('Place/update');
            this._removeWidget();
          }.bind(this)
        );
      },

      _removeWidget: function() {
        var activeWidgets = this.status.get('activeWidgets');

        if (activeWidgets.length == 0) {
          this.status.attributes.options.jurisdictions = null;
          this.status.attributes.options.areas = null;
          this.status.attributes.options.widgets = null;
          mps.publish('Widgets/update', []);
        }

        this.view.render();
        mps.publish('Widgets/update', [this.status.get('activeWidgets')]);
        mps.publish('Place/update', []);
      },

      onError: function(err) {
        throw err;
      },

      _onOptionsUpdate: function(id, slug, wstatus) {
        var options = _.clone(this.status.get('options').widgets);
        options[slug][id][0] = wstatus;

        var x = {};
        x[slug] = options[slug];

        // Set and publish
        _.extend(this.status.get('options'), x);
        mps.publish('Place/update');
      },

      getJurisdictions: function(params) {
        var jurisdictions = null;

        if (
          params.options.hasOwnProperty('jurisdictions') &&
          params.options.jurisdictions !== null
        ) {
          jurisdictions = params.options.jurisdictions;
        }

        return jurisdictions;
      },

      getAreas: function(params) {
        var areas = null;

        if (
          params.options.hasOwnProperty('areas') &&
          params.options.areas !== null
        ) {
          areas = params.options.areas;
        }

        return areas;
      },

      getOptions: function(widgets, params) {
        var activeWidgets,
          r = {};
        var params = params ? params : this.status.get('options');
        activeWidgets = widgets ? widgets : this.status.get('defaultWidgets');

        this.status.set('activeWidgets', activeWidgets, { silent: true });

        var x = this.status.get('activeWidgets');

        x.forEach(function(v, i) {
          //Before, it was x[i] = Number.parseInt(v);
          //Safari mobile doesn't understand it. So I changed it.
          x[i] = ~~v;
        });

        var w = _.groupBy(
          _.compact(
            _.map(
              this.widgetCollection.toJSON(),
              _.bind(function(w) {
                if (_.contains(x, w.id)) {
                  return {
                    id: w.id,
                    tabs: !!w.tabs ? this.getTabsOptions(w.tabs) : null,
                    indicators: this.getIndicatorOptions(w.indicators)
                  };
                }
                return null;
              }, this)
            )
          ),
          'id'
        );

        switch (params.view) {
          case 'national':
            var iso = !!params['country']
              ? params.country.iso
              : this.status.get('country');
            r[this.objToSlug(iso, '')] = w;
            break;

          case 'subnational':
            if (params.jurisdictions) {
              _.map(
                params.jurisdictions,
                function(j) {
                  r[this.objToSlug(j.id, '')] = w;
                }.bind(this)
              );
            }

            break;

          case 'areas-interest':
            if (params.areas) {
              _.map(
                params.areas,
                function(a) {
                  r[this.objToSlug(a.id, '')] = w;
                }.bind(this)
              );
            }

            break;
        }

        return { widgets: r };
      },

      getTabsOptions: function(tabs) {
        return _.map(
          tabs,
          _.bind(function(t) {
            return {
              type: t.type,
              position: t.position,
              cumulative: t.cumulative,
              unit: t.switch ? t['switch'][0]['unit'] : null,
              start_date: t.range ? t['range'][0] : null,
              end_date: t.range ? t['range'][t['range'].length - 1] : null,
              thresh: t.thresh ? this.status.get('globalThresh') : 0,
              section: t.sectionswitch ? t['sectionswitch'][0]['unit'] : null,
              template: t.template ? t['template'] : null
            };
          }, this)
        )[0];
      },

      getIndicatorOptions: function(indicators) {
        return _.map(indicators, function(i) {
          return i.id;
        });
      },

      objToSlug: function(obj, join) {
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
  }
);
