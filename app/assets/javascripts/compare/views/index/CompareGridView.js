define(
  [
    'backbone',
    'enquire',
    'mps',
    'compare/presenters/CompareGridPresenter',
    'widgets/views/WidgetView',
    'text!compare/templates/compareGrid.handlebars'
  ],
  function(Backbone, enquire, mps, CompareMainPresenter, WidgetView, tpl) {
    var CompareMainView = Backbone.View.extend({
      el: '#compareGridView',

      events: {
        'click .lock-mode': 'toggleLock',
        'mouseenter .lock-mode': 'toggleLegend',
        'mouseleave .lock-mode': 'toggleLegend'
      },

      template: Handlebars.compile(tpl),

      initialize: function() {
        this.presenter = new CompareMainPresenter(this);

        enquire.register(
          'screen and (max-width:' + window.gfw.config.GFW_MOBILE + 'px)',
          {
            match: _.bind(function() {
              this.mobile = true;
              this.render();
            }, this)
          }
        );

        enquire.register(
          'screen and (min-width:' + window.gfw.config.GFW_MOBILE + 'px)',
          {
            match: _.bind(function() {
              this.mobile = false;
              this.render();
            }, this)
          }
        );
      },

      render: function() {
        this.$el.html(this.template(this.parseData()));

        if (!!this.widgets && !!this.widgets.length) {
          this.destroy();
        }

        this.widgets = [];
        this.promises = [];

        var widgetsIds = this.presenter.status.get('widgetsActive');
        var data = this.presenter.status.get('data');

        // Loop each widget and get data of each compare
        _.each(
          widgetsIds,
          _.bind(function(w) {
            _.each(
              data,
              _.bind(function(c, i) {
                var deferred = $.Deferred();
                var slugw = this.presenter.objToSlug(
                  this.presenter.status.get('compare' + (i + 1)),
                  ''
                );
                var slugw_compare = this.presenter.objToSlug(
                  this.presenter.status.get('compare' + (data.length - i)),
                  ''
                );
                var currentWidget = new WidgetView({
                  id: w,
                  className: 'gridgraphs--widget',
                  model: {
                    id: w,
                    location: this.presenter.status.get('compare' + (i + 1)),
                    location_compare: this.presenter.status.get(
                      'compare' + (data.length - i)
                    ),
                    slugw: slugw,
                    slugw_compare: slugw_compare
                  },
                  status: this.presenter.status.get('options')[slugw][w][0]
                });

                currentWidget._loadMetaData(function(data) {
                  deferred.resolve(data);
                });

                // Set persistent variables
                this.widgets.push(currentWidget);
                this.promises.push(deferred);
              }, this)
            );
          }, this)
        );

        $.when.apply(null, this.promises).then(
          _.bind(function() {
            this.widgets.forEach(function(widget) {
              widget.render();
              $('#gridgraphs-compare-' + widget.id)
                .addClass('is-locked')
                .append(widget.el);
            });
          }, this)
        );

        this.cacheVars();
        this.setListeners();
      },

      cacheVars: function() {
        if (this.mobile) {
          //CACHE VARS FOR MOBILE ONLY
          this.$widgetPanel = this.$('.widgets-wrapper');
          this.panelWidth = this.$widgetPanel.width();
        }
      },

      setListeners: function() {
        if (this.mobile) {
          //Listener for widget panel switch
          this.$el.scroll(
            _.throttle(_.bind(this.checkPanelPosition, this), 300)
          );
        }
      },

      parseData: function() {
        return {
          widgets: this.presenter.status.get('widgetsActive')
        };
      },

      // Events
      toggleLock: function(e) {
        var is_locked = $(e.currentTarget).hasClass('is-locked');

        var id = $(e.currentTarget).data('id');

        if (is_locked) {
          $('#gridgraphs-compare-' + id).addClass('is-locked');
          $('#gridgraphs-compare-' + id)
            .find('.tooltip-legend')
            .html('unlock');
        } else {
          $('#gridgraphs-compare-' + id).removeClass('is-locked');
          $('#gridgraphs-compare-' + id)
            .find('.tooltip-legend')
            .html('lock');
        }

        $(e.currentTarget).toggleClass('is-locked', !is_locked);
        this.presenter.toggleLock(id, is_locked);
      },

      toggleLegend: function(e) {
        var legend = $(e.currentTarget).find('.locker-tooltip');
        if (e && e.type === 'mouseenter') {
          legend.removeClass('is-hidden');
        } else {
          legend.addClass('is-hidden');
        }
      },

      destroy: function() {
        this.widgets.forEach(function(widget) {
          widget.destroy();
        });
      },

      //only for mobile
      checkPanelPosition: function(e) {
        var activeTabCompare;
        var offset = Math.abs(this.$widgetPanel.offset().left);

        if (offset > parseInt(this.panelWidth / 4)) {
          activeTabCompare = 'is-tab-2';
          $('.m-widget-header').addClass('-right-side');
          Backbone.Events.trigger('compareTabMb:change', activeTabCompare);
        } else {
          activeTabCompare = 'is-tab-1';
          $('.m-widget-header').removeClass('-right-side');
          Backbone.Events.trigger('compareTabMb:change', activeTabCompare);
        }
      }
    });

    return CompareMainView;
  }
);
