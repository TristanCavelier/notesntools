if (typeof define === 'function' && define.amd) {
  define(function () {
    return {};
  });
} else {
  this.$ = {};
  this.jQuery = this.$;
}
