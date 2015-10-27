define([
  'backbone',
  'mps',
  'countries/presenters/show/WidgetGridPresenter',
  'widgets/views/WidgetView',
  'countries/views/show/reports/NationalView',
  'countries/views/show/reports/SubNationalView',
  'countries/views/show/reports/AreasView',
], function(Backbone, mps, WidgetGridPresenter, WidgetView, NationalView,
    SubNationalView, AreasView) {

  'use strict';

  var CountryWidgetsView = Backbone.View.extend({

    el: '#reports',

    events: {
      'click .addIndicators' : '_showModal'
    },

    initialize: function() {
      this.presenter = new WidgetGridPresenter(this);

      this._setListeners();
      this._cacheVars();
    },

    start: function() {
      this.setupWidgets();
    },

    _setListeners: function() {
      // this.presenter.status.on('change:display', this.render, this);
      // this.presenter.status.on('change:widgets', this.render, this);
    },

    _cacheVars: function() {
      this.$moreIndicatorsWarning = $('.more-indicators-warning');
      this.$noIndicatorsWarning = $('.no-indicators-warning');
    },

    _toggleWarnings: function() {
      var view = this.presenter.status.get('view');

      if (view === 'national') {
        this.$noIndicatorsWarning.addClass('is-hidden');
        this.$moreIndicatorsWarning.removeClass('is-hidden');
      }
      else {

        if(view === 'subnational' && !this.presenter.status.get('jurisdictions') ||
          view === 'areas-interest' && !this.presenter.status.get('areas')) {

          this.$moreIndicatorsWarning.addClass('is-hidden');
        }
      }
    },

    _showModal: function(e) {
      e && e.preventDefault();
      mps.publish('Modal/open', [this.presenter.status.get('view')]);
    },

    _checkEnabledWidgets: function() {
      var newIndicators = this.presenter.status.attributes.widgets;
      var currentWidgets = $('.country-widget'),
        enabledWidgets = [];

      if (currentWidgets.length > 0) {
        _.each(currentWidgets, function(widget) {
          enabledWidgets.push($(widget).attr('id'));
        });

        if (newIndicators && newIndicators.length > 0) {

          // Add only new widgets, don't touch the current ones
          enabledWidgets = _.difference(newIndicators, enabledWidgets);

          // If neccesary, remove previously disabled widgets
          var removeWidgets = _.difference(enabledWidgets, newIndicators);

          if (removeWidgets.length > 0) {
            this._removeDisabledWidgets(removeWidgets);
          }
        }

      } else {
        enabledWidgets = newIndicators;
      }

      this.presenter.status.set({'widgets': _.clone(enabledWidgets)});
    },

    _removeDisabledWidgets: function(removeWidgets) {
      var $widgets = $('.country-widget');

      _.each($widgets, function(widget) {
        _.each(removeWidgets, function(removeId) {
          if (removeId === widget.id) {
            $(widget).remove();
          }
        });
      });
    },

    _getWidgetsId: function() {
      var ids = [],
        widgets = this.presenter.status.get('widgets');

      _.map(widgets, function(w) {
        ids.push(w.id);
      });
      return ids;
    },

    setupWidgets: function() {

      var promises = [],
        widgetsArray = [],
        iso = this.presenter.status.get('country'),
        // widgets = this.presenter.status.get('options')[iso];
        widgets = JSON.parse(atob('eyJCUkEwMCI6eyIxIjpbeyJpZCI6MSwidGFicyI6eyJ0eXBlIjoibGluZSIsInBvc2l0aW9uIjoxLCJ1bml0IjoiaGVjdGFyZXMiLCJzdGFydF9kYXRlIjoyMDAxLCJlbmRfZGF0ZSI6MjAxNCwidGhyZXNoIjoyNSwic2VjdGlvbiI6bnVsbCwic2VjdGlvbnN3aXRjaCI6bnVsbH19XSwiMiI6W3siaWQiOjIsInRhYnMiOnsidHlwZSI6ImxpbmUiLCJwb3NpdGlvbiI6MSwidW5pdCI6InRnLWMiLCJzdGFydF9kYXRlIjoyMDAxLCJlbmRfZGF0ZSI6MjAxNCwidGhyZXNoIjoyNSwic2VjdGlvbiI6bnVsbCwic2VjdGlvbnN3aXRjaCI6bnVsbH19XSwiMyI6W3siaWQiOjMsInRhYnMiOnsidHlwZSI6Im51bWJlciIsInBvc2l0aW9uIjoxLCJ1bml0IjpudWxsLCJzdGFydF9kYXRlIjpudWxsLCJlbmRfZGF0ZSI6bnVsbCwidGhyZXNoIjoyNSwic2VjdGlvbiI6bnVsbCwic2VjdGlvbnN3aXRjaCI6bnVsbH19XSwiNCI6W3siaWQiOjQsInRhYnMiOnsidHlwZSI6InBpZSIsInBvc2l0aW9uIjoxLCJ1bml0IjpudWxsLCJzdGFydF9kYXRlIjpudWxsLCJlbmRfZGF0ZSI6bnVsbCwidGhyZXNoIjoyNSwic2VjdGlvbiI6ImJpb21hc3MiLCJzZWN0aW9uc3dpdGNoIjpbeyJ1bml0IjoiYmlvbWFzcyIsInVuaXRuYW1lIjoiYmlvbWFzcyJ9LHsidW5pdCI6ImNhcmJvbiIsInVuaXRuYW1lIjoiY2FyYm9uIn1dfX1dLCI1IjpbeyJpZCI6NSwidGFicyI6eyJ0eXBlIjoicGllIiwicG9zaXRpb24iOjEsInVuaXQiOm51bGwsInN0YXJ0X2RhdGUiOm51bGwsImVuZF9kYXRlIjpudWxsLCJ0aHJlc2giOjI1LCJzZWN0aW9uIjoiYmlvbWFzcyIsInNlY3Rpb25zd2l0Y2giOlt7InVuaXQiOiJiaW9tYXNzIiwidW5pdG5hbWUiOiJiaW9tYXNzIn0seyJ1bml0IjoiY2FyYm9uIiwidW5pdG5hbWUiOiJjYXJib24ifV19fV19LCJDTVIwMCI6eyIxIjpbeyJpZCI6MSwidGFicyI6eyJ0eXBlIjoibGluZSIsInBvc2l0aW9uIjoxLCJ1bml0IjoiaGVjdGFyZXMiLCJzdGFydF9kYXRlIjoyMDAxLCJlbmRfZGF0ZSI6MjAxNCwidGhyZXNoIjoyNSwic2VjdGlvbiI6bnVsbCwic2VjdGlvbnN3aXRjaCI6bnVsbH19XSwiMiI6W3siaWQiOjIsInRhYnMiOnsidHlwZSI6ImxpbmUiLCJwb3NpdGlvbiI6MSwidW5pdCI6InRnLWMiLCJzdGFydF9kYXRlIjoyMDAxLCJlbmRfZGF0ZSI6MjAxNCwidGhyZXNoIjoyNSwic2VjdGlvbiI6bnVsbCwic2VjdGlvbnN3aXRjaCI6bnVsbH19XSwiMyI6W3siaWQiOjMsInRhYnMiOnsidHlwZSI6Im51bWJlciIsInBvc2l0aW9uIjoxLCJ1bml0IjpudWxsLCJzdGFydF9kYXRlIjpudWxsLCJlbmRfZGF0ZSI6bnVsbCwidGhyZXNoIjoyNSwic2VjdGlvbiI6bnVsbCwic2VjdGlvbnN3aXRjaCI6bnVsbH19XSwiNCI6W3siaWQiOjQsInRhYnMiOnsidHlwZSI6InBpZSIsInBvc2l0aW9uIjoxLCJ1bml0IjpudWxsLCJzdGFydF9kYXRlIjpudWxsLCJlbmRfZGF0ZSI6bnVsbCwidGhyZXNoIjoyNSwic2VjdGlvbiI6ImJpb21hc3MiLCJzZWN0aW9uc3dpdGNoIjpbeyJ1bml0IjoiYmlvbWFzcyIsInVuaXRuYW1lIjoiYmlvbWFzcyJ9LHsidW5pdCI6ImNhcmJvbiIsInVuaXRuYW1lIjoiY2FyYm9uIn1dfX1dLCI1IjpbeyJpZCI6NSwidGFicyI6eyJ0eXBlIjoicGllIiwicG9zaXRpb24iOjEsInVuaXQiOm51bGwsInN0YXJ0X2RhdGUiOm51bGwsImVuZF9kYXRlIjpudWxsLCJ0aHJlc2giOjI1LCJzZWN0aW9uIjoiYmlvbWFzcyIsInNlY3Rpb25zd2l0Y2giOlt7InVuaXQiOiJiaW9tYXNzIiwidW5pdG5hbWUiOiJiaW9tYXNzIn0seyJ1bml0IjoiY2FyYm9uIiwidW5pdG5hbWUiOiJjYXJib24ifV19fV19fQ=='))



      _.map(widgets.BRA00, function(widget, id) {
          var deferred = $.Deferred();
          var widgetOptions =  widget[0];
          var newWidget = new WidgetView({
            model: {
              id: id,
              slug: 'BRA',
              location: {
                iso: 'BRA',
                jurisdiction: 0,
                area: 0
              },
            },
            className: 'gridgraphs--widget',
            status: widgets.BRA00[id][0]
          });

          newWidget._loadMetaData(function() {
            deferred.resolve();
          });

          widgetsArray.push(newWidget);
          promises.push(deferred);

      }.bind(this));

      $.when.apply(null, promises).then(function() {
        this.render(widgetsArray);
      }.bind(this));
    },

    render: function(widgetsArray) {
      var subview,
        view = this.presenter.status.get('view');
      var options = {
        widgets: widgetsArray
      };

      switch(view) {

        case 'national':
          subview = new NationalView(options);
          break;
        case 'subnational':
          _.extend(options, {
            jurisdictions: this.presenter.status.get('jurisdictions')
          });
          subview = new SubNationalView(options);
          break;
        case 'areas-interest':
          _.extend(options, {
            areas: this.presenter.status.get('areas')
          });
          subview = new AreasView(options);
          break;
      }


      this.$el.find('.reports-grid').append(subview.render().el);
    }

  });

  return CountryWidgetsView;

});
