define(
  [
    'mps',
    'backbone',
    'embed/presenters/PresenterClass',
    'widgets/collections/WidgetCollection'
  ],
  function(mps, Backbone, PresenterClass, WidgetCollection) {
    'use strict';

    var EmbedCountryPresenter = PresenterClass.extend({
      status: new (Backbone.Model.extend({}))(),

      init: function(view) {
        this._super();
        this.view = view;
        mps.publish('Place/register', [this]);
      },

      /**
       * Used by PlaceService to get the current iso/area params.
       *
       * @return {object} iso/area params
       */
      getPlaceParams: function() {
        var p = {};
        return p;
      },

      /**
       * Application subscriptions.
       */
      _subscriptions: [
        {
          'Place/go': function(params) {
            this.status.set(params);
            this.placeGo(params);
          }
        }
      ],

      /**
       * Place GO
       */
      placeGo: function(params) {
        if (!!!this.status.get('widgets')) {
          new WidgetCollection().fetch().done(
            function(response) {
              this.status.set('widgets', response.widgets);
              this.status.set('options', this.getOptions(params));
              this.view.render();
            }.bind(this)
          );
        } else {
          this.view.render();
        }
      },

      // SET OPTIONS PARAMS
      getOptions: function(params) {
        var location = params ? params.location : this.status.get('location');
        var widgets = _.where(this.status.get('widgets'), {
          id: this.status.get('widget')
        });

        // Get the current options
        var w = _.groupBy(
          _.map(
            widgets,
            _.bind(function(w) {
              return {
                id: w.id,
                tabs: !!w.tabs ? this.getTabsOptions(w.tabs) : null
              };
            }, this)
          ),
          'id'
        );

        // Store the variable in an unique
        var r = {};
        r[this.objToSlug(location, '')] = w;
        return r;
      },

      getTabsOptions: function(tabs) {
        // ******
        // CAREFUL: if you add anything new to the widgets.json
        //          remember to add it inside CompareGridPresenter (getTabsOptions function) and inside widgetPresenter (changeTab function)
        //          You must add it to views/api/v1/widgets/show.json.rabl (If you don't, the API won't send the new parameter)
        // ******
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
              template: t.template ? t['template'] : null,
              lock: t.lock != null && t.lock != undefined ? t['lock'] : true
            };
          }, this)
        )[0];
      },

      // HELPERS
      objToSlug: function(obj, join) {
        var arr_temp = [];
        arr_temp[0] = obj['iso'];
        arr_temp[1] = obj['jurisdiction'];
        arr_temp[2] = obj['area'];
        return arr_temp.join(join);
      }
    });

    return EmbedCountryPresenter;
  }
);
