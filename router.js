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
    .when('/chart', {
      controller:'dataCtrl',
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

myapp.controller('ListCtrl', function ($scope) {
});

myapp.controller('dataCtrl', function ($scope, $q, $http) {

    $scope.getjsondata = function() {
        return $scope.jsondata;
    };

    title = ['x', '0-0-01', '0-0-02', '0-0-03', '0-0-04', '0-0-05', '0-0-06',
             '0-0-07', '0-0-08', '0-0-09', '0-0-10', '0-0-11', '0-0-12'];
    chart_data_total = [title];
    chart_data_red = [title];
    chart_data_orange = [title];
    
    year2010 = $http.get('./data/2010/average.json'),
    year2011 = $http.get('./data/2011/average.json'),
    year2012 = $http.get('./data/2012/average.json'),
    year2013 = $http.get('./data/2013/average.json'),
    year2014 = $http.get('./data/2014/average.json');


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
                      },
                      axis: {
                        x: {
                          type: 'timeseries',
                          tick: {
                            format: '%d'
                          }
                        }
                      }

                  });
      setTimeout(function () {
          chart_total.xgrids([{value: '0-0-02', text:'年假'}]);
      }, 2000);
      setTimeout(function () {
          chart_total.xgrids([{value: '0-0-08', text:'2014 高雄氣爆'}]);
      }, 6000);
      setTimeout(function () {
          chart_total.xgrids.remove([{value: '0-0-02'}]);
      }, 5000);
      setTimeout(function () {
          chart_total.xgrids.remove();
      }, 10000);
      var chart_red = c3.generate({
                      bindto: '#chart_red',
                      data: {
                            x: 'x',
                        columns: tmp_data[1]
                      },
                      axis: {
                        x: {
                          type: 'timeseries',
                          tick: {
                            format: '%d'
                          }
                        }
                      }
                  });
      var chart_orange = c3.generate({
                      bindto: '#chart_orange',
                      data: {
                            x: 'x',
                        columns: tmp_data[2]
                      },
                      axis: {
                        x: {
                          type: 'timeseries',
                          tick: {
                            format: '%d'
                          }
                        }
                      }
                  });
      
    });

});
