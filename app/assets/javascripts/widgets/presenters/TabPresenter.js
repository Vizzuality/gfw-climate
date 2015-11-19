define([
  'mps',
  'backbone',
  'countries/presenters/PresenterClass'
], function(mps, Backbone, PresenterClass) {

  'use strict';

  var TabPresenter = PresenterClass.extend({

    init: function(view, setup) {
      this.view = view;
      this._super();

      this.model = new (Backbone.Model.extend({
        defaults: setup.model
      }));

      this.status = new (Backbone.Model.extend({
        defaults: setup.status
      }));

      this._setListeners();
    },

    _subscriptions: [{
      'Threshold/change': function(thresh) {
        var tabs = _.clone(this.status.get('tabs'));
        tabs.thresh = thresh;
        this.status.set('tabs', tabs);
      },
    }],

    _setListeners: function() {
      this.status.on('change', this.publish, this);
    },

    // THRESHOLD
    changeThreshold: function(thresh) {
      mps.publish('Threshold/change', [~~thresh]);
    },

    changeUnit: function(unit) {
      var tabs = _.clone(this.status.get('tabs'));
      tabs.unit = unit;
      this.status.set('tabs', tabs);
    },

    changeStartDate: function(start_date) {
      var tabs = _.clone(this.status.get('tabs'));
      tabs.start_date = (~~start_date);
      this.status.set('tabs', tabs);
    },

    changeEndDate: function(end_date) {
      var tabs = _.clone(this.status.get('tabs'))
      tabs.end_date = (~~end_date);
      this.status.set('tabs', tabs);
    },

    changeSection: function(section) {
      var tabs = _.clone(this.status.get('tabs'))
      tabs.section = section;
      this.status.set('tabs', tabs);
    },

    // PUBLISH the current status of this tab
    publish: function() {
      this.view.widget.changeStatus(this.status.toJSON());
    },

    destroy: function() {
      this.unsubscribe();
    }

  });

  return TabPresenter;

});
