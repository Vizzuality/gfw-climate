define([
  'mps',
  'backbone',
  'widgets/models/WidgetModel',
  'countries/presenters/PresenterClass'
], function(mps, Backbone, WidgetModel, PresenterClass) {

  'use strict';

  var WidgetPresenter = PresenterClass.extend({

    init: function(view, setup) {
      this.view = view;
      this._super();
      this.model = new WidgetModel(setup.model);
      this.status = new (Backbone.Model.extend({
        defaults: setup.status
      }));
      this._setListeners();
    },

    _setListeners: function() {
      this.status.on('change:tabs', this.setTab, this);
    },

    _subscriptions: [{
      'Compare/reflection': function(id,slugw_compare,status) {
        if (this.model.get('id') == id && this.model.get('slugw') == slugw_compare) {
          this.status.set(status);
        }
      },
      'Lock/toggle': function(id,lock) {
        if (this.model.get('id') == id) {
          var tabs = _.clone(this.status.get('tabs'));
          tabs.lock = lock;
          this.status.set('tabs', tabs);
        }
      },
      'Threshold/change': function(thresh) {
        this.thresh = thresh;
      },

    }],

    changeTab: function(position) {
      // ******
      // CAREFUL: if you add anything new to the widgets.json
      //          remember to add it inside CompareGridPresenter (getTabsOptions function) and inside widgetPresenter (changeTab function)
      //          You must add it to views/api/v1/widgets/show.json.rabl (If you don't, the API won't send the new parameter)
      // ******
      var tabs = _.clone(this.status.get('tabs'));
      var t = _.findWhere(this.model.get('tabs'), { position: position });
      tabs = {
        type: t.type,
        position: position,
        unit: (t.switch) ? t['switch'][0]['unit'] : null,
        start_date: (t.range) ? t['range'][0] : null,
        end_date: (t.range) ? t['range'][t['range'].length - 1] : null,
        thresh: (t.thresh) ? this.thresh : 0,
        section: (t.sectionswitch) ? t['sectionswitch'][0]['unit'] : null,
        template: (t.template) ? t['template'] : null,
        lock: (this.status.get('tabs').lock != null && this.status.get('tabs').lock != undefined) ? this.status.get('tabs').lock : true,
      }
      this.status.set('tabs',tabs);
    },

    changeStatus: function(status) {
      this.status.set(status);
    },

    setTab: function() {
      this.view.setTab();
      this.publish();
    },


    publish: function() {
      mps.publish('Options/updated', [this.model.get('id'),this.model.get('slugw'),this.status.toJSON()]);
      if (this.status.get('tabs').lock) {
        mps.publish('Compare/reflection', [this.model.get('id'),this.model.get('slugw_compare'),this.status.toJSON()]);
      }
    },

    deleteWidget: function() {
      mps.publish('Widgets/delete', [this.model.get('id')]);
    },

    destroy: function() {
      this.unsubscribe();
    }

  });

  return WidgetPresenter;

});
