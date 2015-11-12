define([
  'backbone',
  'mps',
  'compare/presenters/PresenterClass',
  'compare/services/CompareService',
  'widgets/collections/WidgetCollection',
], function(Backbone, mps, PresenterClass, CompareService, WidgetCollection) {

  'use strict';

  var CompareGridPresenter = PresenterClass.extend({

    status: new (Backbone.Model.extend({
      defaults: {
        name: 'compare-countries',
        widgetsActive: ["1","2","3","4","5"]
      }
    })),

    init: function(view) {
      this._super();
      this.view = view;
      this.service = CompareService;
      mps.publish('Place/register', [this]);
    },

    /**
     * Used by PlaceService to get the current iso/area params.
     *
     * @return {object} iso/area params
     */
    getPlaceParams: function() {
      var p = {};
      p.options = this.status.get('options');
      return p;
    },

    /**
     * Application subscriptions.
     */
    _subscriptions: [{
      'Place/go': function(params) {
        this._onPlaceGo(params);
      },

      'Compare/update': function(params) {
        this._onCompareUpdate(params)
      },

      'Options/updated': function(id,slug,wstatus) {
        this._onOptionsUpdate(id,slug,wstatus);
      },

      'Widgets/delete': function(id) {
        this._onWidgetsDelete(id);
      },

      'Widgets/change': function(widgetsActive) {
        this._onWidgetsChange(widgetsActive);
      }

    }],

    /**
     * MPS subscription callbacks
    */
    _onPlaceGo: function(params) {
      this.setWidgets(params);
    },

    _onCompareUpdate: function(params) {
      var params = _.extend({}, this.status.attributes, params);
      this.setWidgets(params);
    },

    _onOptionsUpdate: function(id,slug,wstatus) {
      var options = _.clone(this.status.get('options'));
      if (!!options[slug]) {
        options[slug][id][0] = wstatus;
        // Set and publish
        this.status.set('options', options);
        mps.publish('Place/update');
      }
    },

    _onWidgetsDelete: function(id) {
      var widgetsActive = _.clone(this.status.get('widgetsActive'));
      widgetsActive = _.without(widgetsActive,id.toString());
      this.status.set('widgetsActive', widgetsActive);
      this.status.set('options', this.getOptions());
      mps.publish('Place/update');
      this.changeCompare();
    },

    _onWidgetsChange: function(widgetsActive) {
      this.status.set('widgetsActive', widgetsActive);
      this.status.set('options', this.getOptions());
      mps.publish('Place/update');
      this.changeCompare();
    },

    // SETTERS
    setWidgets: function(params) {
      if (! !!this.status.get('widgets')) {
        new WidgetCollection()
          .fetch()
          .done(_.bind(function(response){
            this.status.set('widgets', response.widgets);
            this.setParams(params);
          }, this ));
      } else {
        this.setParams(params);
      }
    },

    setActiveWidgets: function() {
      var widgetIds = _.map(this.status.get('options'),function(c){
        return _.map(c, function(w,k){
          return k.toString();
        })
      });
      this.status.set('widgetsActive',widgetIds[0]);
    },

    setParams: function(params) {
      if (!!params.compare1 && !!params.compare2) {
        if (! !!params.options) {

          params.options = this.getOptions(params);
          this.setModels(params);
        } else {
          if ((!!this.oldCompare1 && this.oldCompare1 != params.compare1) || (!!this.oldCompare2 && this.oldCompare2 != params.compare2)) {
            params.options = this.moveOptions(params);
            this.setModels(params);
          } else {
            this.setModels(params);
          }
        }
      }
    },

    setModels: function(params) {
      this.status.set('options', params.options);
      this.status.set('compare1', params.compare1);
      this.status.set('compare2', params.compare2);
      this.oldCompare1 = params.compare1;
      this.oldCompare2 = params.compare2;
      mps.publish('Place/update');
      this.setActiveWidgets();
      this.changeCompare();
    },




    // COMPARE EVENTS
    render: function() {
      this.view.render();
    },

    changeCompare: function() {
      var compare1 = this.objToSlug(this.status.get('compare1'),'+');
      var compare2 = this.objToSlug(this.status.get('compare2'),'+');
      if (!!compare1 && !!compare2) {
        this.service.execute(
          compare1,
          compare2,
          _.bind(this.successCompare, this),
          _.bind(this.errorCompare, this)
        );
      }
    },

    successCompare: function(data) {
      var activeWidgets = this.status.get('widgetsActive');
      var data = _.map(data.countries, function(c){
        c.widgets = _.compact(_.map(c.widgets, function(w){
          return (_.contains(activeWidgets, w.id)) ? w : null;
        }));
        return c;
      });
      this.status.set('data', data);
      this.render();
      mps.publish('Widgets/update',[this.status.get('widgetsActive')]);
    },

    errorCompare: function() {
      console.log('ERROR');
      console.log(arguments);
    },

    // SET OPTIONS PARAMS

    getOptions: function(params) {
      var compare1 = (params) ? params.compare1 : this.status.get('compare1');
      var compare2 = (params) ? params.compare2 : this.status.get('compare2');
      var widgets = _.filter(this.status.get('widgets'), _.bind(function(w){
        return _.contains(this.status.get('widgetsActive'),w.id.toString());
      }, this ));

      // Get the current options
      var w = _.groupBy(_.map(widgets,_.bind(function(w){
        return {
          id: w.id,
          tabs: (!!w.tabs) ? this.getTabsOptions(w.tabs) : null
        };
      }, this)), 'id');

      var r = {};
      r[this.objToSlug(compare1,'')] = w;
      r[this.objToSlug(compare2,'')] = w;
      return r;
    },

    getTabsOptions: function(tabs) {
      return _.map(tabs, function(t){
        return {
          type: t.type,
          position: t.position,
          unit: (t.switch) ? t['switch'][0]['unit'] : null,
          start_date: (t.range) ? t['range'][0] : null,
          end_date: (t.range) ? t['range'][t['range'].length - 1] : null,
          thresh: (t.thresh) ? t['thresh'] : 0,
          section: (t.sectionswitch) ? t['sectionswitch'][0]['unit'] : null,
        }
      })[0];
    },

    getIndicatorOptions: function(indicators) {
      return _.map(indicators,function(i){
        return i.id;
      });
    },

    moveOptions: function(params) {
      var r = {};
      var options = _.map(params.options, function(opt,key){
        return opt;
      });
      r[this.objToSlug(params.compare1,'')] = options[0];
      r[this.objToSlug(params.compare2,'')] = options[1];
      return r;
    },

    // HELPERS
    objToSlug: function(obj,join) {
      var arr_temp = [];
      arr_temp[0] = obj['iso'];
      arr_temp[1] = obj['jurisdiction'];
      arr_temp[2] = obj['area'];
      return arr_temp.join(join);
    }


  });

  return CompareGridPresenter;

});
