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
      'Compare/reflection': function(id,slug_compare,status) {
        if (this.model.get('id') == id && this.model.get('slug') == slug_compare) {
          this.status.set(status);
        }
      }
    }],

    changeTab: function(position) {
      var tabs = _.clone(this.status.get('tabs'));
      tabs.position = position;
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
      // Duplicate events, be careful and check it later
      mps.publish('Options/updated', [this.model.get('id'),this.model.get('slug'),this.status.toJSON()]);
      if (!!this.model.get('slug_compare')) {
        mps.publish('Compare/reflection', [this.model.get('id'),this.model.get('slug_compare'),this.status.toJSON()]);
      }
    },

  });

  return WidgetPresenter;

});
