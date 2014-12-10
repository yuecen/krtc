var myapp = angular.module('myApp', ['ngRoute']);
myapp.config(function ($interpolateProvider) {
//    $interpolateProvider.startSymbol('{[{');
//    $interpolateProvider.endSymbol('}]}');
});

myapp.config(function ($routeProvider) {
    $routeProvider
    .when('/', {
      controller:'ListCtrl',
      templateUrl:'news.html'
    })
    .when('/month', {
      controller:'month_ctrl',
      templateUrl:'month.html'
    })
    .when('/day', {
      controller:'day_ctrl',
      templateUrl:'day.html'
    })
    .when('/map', {
      controller:'ListCtrl',
      templateUrl:'map.html'
    })
    .otherwise({
      templateUrl:'cant'
    });
});

myapp.controller('ListCtrl', function ($scope) {
});

myapp.controller('month_ctrl', function ($scope, $q, $http) {

    $scope.getjsondata = function() {
        return $scope.jsondata;
    };

    title = ['x', '01', '02', '03', '04', '05', '06',
             '07', '08', '09', '10', '11', '12'];
    chart_data_total = [title];
    chart_data_red = [title];
    chart_data_orange = [title];
    
    year2010 = $http.get('./data/2010/average.json'),
    year2011 = $http.get('./data/2011/average.json'),
    year2012 = $http.get('./data/2012/average.json'),
    year2013 = $http.get('./data/2013/average.json'),
    year2014 = $http.get('./data/2014/average.json?t=201411');


    $q.all([year2010, year2011, year2012, year2013, year2014]).then(function(result) {
      angular.forEach(result, function(response) {

        tmp = response.data;
        tmp_total = [tmp[0]['year']];
        tmp_red = [tmp[0]['year']];
        tmp_orange = [tmp[0]['year']];

        for(k in tmp) {
          tmp_total.push(tmp[k]['a_total_people']);
          tmp_red.push(tmp[k]['a_red_line_people']);
          tmp_orange.push(tmp[k]['a_orange_line_people']);
        }
        chart_data_total.push(tmp_total);
        chart_data_red.push(tmp_red);
        chart_data_orange.push(tmp_orange);
      });

      return [chart_data_total, chart_data_red, chart_data_orange];
    }).then(function draw_chart(tmp_data){
      var chart_total = c3.generate({
                          bindto: '#chart_total',
                          data: {
                            x: 'x',
                            columns: tmp_data[0]
                          }
                        });
      setTimeout(function () {
          chart_total.xgrids([{value: '02', text:'年假'}]);
      }, 2000);
      setTimeout(function () {
          chart_total.xgrids([{value: '08', text:'2014 高雄氣爆'}]);
      }, 6000);
      setTimeout(function () {
          chart_total.xgrids.remove([{value: '02'}]);
      }, 5000);
      setTimeout(function () {
          chart_total.xgrids.remove();
      }, 10000);

      var chart_red = c3.generate({
                        bindto: '#chart_red',
                        data: {
                          x: 'x',
                          columns: tmp_data[1]
                        }
                      });
      var chart_orange = c3.generate({
                           bindto: '#chart_orange',
                           data: {
                             x: 'x',
                             columns: tmp_data[2]
                           }
                         });
      
    });

});


myapp.directive('resizable', function($window, $timeout) {
        var timeout;
        return function($scope) {
          angular.element($window).bind("resize", function() {
            if(timeout)$timeout.cancel(timeout);
            timeout = $timeout(function(){
              
              cal.destroy();
              w = angular.element($window).width() / 73;
              cal = new CalHeatMap();
              cal.init({
                itemSelector: "#daymap",
                start: new Date(2014, 0),
                domain: "year",
                // domain: "day",
                subDomain: "day",
                // rowLimit: 7,
                cellSize: w,
                data: heatmap_data,
                // subDomainTextFormat: "%d",
                range: 1,
                weekStartOnMonday: true,
                // domainGutter: 10,
                // cellpadding: 4,
                displayLegend: true,
                // verticalOrientation: true
                afterLoadData: parser,
                legend: [110,120,121,122],
                legendHorizontalPosition: "center",
                nextSelector: "#domain-next",
                previousSelector: "#domain-previous"
              });
            },1000);
          });
        }
      }
);

heatmap_data = {};

myapp.controller('day_ctrl', function ($scope, $http, $q, $window) {
  // get data
  year2010 = $http.get('./data/2010/total_heatmap.json'),
  year2011 = $http.get('./data/2011/total_heatmap.json'),
  year2012 = $http.get('./data/2012/total_heatmap.json'),
  year2013 = $http.get('./data/2013/total_heatmap.json'),
  year2014 = $http.get('./data/2014/total_heatmap.json');

  tmp_data = {};

  $q.all([year2010, year2011, year2012, year2013, year2014]).then(function(result) {
    angular.forEach(result, function(response) {

      tmp = response.data;
      for(k in tmp) {
        tmp_data[k] = tmp[k];
      }
    });
    return tmp_data;
  }).then(function draw_chart(tmp_data){
    heatmap_data = tmp_data;
    console.log(Object.keys(heatmap_data).length);
    w = angular.element($window).width() / 73;
    cal = new CalHeatMap();
    cal.init({
      itemSelector: "#daymap",
      start: new Date(2014, 0),
      domain: "year",
      // domain: "day",
      subDomain: "day",
      // rowLimit: 7,
      cellSize: w,
      data: heatmap_data,
      // subDomainTextFormat: "%d",
      range: 1,
      weekStartOnMonday: true,
      // domainGutter: 10,
      // cellpadding: 4,
      displayLegend: true,
      // verticalOrientation: true
      afterLoadData: parser,
      legend: [110,120,121,122],
      legendHorizontalPosition: "center",
      nextSelector: "#domain-next",
      previousSelector: "#domain-previous"
    });
  });

});

var parser = function(data) {
  var stats = {};
  for (var d in data) {
    // console.log(Math.round(Math.log(data[d])*10));
    stats[d] = Math.round(Math.log(data[d])*10);
  }
  return stats;
};
