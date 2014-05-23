var aCount = 0;
var esender;
var asender;

function checkLength( o, n, min, max ) {
	if ( o.val().length > max || o.val().length < min ) {
		o.addClass( "ui-state-error" );
		updateTips( "Р”Р»РёРЅР° " + n + " РґРѕР»РЅР° Р±С‹С‚СЊ РѕС‚ " + min + " РґРѕ " + max + " СЃРёРјРІРѕР»РѕРІ." );
		return false;
	} else {
		return true;
	}
}
function checkRegexp( o, regexp, n ) {
	if ( !( regexp.test( o.val() ) ) ) {
		o.addClass( "ui-state-error" );
		updateTips( n );
		return false;
	} else {
		return true;
	}
}
function updateTips( t ) {
	$(".validateTips")
		.html( t )
		.addClass( "ui-state-highlight" );
	setTimeout(function() {
					$(".validateTips").removeClass( "ui-state-highlight", 1500 );
				}
	, 500 );
}

function loadPanel () {
					$.get('/users/form/userpanel.html', function(data,status,x) { 
							$('div#menu div#menucontent').html(data);
							$('#userpanel a').button();
							$('#menu .handle').click();
							$('a#logout').on('click', logout);
							$('form').on('submit', fsubmit);
					})
}
function fsubmit () {
    send = $(this).serialize();
	if ($(this).prop('id') == 'sms') {
				$.get("/users/activate.act",$('#sms').serialize(), function (resp){
					loadPanel ();
				})
	}
	else 	
	if ($(this).prop('id') == 'login') {
		$.getJSON("/users/validate.act",$( "#login" ).serialize(), function (resp){
			$(resp["tpl"]).dialog();
			if (resp["isValid"] === 1) 
			{
				$.get('/users/form/userpanel.html', function(data,status,x) { 
						loadPanel ();
					}
				)
			}
		});
	}
	else 
	if ($(this).prop('id') == 'reg') 
	{
		var name = $( "form#reg #iName" ),
			login = $( "form#reg #iLogin" ),
			password = $( "form#reg #iPass" ),
			email = $( "form#reg #iMail" ),
			mphone = $( "form#reg #iPhone" ),
			allFields = $( [] ).add( name ).add( login ).add( password ).add(email).add(mphone),
			tips = $( ".validateTips" );
		
		esender = $(this);
		var bValid = true;
		allFields.removeClass( "ui-state-error" );
		$(".validateTips").text( "Р’СЃРµ РїРѕР»СЏ РѕР±СЏР·Р°С‚РµР»СЊРЅС‹ РґР»СЏ Р·Р°РїРѕР»РЅРµРЅРёСЏ" ) ;
		bValid = bValid && checkRegexp( name, /^([\D])+$/i, "РРјСЏ РјРѕР¶РµС‚ СЃРѕРґРµСЂР¶Р°С‚СЊ С‚РѕР»СЊРєРѕ Р±СѓРєРІС‹ Рё РЅРµ РјРѕР¶РµС‚ Р±С‹С‚СЊ РїСѓСЃС‚С‹Рј." );
		bValid = bValid && checkLength( login, "Р›РѕРіРёРЅР°", 3, 16 );
		bValid = bValid && checkRegexp( login, /^([\D0-9])+$/i, "Р›РѕРіРёРЅ РјРѕР¶РµС‚ СЃРѕРґРµСЂР¶Р°С‚СЊ С‚РѕР»СЊРєРѕ Р±СѓРєРІС‹ Рё С†РёС„СЂС‹ Рё РЅРµ РјРѕР¶РµС‚ Р±С‹С‚СЊ РїСѓСЃС‚С‹Рј." );
		bValid = bValid && checkLength( password, "РџР°СЂРѕР»СЏ", 5, 16 );
		bValid = bValid && checkRegexp( password, /^(\w)+$/, "РџР°СЂРѕР»СЊ РјРѕР¶РµС‚ СЃРѕРґРµСЂР¶Р°С‚СЊ: A-Z a-z 0-9 _ " );
		bValid = bValid && checkLength( email, "E-Mail", 6, 80 );
		bValid = bValid && checkRegexp( email, /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i, "РќР°РїСЂРёРјРµСЂ: user@ebubet.com" );
		bValid = bValid && checkRegexp( mphone, /^\+([0-9])+$/i, "РќРѕРјРµСЂ С‚РµР»РµС„РѕРЅР° РґРѕР»Р¶РµРЅ РёРјРµС‚СЊ РІРёРґ +79999999999" );
		bValid = bValid && $("#iAge").prop('checked');
		if (!$("#iAge").prop('checked')) updateTips("Р”Р»СЏ СЂРµРіРёСЃС‚СЂР°С†РёРё РЅР° СЃР°Р№С‚Рµ Р’С‹ РґРѕР»Р¶РЅС‹ Р±С‹С‚СЊ СЃРѕРІРµСЂС€РµРЅРЅРѕР»РµС‚РЅРёРј.");
		// From jquery.validate.js (by joern), contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
		if (!bValid) return false;
								$.ajax({
									dataType: "json",
									url: "/users/adduser.html",
									data: $(this).serialize(),
									success: function (resp){
										if (resp.result =="Ok") {
											loadPanel();
										} else {
											
										}
									}
								});
		
		
		
		
		
/*		$.getJSON("/users/authcode.html", $("#iPhone").serialize(), function (r, status, x){
			if (r.Ok.length == 0) {
				alert(r.Error[0])
			}
			else 
			{
				$.get('/service/form/authcode.html',function (a) {
					$(a).dialog({
						show: { effect: "fold"} ,
						hide: { effect: "fold"} ,
						draggable: false,
						modal: true,
						buttons: {
							"РћС‚РїСЂР°РІРёС‚СЊ": function(){
								asender = $(this);
								//$.getJSON("/users/checkcode.html",$( "#iSMSCode" ).serialize(), function (resp){
									
								var s = $( "#iSMSCode" ).serialize()+"&"+$( "#reg" ).serialize();
								$.ajax({
									dataType: "json",
									url: "/users/adduser.html",
									data: s,
									success: function (resp){
										if (resp.result === "Ok") {
											$(".btnLogin").toggleClass("btnLogin").toggleClass("btnLogout");
											asender.dialog( "close" );
											asender.remove();
											$(".validateTips").text("Р’С‹ СѓСЃРїРµС€РЅРѕ Р·Р°СЂРµРіРµСЃС‚СЂРёСЂРѕРІР°Р»РёСЃСЊ");
											$(".ui-dialog-buttonpane button:contains('РћРє')").button("disable");
											setTimeout(function () {
												esender.dialog( "close" );
												esender.remove();
											}, 10000);
										} else {
											if (resp.result === "N") {
												asender.dialog( "close" );
												asender.remove();
												updateTips("Р’С‹ С‚СЂРёР¶РґС‹ РѕС€РёР±Р»РёСЃСЊ РїСЂРё РІРІРѕРґРµ РєРѕРґР° sms");
											} else {
												$(".smsTips").text("Р’С‹ РѕС€РёР±Р»РёСЃСЊ РїСЂРё РІРІРѕРґРµ РєРѕРґР° sms. РћСЃС‚Р°Р»РѕСЃСЊ РїРѕРїС‹С‚РѕРє: " + resp.result);
											}
										}
									}
								});
							},
							"РћС‚РјРµРЅР°": function() {
								$(this).dialog( "close" );
								$(this).remove();
								/*esender.dialog( "close" );
								esender.remove();* /
							},
				
						},
				//							title: 'SMS РєРѕРґ',
						width: 400
					})
				})
			}
		});*/
	}
	
    return false;
};

function logout () {
	$('#menu .handle').click();
	if (currentPopup != null) currentPopup._source.closePopup();
	$.get("/service/form/logout.html", function (data){
		$(data).dialog({
			show: { effect: "fold"} ,
			hide: { effect: "fold"} ,
			modal: true,
			buttons: {
				"Р’С‹С…РѕРґ": function(){
					$.get("/users/logout.html");
					$.cookie("logined", "");
					
					$(".btnLogout").toggleClass("btnLogin").toggleClass("btnLogout");
					$(this).dialog( "close" );
					$(this).remove();
				$.get('/users/form/userpanel.html', function(data,status,x) { 
						$('div#menu div#menucontent').html(data);
						$('form').on('submit', fsubmit);
					})
				},
				"РћС‚РјРµРЅР°": function() {
					$(this).dialog( "close" );
					$(this).remove();
				},

			},
			title: 'Р’С‹С…РѕРґ РёР· РїСЂРѕС„РёР»СЏ',
			width: 400
		});
	})
}
$('a#logout').on('click', logout);
$('form').on('submit', fsubmit);