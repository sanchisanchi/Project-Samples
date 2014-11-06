//**************************************************************//

// Load the Visualization API and the piechart package.
google.load('visualization', '1.0', {'packages':['corechart']});

/*
// Set a callback to run when the Google Visualization API is loaded.
google.setOnLoadCallback(drawChart);

// Callback that creates and populates a data table, 
// instantiates the pie chart, passes in the data and
// draws it.
function drawChart() {	  
	// Create the data table.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'NumberOfCandidates');
    data.addColumn('number', 'Total');
    data.addRows([
		['Undecided', 67],
        ['Considered', 30],
        ['Rejected', 80], 
        ['Hired', 14],          
    ]);

    // Set chart options
    var options = {legend: {position: 'none'}};
 
    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.BarChart(document.getElementById('883700'));

    function selectHandler() {
        var selectedItem = chart.getSelection()[0];
        if (selectedItem) {   
			var barName = data.getValue(selectedItem.row, 0);
			
			if (barName== undecided )
			{
				//openCandidateUndecided();	
			}
			
			if (barName== considered )
			{
				//openCandidateConsidered();	
			}
			
			if (barName== rejected )
			{
				//openCandidateRejected();	
			}

			if (barName== hired )
			{
				//openCandidateHired();	
			}			
            //alert('The user selected ' + barName);			
        }
     }

    google.visualization.events.addListener(chart, 'select', selectHandler);    
    chart.draw(data, options);
}

//**************************************************************/


//*****************FOR GOOGLE CHART*********************************************//

function openCandidateUndecided()
{
	window.open("candidate-list.html","_self")
}

function openCandidateConsidered()
{
	window.open("candidate-list.html","_self")
}
	
function openCandidateRejected()
{
	window.open("candidate-list.html","_self")
}
	
function openCandidateHired()
{
	window.open("candidate-list.html","_self")
}