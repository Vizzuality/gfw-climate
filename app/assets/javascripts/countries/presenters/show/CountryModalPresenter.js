define(['mps', 'countries/presenters/PresenterClass'], function(
  mps,
  PresenterClass
) {
  var ReportsPanelPresenter = PresenterClass.extend({
    init: function(view) {
      this._super();
      this.view = view;

      this.status = new (Backbone.Model.extend())();

      mps.publish('Place/register', [this]);
    },

    _subscriptions: [
      {
        'Modal/open': function() {
          this.view.show();
        },
        'Modal/close': function() {
          this.view.hide();
        },

        'View/update': function(view) {
          this._setView(view);
          this._resetIndicators();
        },
        'Place/go': function(params) {
          this._onPlaceGo(params);
        },
        'Widgets/update': function(p) {
          if (this.status.get('options')) {
            this.status.set(
              'options',
              _.extend(this.status.get('options'), { activedWidgets: p })
            );
          } else {
            this.status.set('options', { activedWidgets: p });
          }

          this.view.update();
        }
      }
    ],

    /**
     * Used by PlaceService to get the current view param.
     *
     * @return {object} iso/area params
     */
    getPlaceParams: function() {
      var p = {};
      return p;
    },

    _resetIndicators: function() {
      this.status.set({
        options: {
          widgets: null
        }
      });
    },

    _onPlaceGo: function(params) {
      this._setCountry(params.country);
      this._setView(params.view);
      this._setOptions(params.options);
    },

    _setCountry: function(c) {
      this.status.set({
        country: c.iso
      });
    },

    setIndicators: function(i) {
      this.status.set({
        indicators: i
      });
    },

    setJurisdictions: function(j) {
      this.status.set({
        jurisdictions: j
      });
    },

    setAreas: function(a) {
      this.status.set({
        areas: a
      });
    },

    _setView: function(v) {
      this.status.set({
        view: v
      });
    },

    _setOptions: function(o) {
      this.status.set({
        options: o
      });
    }
  });

  return ReportsPanelPresenter;
});
