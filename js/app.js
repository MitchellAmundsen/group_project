'use strict';

angular.module('PoliticalApp', ['ui.router', 'ui.bootstrap', 'twitter.timeline'])
.config(function($stateProvider){
	$stateProvider
		.state('politicalfeed', {
			url: '/', //"root" directory
			templateUrl: 'partials/politicalfeed.html',
			controller: 'FeedCtrl'
		})
		.state('poll', {
			url: '/poll',
			templateUrl: 'partials/poll.html',
			controller: 'PollCtrl'
		})	
		.state('statistics', {
			url: '/statistics/{id}',
			templateUrl: 'partials/statistics.html',
			controller: 'StatisticsCtrl'
		})

})
.controller('FeedCtrl', ['$scope', '$http', '$window', function($scope, $http, $window) {
	//need to figure out how to get widget to always appear upon state change...refreshing page works?
	//$window.location.reload();
	console.log($scope.politician);

}])

.controller('PollCtrl', ['$scope', '$http', function($scope, $http) {

}])

.controller('StatisticsCtrl', ['$scope', '$http', function($scope, $http) {

}])
.config(function($urlRouterProvider){
    // if the path doesn't match any of the urls you configured
    // otherwise will take care of routing the user to the specified url
    $urlRouterProvider.otherwise('/');
})