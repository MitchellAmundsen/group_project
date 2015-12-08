'use strict';

angular.module('PoliticalApp', ['ui.router', 'ui.bootstrap', 'twitter.timeline', 'firebase'])
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

.controller('PollCtrl', ['$scope', '$firebaseObject', '$firebaseArray', '$firebaseAuth', function($scope, $firebaseObject, $firebaseArray, $firebaseAuth) {
	var ref = new Firebase("https://politweets.firebaseio.com/");
	var pollRef = ref.child("polls");

	$scope.polls = $firebaseArray(pollRef);

	
	$scope.addPoll = function() {
		$scope.polls.$add({
			pollName: $scope.pollHeader,
			choices: [{
				text: $scope.choice1,
				value: 0
			}, {
				text: $scope.choice2,
				value: 0
			}, {
				text: $scope.choice3,
				value: 0
			}, {
				text: $scope.choice4,
				value: 0
			}]
		})
	}

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

	var candidateData = {
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
	};

	// grab CandidateData
	$http.get('data/candidates.json').then(function(response) {
 		$scope.candidates = response.data;
 	});

 	// $http.get('http://elections.huffingtonpost.com/pollster/api/polls/2016-national-democratic-primary').then(function(response){
 	// 	$scope.democraticPoll = response.data;
 	// })

 	// $http.get('http://elections.huffingtonpost.com/pollster/api/polls/2016-national-gop-primary').then(function(response){
 	// 	$scope.republicanPoll = response.data;
 	// })

	// $http.get('http://elections.huffingtonpost.com/pollster/api/polls.json').then(function (response){
	// 	$scope.pollData = response.data;
	// });

	$http.get('data/polls.json').then(function(response) {
		$scope.pollData = response.data;
		console.log($scope.pollData);
	});

 	


}])
.config(function($urlRouterProvider){
    // if the path doesn't match any of the urls you configured
    // otherwise will take care of routing the user to the specified url
    $urlRouterProvider.otherwise('/');
})