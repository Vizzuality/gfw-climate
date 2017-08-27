define(
  [
    'backbone',
    'underscore',
    'handlebars',
    'text!data-download/templates/download-filter-card.handlebars',
    'text!data-download/templates/download-filter-card-options.handlebars'
  ],
  function(Backbone, _, Handlebars, tpl, optionsTpl) {
    'use strict';
    var DataDownloadIndexView = Backbone.View.extend({
      template: Handlebars.compile(tpl),
      optionsTemplate: Handlebars.compile(optionsTpl),

      events: {
        'keyup .js-search-filter': 'onSearchChange',
        'change .js-select-all': 'onSelectAllChange',
        'change .js-select': 'onSelectChange'
      },

      initialize: function(settings) {
        this.filter = settings.filter;
        this.selection = [];
        this.render(this.filter);
        this.optionsContainer = this.$('#' + settings.filter.id + '-options');
        this.renderOptions(this.filter.options);
      },

      renderOptions: function(options) {
        this.optionsContainer.html(
          this.optionsTemplate({
            id: this.filter.id,
            options: options
          })
        );
      },

      render: function(filter) {
        this.$el.html(this.template(filter));
      },

      getAllOptionsValues: function(options) {
        if (!options) return [];

        return options.map(function(option) {
          return option.value;
        });
      },

      onSearchChange: function(e) {
        var options = [];
        var search = e.currentTarget.value.toUpperCase();
        if (search) {
          options = this.filter.options.filter(function(option) {
            return option.name.toUpperCase().indexOf(search) > -1;
          });
        } else {
          options = this.filter.options;
        }
        this.renderOptions(options);
      },

      onSelectAllChange: function(e) {
        var selected = false;
        if (e.currentTarget.checked) {
          selected = true;
          this.selection = this.getAllOptionsValues(this.filter.options);
        } else {
          this.selection = [];
        }
        this.setAllInputsValue(selected);
      },

      setAllInputsValue: function(value) {
        this.$('.js-select').each(function(index, item) { item.checked = value; });
      },

      onSelectChange: function(e) {
        e.preventDefault();
        var value = e.currentTarget.value;
        var checked = e.currentTarget.checked;
        if (checked) {
          this.selection.push(value);
        } else {
          var index = this.selection.indexOf(value);
          if (index > -1) {
            this.selection.splice(index, 1);
          }
        }
        this.trigger('option:changed', this.selection);
      }
    });

    return DataDownloadIndexView;
  }
);
