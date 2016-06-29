define([
  'underscore'
], function(_) {

  var numbersHelper = {
    /**
     * Returns a number with its decimals
     *
     * @param  {Number} Number to format
     * @return {string} String
     */
    addNumberDecimals: function(number) {
      var formattedNumber = '-';

      if (number) {
        formattedNumber = number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }
      return formattedNumber;
    },

    /**
     * Returns a number clipped and with the k unit if its > of a thousand
     *
     * @param  {Number} Number to format
     * @return {string} String
     */
    toThousands: function(number) {
      return number > 999 ? (number/ 1000).toFixed(1) + 'k' : (number * 1).toFixed(2);
    },
  };

  return numbersHelper;
});
