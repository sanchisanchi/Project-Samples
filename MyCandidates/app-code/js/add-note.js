	<!--Creates a Note.-->
/**	 $(document).ready(function(){
			$('#link').click(function(){
			var txt1=$("<strong></strong>").text("Text");
				
				$('#event').prepend('<li>\
				<div class="row">\
					<div id="date" class="large-6 small-6 columns">\
						11-23-2013\
					</div>\
					<div class="large-6 small-6 columns">\
					   Saul O-Neal\
					</div>\
				</div>\
				<div class="row">\
					<div id="check" class="large-6 small-6 columns">\
					</div>\
				</li>');
				var today = new Date();
				var dd = today.getDate();
				var mm = today.getMonth()+1; //January is 0!

				var yyyy = today.getFullYear();
				if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm} var today = dd+'/'+mm+'/'+yyyy;
				document.getElementById("date").value = today;				
				document.getElementById("check").innerHTML = $("#test").val();
			});		
		});		*/
		
		function limitText(limitField, limitCount, limitNum) {
			if (limitField.value.length > limitNum) {
				limitField.value = limitField.value.substring(0, limitNum);
			} else {
				limitCount.value = limitNum - limitField.value.length;
			}
		}