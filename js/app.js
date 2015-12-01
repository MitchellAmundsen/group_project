'use strict';

angular.module('PoliticalApp', ['ngSanitize', 'ui.router', 'ui.bootstrap'])
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
