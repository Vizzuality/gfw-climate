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
        this.renderOptions(this.filter.options, this.filter.placeholder);
      },

      renderOptions: function(options, placeholder) {
        this.filter.options = options;
        this.selectAllEl.prop('disabled', !options.length);
        this.optionsContainer.html(
          this.optionsTemplate({
            id: this.filter.id,
            options: options,
            placeholder: placeholder || ''
          })
        );
      },

      render: function(filter) {
        this.$el.html(this.template(filter));
        this.selectAllEl = this.$('.js-select-all');
      },

      getAllOptionsValues: function(options) {
        if (!options) return [];

        return options.map(function(option) {
          return option.value + '';
        });
      },

      onSearchChange: function(e) {
        var options = [];
        var search = e.currentTarget.value.toUpperCase();

        function filterOptions(option) {
          return option.name.toUpperCase().indexOf(search) > -1;
        }

        if (search) {
          if (!this.initialOptions) {
            this.initialOptions = this.filter.options;
            options = this.filter.options.filter(filterOptions);
          } else {
            options = this.initialOptions.filter(filterOptions);
          }
        } else if (this.initialOptions) {
          options = this.initialOptions;
          this.initialOptions = false;
        } else {
          options = this.filter.options;
        }
        this.renderOptions(options, this.filter.placeholder);
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
        this.trigger('option:changed', this.selection);
      },

      setAllMarked: function(value) {
        this.setAllInputsMarked(value);
        this.setAllInputsValue(value);
      },

      setAllInputsMarked: function(value) {
        this.$('.js-select-all').prop('checked', value);
      },

      setAllInputsValue: function(value) {
        this.selection = value
          ? this.getAllOptionsValues(this.filter.options)
          : [];
        this.$('.js-select').each(function(index, item) {
          item.checked = value;
        });
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
        if (!this.selection.length) {
          this.setAllInputsMarked(false);
        } else if (this.selection.length === this.filter.options.length) {
          this.setAllInputsMarked(true);
        }
      }
    });

    return DataDownloadIndexView;
  }
);
