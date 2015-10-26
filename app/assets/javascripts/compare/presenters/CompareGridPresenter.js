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
        name: 'compare-countries'
      }
    })),

    init: function(view) {
      this._super();
      this.view = view;
      this.service = CompareService;
      this.setListeners();
      mps.publish('Place/register', [this]);
    },

    setListeners: function() {
      this.status.on('change:data', this.changeData, this);
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
      }

    }],

    /**
     *
    */
    _onPlaceGo: function(params) {
      this.setParams(params);
    },


    _onCompareUpdate: function(params) {
      var params = _.extend({}, this.status.attributes, params);
      this.setParams(params);
    },


    _onOptionsUpdate: function(id,slug,wstatus) {
      var options = _.clone(this.status.get('options'));
      options[slug][id][0] = wstatus;
      // Set and publish
      this.status.set('options', options);
      mps.publish('Place/update');
    },

    setParams: function(params) {
      if (!!params.compare1 && !!params.compare2) {
        if (! !!params.options) {
          // Fetching data
          new WidgetCollection()
            .fetch({data: {default: true}})
            .done(_.bind(function(widgets){
              params.options = this.getOptions(params, widgets);
              this.setModels(params);
            }, this ));
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

    // SETTER
    setModels: function(params) {
      this.status.set('options', params.options);
      // this.status.set('widgets', this.getWidgets());
      this.status.set('compare1', params.compare1);
      this.status.set('compare2', params.compare2);
      this.oldCompare1 = params.compare1;
      this.oldCompare2 = params.compare2;
      mps.publish('Place/update');
      this.changeCompare();
    },

    // COMPARE EVENTS
    changeData: function() {
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
      consoel.log(this.status.get('widgets'));
      var activeWidgets = [1,2,3,4,5];
      var data = _.map(data.countries, function(c){
        c.widgets = _.compact(_.map(c.widgets, function(w){
          return (_.contains(activeWidgets, w.id)) ? w : null;
        }));
        return c;
      });
      this.status.set('data', data);
    },

    errorCompare: function() {
      console.log('ERROR');
      console.log(arguments);
    },


    // HELPERS
    getWidgets: function() {
      var widgets = this.status.get('options');
      return _.map(widgets,function(w){
        return w.id;
      });
    },

    // SET OPTIONS PARAMS
    getOptions: function(params, widgets) {
      // This should be removed to a dinamic var
      var activeWidgets = [1,2,3,4,5];
      var w = _.groupBy(_.compact(_.map(widgets.widgets,_.bind(function(w){
        if (_.contains(activeWidgets, w.id)) {
          return {
            id: w.id,
            tabs: (!!w.tabs) ? this.getTabsOptions(w.tabs) : null
          };
        }
        return null;
      }, this))), 'id');
      // There is a better way to do this??
      var r = {};
      r[this.objToSlug(params.compare1,'')] = w;
      r[this.objToSlug(params.compare2,'')] = w;
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
          thresh: (t.thresh) ? t['thresh'] : null,
          section: (t.section) ? t['section'] : null,
          sectionswitch: (t.sectionswitch) ? t['sectionswitch'] : null,
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
      r[this.objToSlug(params.compare1,'')] = params.options[this.objToSlug(this.oldCompare1,'')];
      r[this.objToSlug(params.compare2,'')] = params.options[this.objToSlug(this.oldCompare2,'')];
      return r;
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

  return CompareGridPresenter;

});
