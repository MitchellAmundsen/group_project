'use strict';

angular.module('PoliticalApp', ['ui.router', 'ui.bootstrap'])
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
.controller('FeedCtrl', ['$scope', '$http', function($scope, $http) {

}])

.controller('PollCtrl', ['$scope', '$http', function($scope, $http) {


}])

.controller('StatisticsCtrl', ['$scope', '$http', function($scope, $http) {
	// want to find a way where buttons change values appearring on chart

	var percentGraph = $("#percentages").get(0).getContext("2d");
	var candidateBar = $("#candidates").get(0).getContext("2d");

	var percentData = [
		{
			// import candidate values and name via API
			// each object is slice of pie/doughnut chart
			value: 230,
			color: "cornflowerblue",
			highlight: "lightskyblue",
			label: "Candidate 1"
		},
		{
			value: 170,
			color: "red",
			highlight: "#D64343",
			label: "Candidate 2"
		},
		{
			value: 100,
			color: "grey",
			highlight: "#9A9A9A",
			label: "Candidate 3"
		}
	];

	var candidateData = [
		labels: ["Bernie Sanders", "Hilary Clinton", "Donald Trump", "Ted Cruz", "Marco Rubio"],
		datasets: [
			{
				label: "Poll Numbers",
				// all colors should be changed to more appropriate political colors
				fillColor: "#FF782B",
				strokeColor: "#FF5D00",
				highlightFill: "#FF9A41",
				highlightStroke: "#FF902F",
				// values dependent on api
				data: [93, 93, 37, 57, 74]
			},
			{
				// Need another value not percentage can add additional
				label: "Corporate Funding",
				fillColor: "#416EFF",
				strokeColor: "#003CFF",
				highlightFill: "#66C7FF",
				highlightStroke: "#00A2FF",
				data: [71, 94, 10, 18, 39]
			}
		]
	]

}])
.config(function($urlRouterProvider){
    // if the path doesn't match any of the urls you configured
    // otherwise will take care of routing the user to the specified url
    $urlRouterProvider.otherwise('/');
})