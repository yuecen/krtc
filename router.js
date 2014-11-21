var app = angular.module("myApp", ['ngRoute']);
app.config(function ($interpolateProvider) {
    $interpolateProvider.startSymbol('{[{');
    $interpolateProvider.endSymbol('}]}');
});

app.config(function ($routeProvider) {
    $routeProvider
    .when('/', {
      controller:'ListCtrl',
      templateUrl:'news.html'
    })
    .when('/chart', {
      controller:'ListCtrl',
      templateUrl:'chart.html'
    })
    .when('/map', {
      controller:'ListCtrl',
      templateUrl:'map.html'
    })
    .otherwise({
      templateUrl:'cant'
    });
});

app.controller('ListCtrl', function ($scope) {
});
